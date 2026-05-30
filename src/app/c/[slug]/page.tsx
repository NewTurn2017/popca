import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card3D } from "@/components/Card3D";
import { ShareBar } from "@/components/ShareBar";
import { ButtonLink } from "@/components/ui/Button";
import { getPublicCard } from "@/lib/serverCards";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = await getPublicCard(slug);
  if (!card) return { title: "팝카를 찾을 수 없어요" };
  return {
    title: `${card.name}의 팝카`,
    description: `${card.brand} · ${card.title || card.styleName}`,
    openGraph: { title: `${card.name}의 팝카`, description: card.brand, images: [card.cardImageUrl] },
    twitter: { card: "summary_large_image", title: `${card.name}의 팝카`, images: [card.cardImageUrl] },
  };
}

export default async function CardPage({ params }: Props) {
  const { slug } = await params;
  const card = await getPublicCard(slug);
  if (!card) notFound();
  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex items-center justify-between"><Link href="/" className="text-xl font-black">POPCA</Link><ButtonLink href="/create" variant="secondary">나도 만들기</ButtonLink></nav>
        <section className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <Card3D card={card} />
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[.05] p-6">
              <p className="text-sm font-bold text-cyan-200">{card.styleName}</p>
              <h1 className="mt-3 text-5xl font-black" data-testid="card-name">{card.name}</h1>
              <p className="mt-2 text-xl text-slate-300">{card.title || card.brand}</p>
              <p className="mt-5 text-slate-400">{[card.handle, card.website].filter(Boolean).join(" · ")}</p>
              <p className="mt-5 text-sm text-slate-500">조회 {card.views}회 · /c/{card.slug}</p>
            </div>
            <ShareBar card={card} />
          </div>
        </section>
      </div>
    </main>
  );
}
