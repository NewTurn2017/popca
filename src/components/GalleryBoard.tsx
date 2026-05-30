"use client";
/* eslint-disable @next/next/no-img-element */

import "wasee-gallery/styles.css";
import { WaseeGallery } from "wasee-gallery/react";
import type { WaseeItem, WaseeLayoutItem } from "wasee-gallery";
import Link from "next/link";
import type { PublicCard } from "@/types/card";

type PopcaItem = WaseeItem & { metadata: { slug: string; accent: string; views: number } };

export function cardsToItems(cards: PublicCard[]): PopcaItem[] {
  return cards.map((card) => ({
    id: card.slug,
    title: card.name,
    description: `${card.handle || "@popca"} · ${card.brand}`,
    thumbnailSrc: card.cardImageUrl,
    detailSrc: card.cardImageUrl,
    alt: `${card.name}의 ${card.styleName} 팝카`,
    metadata: { slug: card.slug, accent: card.accent, views: card.views },
  }));
}

export function tessellatedLayout(items: WaseeItem[]): WaseeLayoutItem<WaseeItem>[] {
  const columns = 4;
  const width = 190;
  const gap = 18;
  return items.map((item, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const lift = col % 2 === 0 ? 0 : 52;
    return { id: item.id, item, x: col * (width + gap), y: row * 260 + lift, width, height: 238, cluster: "tessellated" };
  });
}

function popcaMeta(item: WaseeItem) {
  const metadata = item.metadata as PopcaItem["metadata"] | undefined;
  return metadata ?? { slug: String(item.id), accent: "#67e8f9", views: 0 };
}

export function GalleryBoard({ cards }: { cards: PublicCard[] }) {
  const items = cardsToItems(cards);
  if (items.length === 0) {
    return <div className="rounded-[2rem] border border-white/10 bg-white/[.04] p-10 text-center text-slate-300">아직 갤러리에 명함이 없어요. 첫 팝카를 만들어보세요.</div>;
  }
  return (
    <div className="popca-wasee rounded-[2rem] border border-white/10 bg-slate-950/70 p-3" data-layout="tessellated" data-testid="gallery-board">
      <WaseeGallery
        items={items}
        layout={tessellatedLayout}
        layoutOptions={{ itemWidth: 180, gap: 12, columns: 12 }}
        searchable
        height={720}
        searchPlaceholder="이름, 브랜드, 핸들 검색"
        modalLabel="팝카 상세"
        getSearchText={(item) => [item.title, item.description, item.id].filter(Boolean).join(" ")}
        renderThumbnail={({ item }) => (
          <div className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            <img src={item.thumbnailSrc} alt={item.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
              <p className="font-black">{item.title}</p><p className="text-xs text-slate-300">{item.description}</p>
            </div>
          </div>
        )}
        renderDetail={({ item, close }) => (
          <div className="grid gap-6 text-white md:grid-cols-[.9fr_1fr]">
            <img src={item.detailSrc} alt={item.alt} className="w-full rounded-3xl" />
            <div>
              <p className="text-sm font-bold text-cyan-200">POPCA / tessellated detail</p>
              <h2 className="mt-2 text-3xl font-black">{item.title}</h2>
              <p className="mt-2 text-slate-300">{item.description}</p>
              <p className="mt-4 text-sm text-slate-400">조회 {popcaMeta(item).views}회</p>
              <div className="mt-6 flex gap-3"><Link className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950" href={`/c/${popcaMeta(item).slug}`}>이 명함 열기</Link><button className="rounded-full border border-white/15 px-5 py-3" onClick={close}>닫기</button></div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
