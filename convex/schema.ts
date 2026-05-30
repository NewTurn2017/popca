import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cards: defineTable({
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
    views: v.number(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_createdAt", ["createdAt"]),
});
