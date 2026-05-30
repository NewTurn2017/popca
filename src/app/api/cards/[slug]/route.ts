import { NextResponse } from "next/server";
import { getCardBySlug, incrementViews, removeCard } from "@/lib/localCards";
import type { StoredCard } from "@/types/card";

export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

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

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  if (!card) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ card: toPublicCard(card) });
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;
  let action: unknown;
  try {
    const raw = await request.text();
    action = raw ? (JSON.parse(raw) as { action?: unknown }).action : undefined;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (action !== "incrementViews") {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  await incrementViews(slug);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Params) {
  const { slug } = await params;
  let editToken: unknown;
  try {
    const raw = await request.text();
    editToken = raw ? (JSON.parse(raw) as { editToken?: unknown }).editToken : undefined;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (typeof editToken !== "string" || editToken.length === 0) {
    return NextResponse.json({ error: "missing edit token" }, { status: 400 });
  }

  try {
    await removeCard(slug, editToken);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "failed" }, { status: 403 });
  }
}
