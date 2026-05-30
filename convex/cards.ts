import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

const cardArgs = {
  slug: v.string(),
  editToken: v.string(),
  brand: v.string(),
  name: v.string(),
  title: v.string(),
  handle: v.string(),
  website: v.string(),
  styleName: v.string(),
  accent: v.string(),
  cellIndex: v.number(),
  cardImageId: v.id("_storage"),
  compositeId: v.optional(v.id("_storage")),
  logoId: v.optional(v.id("_storage")),
};

async function withUrls(ctx: QueryCtx, card: Doc<"cards">) {
  const cardImageUrl = await ctx.storage.getUrl(card.cardImageId);
  const compositeUrl = card.compositeId ? await ctx.storage.getUrl(card.compositeId) : undefined;
  const logoUrl = card.logoId ? await ctx.storage.getUrl(card.logoId) : undefined;
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
    views: card.views,
    createdAt: card.createdAt,
    cardImageUrl,
    compositeUrl,
    logoUrl,
  };
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

export const createCard = mutation({
  args: cardArgs,
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("cards").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();
    if (existing) throw new ConvexError("slug already exists");
    await ctx.db.insert("cards", { ...args, views: 0, createdAt: Date.now() });
    return { slug: args.slug };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const card = await ctx.db.query("cards").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    return card ? withUrls(ctx, card) : null;
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 60 }) => {
    const cards = await ctx.db.query("cards").withIndex("by_createdAt").order("desc").take(limit);
    return Promise.all(cards.map((card) => withUrls(ctx, card)));
  },
});

export const incrementViews = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const card = await ctx.db.query("cards").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (card) await ctx.db.patch(card._id, { views: card.views + 1 });
  },
});

export const replaceCardImage = mutation({
  args: { slug: v.string(), editToken: v.string(), cardImageId: v.id("_storage") },
  handler: async (ctx, { slug, editToken, cardImageId }) => {
    const card = await ctx.db.query("cards").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!card) throw new ConvexError("card not found");
    if (card.editToken !== editToken) throw new ConvexError("invalid edit token");
    await ctx.db.patch(card._id, { cardImageId });
    return { slug };
  },
});

export const remove = mutation({
  args: { slug: v.string(), editToken: v.string() },
  handler: async (ctx, { slug, editToken }) => {
    const card = await ctx.db.query("cards").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!card) throw new ConvexError("card not found");
    if (card.editToken !== editToken) throw new ConvexError("invalid edit token");
    await ctx.db.delete(card._id);
  },
});
