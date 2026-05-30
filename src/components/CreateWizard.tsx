/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ConceptBoard } from "@/components/ConceptBoard";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { blobToDataUrl, cropCell } from "@/lib/crop";
import { getConvexClient } from "@/lib/convexClient";
import { makeEditToken, makeSlug } from "@/lib/slug";
import { styleFor } from "@/lib/styles";
import type { CardInput } from "@/types/card";

const emptyInfo: CardInput = { brand: "", name: "", title: "", handle: "", website: "" };

type Step = 1 | 2 | 3 | 4 | 5;

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, data] = dataUrl.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? "image/png";
  const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

async function uploadToConvex(blob: Blob) {
  const client = getConvexClient();
  if (!client) return null;
  const uploadUrl = await client.mutation(api.cards.generateUploadUrl, {});
  const response = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": blob.type || "image/png" }, body: blob });
  if (!response.ok) throw new Error("Convex storage upload failed");
  return (await response.json()).storageId as string;
}

export function CreateWizard() {
  const [step, setStep] = useState<Step>(1);
  const [info, setInfo] = useState<CardInput>(emptyInfo);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [compositeSrc, setCompositeSrc] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const canContinue = useMemo(() => info.brand.trim().length > 0 && info.name.trim().length > 0, [info]);

  function update<K extends keyof CardInput>(key: K, value: CardInput[K]) {
    setInfo((current) => ({ ...current, [key]: value }));
  }

  function chooseLogo(file: File | null) {
    setLogo(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("info", JSON.stringify(info));
      if (logo) form.set("logo", logo);
      const response = await fetch("/api/generate", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "생성에 실패했어요");
      setCompositeSrc(`data:image/png;base64,${data.b64_json}`);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성에 실패했어요");
    } finally {
      setBusy(false);
    }
  }

  async function save(index: number) {
    if (savingRef.current) return;
    savingRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const image = new Image();
      image.src = compositeSrc!;
      await image.decode();
      const cropped = await cropCell(image, index);
      const cardImageUrl = await blobToDataUrl(cropped);
      const editToken = makeEditToken();
      const style = styleFor(index);
      const client = getConvexClient();
      let slug = makeSlug();
      if (client) {
        const cardImageId = await uploadToConvex(cropped);
        if (!cardImageId) throw new Error("Convex card upload failed");
        const compositeId = compositeSrc ? await uploadToConvex(dataUrlToBlob(compositeSrc)) : undefined;
        const logoId = logo ? await uploadToConvex(logo) : undefined;
        await client.mutation(api.cards.createCard, {
          slug,
          editToken,
          ...info,
          ...style,
          cellIndex: index,
          cardImageId: cardImageId as Id<"_storage">,
          compositeId: compositeId as Id<"_storage"> | undefined,
          logoId: logoId as Id<"_storage"> | undefined,
        });
      } else {
        const response = await fetch("/api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, editToken, ...info, ...style, cellIndex: index, cardImageUrl, compositeUrl: compositeSrc ?? undefined, logoUrl: logoPreview ?? undefined }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "저장에 실패했어요");
        slug = data.slug;
      }
      const owned = JSON.parse(localStorage.getItem("popca:owned") ?? "[]") as Array<{ slug: string; editToken: string }>;
      localStorage.setItem("popca:owned", JSON.stringify([...owned.filter((item) => item.slug !== slug), { slug, editToken }]));
      setStep(5);
      window.location.assign(`/c/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요");
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-10 text-white">
      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-slate-400" aria-label="생성 단계">
        {["정보", "로고", "생성", "선택", "완료"].map((label, index) => (
          <span key={label} className={`rounded-full px-3 py-1 ${step === index + 1 ? "bg-cyan-300 text-slate-950" : "bg-white/8"}`}>{index + 1}. {label}</span>
        ))}
      </div>

      {error ? <div role="alert" className="mb-5 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-rose-100">{error}</div> : null}

      {step === 1 && (
        <div className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[.04] p-6 shadow-2xl md:grid-cols-2">
          <div className="md:col-span-2"><h1 className="text-3xl font-black">내 정보만 넣으면 팝카가 딸깍.</h1><p className="mt-2 text-slate-400">브랜드와 이름은 필수, 나머지는 3D 카드 뒷면에서 보강됩니다.</p></div>
          <label>브랜드<TextInput aria-label="브랜드" value={info.brand} onInput={(e) => update("brand", e.currentTarget.value)} onChange={(e) => update("brand", e.target.value)} placeholder="POPCA Studio" /></label>
          <label>이름<TextInput aria-label="이름" value={info.name} onInput={(e) => update("name", e.currentTarget.value)} onChange={(e) => update("name", e.target.value)} placeholder="김팝카" /></label>
          <label>타이틀<TextInput aria-label="타이틀" value={info.title} onInput={(e) => update("title", e.currentTarget.value)} onChange={(e) => update("title", e.target.value)} placeholder="Creative Developer" /></label>
          <label>핸들<TextInput aria-label="핸들" value={info.handle} onInput={(e) => update("handle", e.currentTarget.value)} onChange={(e) => update("handle", e.target.value)} placeholder="@popca" /></label>
          <label className="md:col-span-2">웹사이트<TextInput aria-label="웹사이트" value={info.website} onInput={(e) => update("website", e.currentTarget.value)} onChange={(e) => update("website", e.target.value)} placeholder="popca.site" /></label>
          <Button className="md:col-span-2" disabled={!canContinue} onClick={() => setStep(2)}>다음: 로고 선택</Button>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-[2rem] border border-white/10 bg-white/[.04] p-6">
          <h1 className="text-3xl font-black">로고가 있으면 더 브랜드답게.</h1>
          <p className="mt-2 text-slate-400">PNG/JPG를 넣거나 바로 건너뛸 수 있어요.</p>
          <label className="mt-6 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-black/20 p-6 text-center hover:border-cyan-300/70">
            <input aria-label="로고 업로드" type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(e) => chooseLogo(e.target.files?.[0] ?? null)} />
            {logoPreview ? <img src={logoPreview} alt="로고 미리보기" className="max-h-40 rounded-2xl" /> : <span>로고 파일 선택</span>}
          </label>
          <div className="mt-6 flex gap-3"><Button variant="secondary" onClick={() => setStep(1)}>이전</Button><Button onClick={() => setStep(3)}>다음: 생성</Button></div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-[2rem] border border-white/10 bg-white/[.04] p-6 text-center">
          <h1 className="text-3xl font-black">6종 콘셉트를 생성합니다.</h1>
          <p className="mx-auto mt-2 max-w-xl text-slate-400">gpt-image-2가 2×3 보드를 만들고, TEST 모드에서는 픽스처로 즉시 검증합니다.</p>
          <div className="mx-auto my-8 h-64 max-w-md animate-pulse rounded-[2rem] bg-gradient-to-br from-cyan-300/30 via-fuchsia-400/20 to-orange-300/20" />
          <div className="flex justify-center gap-3"><Button variant="secondary" onClick={() => setStep(2)}>이전</Button><Button onClick={generate} disabled={busy}>{busy ? "생성 중..." : "딸깍 생성"}</Button></div>
        </div>
      )}

      {step === 4 && compositeSrc && (
        <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <ConceptBoard imageSrc={compositeSrc} selectedIndex={selectedIndex} onSelect={(index) => { setSelectedIndex(index); void save(index); }} />
          </div>
          <aside className="rounded-[2rem] border border-white/10 bg-white/[.04] p-6">
            <h2 className="text-2xl font-black">번호를 고르면 바로 3D 공유 페이지가 만들어져요.</h2>
            <p className="mt-3 text-slate-400">선택한 칸은 브라우저 캔버스로 크롭되어 저장됩니다.</p>
            <Button className="mt-6 w-full" disabled={selectedIndex === null || busy} onClick={() => selectedIndex !== null && save(selectedIndex)}>{busy ? "저장 중..." : "선택 저장"}</Button>
          </aside>
        </div>
      )}

      {step === 5 && <div className="rounded-[2rem] border border-white/10 bg-white/[.04] p-10 text-center"><h1 className="text-3xl font-black">공유 페이지로 이동 중...</h1></div>}
    </section>
  );
}
