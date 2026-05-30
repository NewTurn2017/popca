import "server-only";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { getCardBySlug, incrementViews as localIncrementViews, listCards, removeCard as localRemoveCard } from "@/lib/localCards";
import type { PublicCard, StoredCard } from "@/types/card";

function convexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url || process.env.NEXT_PUBLIC_POPCA_LOCAL === "1" || process.env.TEST === "1") return null;
  return new ConvexHttpClient(url);
}


function toPublicCard(card: StoredCard): PublicCard {
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

type ConvexCardResult = Omit<PublicCard, "cardImageUrl" | "compositeUrl" | "logoUrl"> & {
  cardImageUrl: string | null;
  compositeUrl?: string | null;
  logoUrl?: string | null;
};

function normalize(card: ConvexCardResult): PublicCard {
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
    cardImageUrl: card.cardImageUrl ?? "",
    compositeUrl: card.compositeUrl ?? undefined,
    logoUrl: card.logoUrl ?? undefined,
    views: card.views,
    createdAt: card.createdAt,
  };
}

export async function listPublicCards(limit = 60): Promise<PublicCard[]> {
  const client = convexClient();
  if (!client) return (await listCards(limit)).map(toPublicCard);
  const cards = await client.query(api.cards.list, { limit });
  return cards.map(normalize).filter((card) => card.cardImageUrl);
}

export async function getPublicCard(slug: string): Promise<PublicCard | null> {
  const client = convexClient();
  if (!client) {
    const card = await getCardBySlug(slug);
    return card ? toPublicCard(card) : null;
  }
  const card = await client.query(api.cards.getBySlug, { slug });
  return card ? normalize(card) : null;
}

export async function incrementPublicViews(slug: string): Promise<void> {
  const client = convexClient();
  if (!client) return localIncrementViews(slug);
  await client.mutation(api.cards.incrementViews, { slug });
}

export async function removePublicCard(slug: string, editToken: string): Promise<void> {
  const client = convexClient();
  if (!client) return localRemoveCard(slug, editToken);
  await client.mutation(api.cards.remove, { slug, editToken });
}
