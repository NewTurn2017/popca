import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CreateCardPayload, StoredCard } from "@/types/card";
import { makeSlug } from "@/lib/slug";

const dataDir = path.join(process.cwd(), ".popca-data");
const dataFile = path.join(dataDir, "cards.json");

async function readCards(): Promise<StoredCard[]> {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    if (!raw.trim()) return [];
    return JSON.parse(raw) as StoredCard[];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    if (error instanceof SyntaxError) return [];
    throw error;
  }
}

async function writeCards(cards: StoredCard[]) {
  await fs.mkdir(dataDir, { recursive: true });
  const tempFile = `${dataFile}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(cards, null, 2));
  await fs.rename(tempFile, dataFile);
}

export async function listCards(limit = 60): Promise<StoredCard[]> {
  const cards = await readCards();
  return cards.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export async function getCardBySlug(slug: string): Promise<StoredCard | null> {
  return (await readCards()).find((card) => card.slug === slug) ?? null;
}

export async function createLocalCard(payload: CreateCardPayload): Promise<StoredCard> {
  const cards = await readCards();
  let slug = payload.slug ?? makeSlug();
  while (cards.some((card) => card.slug === slug)) slug = makeSlug();
  const card: StoredCard = { ...payload, slug, views: 0, createdAt: Date.now() };
  cards.push(card);
  await writeCards(cards);
  return card;
}

export async function incrementViews(slug: string): Promise<void> {
  const cards = await readCards();
  const card = cards.find((candidate) => candidate.slug === slug);
  if (!card) return;
  card.views += 1;
  await writeCards(cards);
}

export async function replaceCardImage(slug: string, editToken: string, cardImageUrl: string): Promise<void> {
  const cards = await readCards();
  const card = cards.find((candidate) => candidate.slug === slug);
  if (!card) throw new Error("Card not found");
  if (card.editToken !== editToken) throw new Error("Invalid edit token");
  card.cardImageUrl = cardImageUrl;
  await writeCards(cards);
}

export async function removeCard(slug: string, editToken: string): Promise<void> {
  const cards = await readCards();
  const card = cards.find((candidate) => candidate.slug === slug);
  if (!card) throw new Error("Card not found");
  if (card.editToken !== editToken) throw new Error("Invalid edit token");
  await writeCards(cards.filter((candidate) => candidate.slug !== slug));
}

export async function resetLocalCards(): Promise<void> {
  await writeCards([]);
}
