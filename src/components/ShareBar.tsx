/* eslint-disable @next/next/no-img-element */
"use client";

import QRCode from "qrcode";
import { Copy, QrCode, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button, ButtonLink } from "@/components/ui/Button";
import { blobToDataUrl, cropCell } from "@/lib/crop";
import { getConvexClient } from "@/lib/convexClient";
import type { PublicCard } from "@/types/card";

function ownedToken(slug: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const owned = JSON.parse(localStorage.getItem("popca:owned") ?? "[]") as Array<{ slug: string; editToken: string }>;
    return owned.find((item) => item.slug === slug)?.editToken ?? null;
  } catch {
    return null;
  }
}

async function uploadToConvex(blob: Blob) {
  const client = getConvexClient();
  if (!client) return null;
  const uploadUrl = await client.mutation(api.cards.generateUploadUrl, {});
  const response = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": blob.type || "image/png" }, body: blob });
  if (!response.ok) throw new Error("Convex storage upload failed");
  return (await response.json()).storageId as string;
}

async function loadImage(src: string) {
  const image = new Image();
  if (!src.startsWith("data:") && !src.startsWith("blob:")) image.crossOrigin = "anonymous";
  image.src = src;
  await image.decode();
  return image;
}

export function ShareBar({ card }: { card: PublicCard }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [repairStatus, setRepairStatus] = useState<string | null>(null);
  const url = useMemo(() => (typeof window === "undefined" ? `/c/${card.slug}` : `${window.location.origin}/c/${card.slug}`), [card.slug]);

  useEffect(() => {
    setToken(ownedToken(card.slug));
    QRCode.toDataURL(url, { width: 180, margin: 1, color: { dark: "#020617", light: "#ffffff" } }).then(setQr).catch(() => setQr(null));
    const client = getConvexClient();
    if (client) void client.mutation(api.cards.incrementViews, { slug: card.slug });
    else void fetch(`/api/cards/${card.slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "incrementViews" }) });
  }, [card.slug, url]);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard permission can be unavailable in automated browsers; the share URL remains visible via QR/link.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function repairImage() {
    if (!token || !card.compositeUrl || repairing) return;
    setRepairing(true);
    setRepairStatus(null);
    try {
      const image = await loadImage(card.compositeUrl);
      const cropped = await cropCell(image, card.cellIndex);
      const client = getConvexClient();
      if (client) {
        const cardImageId = await uploadToConvex(cropped);
        if (!cardImageId) throw new Error("Convex repair upload failed");
        await client.mutation(api.cards.replaceCardImage, { slug: card.slug, editToken: token, cardImageId: cardImageId as Id<"_storage"> });
      } else {
        const cardImageUrl = await blobToDataUrl(cropped);
        const response = await fetch(`/api/cards/${card.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "replaceCardImage", editToken: token, cardImageUrl }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "복구에 실패했어요");
      }
      setRepairStatus("명함 이미지를 원본 보드에서 다시 잘라 복구했어요.");
      router.refresh();
    } catch (error) {
      setRepairStatus(error instanceof Error ? error.message : "복구에 실패했어요");
    } finally {
      setRepairing(false);
    }
  }

  async function remove() {
    if (!token) return;
    const client = getConvexClient();
    if (client) await client.mutation(api.cards.remove, { slug: card.slug, editToken: token });
    else await fetch(`/api/cards/${card.slug}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ editToken: token }) });
    router.push("/gallery");
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[.05] p-5" data-testid="share-bar">
      <div className="flex flex-wrap gap-3">
        <Button onClick={copy}><Copy className="mr-2 size-4" /> 링크 복사</Button>
        <ButtonLink href="/gallery" variant="secondary"><QrCode className="mr-2 size-4" /> 갤러리에서 보기</ButtonLink>
        {token && card.compositeUrl ? <Button variant="secondary" onClick={repairImage} disabled={repairing}><RotateCcw className="mr-2 size-4" /> {repairing ? "복구 중..." : "이미지 복구"}</Button> : null}
        {token ? <Button variant="danger" onClick={remove}><Trash2 className="mr-2 size-4" /> 삭제</Button> : null}
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-bold text-cyan-200">{repairStatus ?? (copied ? "짧은 링크가 복사됐어요." : "링크 복사 준비 완료")}</p>
      {qr ? <img src={qr} alt="공유 QR 코드" className="mt-5 rounded-2xl bg-white p-2" /> : null}
    </div>
  );
}
