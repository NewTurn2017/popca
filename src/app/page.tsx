/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Sparkles, Share2, Wand2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { listPublicCards } from "@/lib/serverCards";

export const dynamic = "force-dynamic";
export default async function Home() {
  const cards = await listPublicCards(6);
  return (
    <main className="min-h-screen overflow-hidden px-5 py-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/[.04] px-5 py-3 backdrop-blur">
        <Link href="/" className="text-xl font-black tracking-tight">POPCA</Link>
        <div className="flex gap-2"><ButtonLink href="/gallery" variant="ghost">갤러리</ButtonLink><ButtonLink href="/create">만들기</ButtonLink></div>
      </nav>
      <section className="mx-auto grid max-w-6xl items-center gap-10 py-20 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="inline-flex rounded-full border border-cyan-200/25 bg-cyan-200/10 px-4 py-2 text-sm font-bold text-cyan-100">로그인 없이, 정보만 넣으면 딸깍</p>
          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight md:text-7xl">입체로 살아나는<br />내 디지털 명함.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">gpt-image-2가 6종 콘셉트를 한 장에 만들고, 원하는 번호를 고르면 three.js 3D 공유 페이지와 wasee-gallery 보드까지 즉시 완성됩니다.</p>
          <div className="mt-8 flex flex-wrap gap-3"><ButtonLink href="/create">팝카 만들기</ButtonLink><ButtonLink href="/gallery" variant="secondary">갤러리 보기</ButtonLink></div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[['6종 콘셉트', Wand2], ['3D 플립카드', Sparkles], ['짧은 링크 공유', Share2]].map(([label, Icon]) => <div key={String(label)} className="rounded-3xl border border-white/10 bg-white/[.04] p-4"><Icon className="mb-3 size-5 text-cyan-200" /><b>{String(label)}</b></div>)}
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <div className="absolute inset-8 rounded-[3rem] bg-gradient-to-br from-cyan-300/30 via-fuchsia-400/20 to-orange-300/20 blur-3xl" />
          <div className="relative grid rotate-[-3deg] grid-cols-2 gap-4 rounded-[2rem] border border-white/10 bg-slate-900/90 p-5 shadow-2xl">
            {cards.length > 0
              ? cards.map((card) => (
                  <div key={card.slug} className="aspect-[2/1] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-950">
                    <img src={card.cardImageUrl} alt={`${card.name} 팝카`} className="h-full w-full object-cover" />
                  </div>
                ))
              : Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="aspect-[2/1] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-950">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(103,232,249,.55),transparent_35%),linear-gradient(135deg,#0f172a,#312e81)]" />
                  </div>
                ))}
          </div>
        </div>
      </section>
    </main>
  );
}
