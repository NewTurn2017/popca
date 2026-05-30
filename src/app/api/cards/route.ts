import { NextResponse } from "next/server";
import { createLocalCard, listCards, resetLocalCards } from "@/lib/localCards";
import type { CreateCardPayload, StoredCard } from "@/types/card";

export const runtime = "nodejs";

function toPublicCard(card: StoredCard) {
  return {
    slug: card.slug,
    brand: card.brand,
    name: card.name,
    title: card.title,
    handle: card.handle,
    website: card.website,
    styleName: card.styleName,
    accent: card.accent,
    cellIndex: card.cellIndex,
    cardImageUrl: card.cardImageUrl,
    compositeUrl: card.compositeUrl,
    logoUrl: card.logoUrl,
    views: card.views,
    createdAt: card.createdAt,
  };
}

export async function GET() {
  return NextResponse.json({ cards: (await listCards()).map(toPublicCard) });
}

export async function POST(request: Request) {
  let payload: CreateCardPayload | null = null;
  try {
    const raw = await request.text();
    payload = raw ? (JSON.parse(raw) as CreateCardPayload) : null;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!payload?.brand || !payload.name || !payload.editToken || !payload.cardImageUrl) {
    return NextResponse.json({ error: "invalid card payload" }, { status: 400 });
  }

  try {
    const card = await createLocalCard(payload);
    return NextResponse.json({ slug: card.slug, card: toPublicCard(card) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "failed" }, { status: 500 });
  }
}

export async function DELETE() {
  if (process.env.TEST !== "1") return NextResponse.json({ error: "TEST only" }, { status: 403 });
  await resetLocalCards();
  return NextResponse.json({ ok: true });
}
