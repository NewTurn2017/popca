import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = (import.meta as ImportMeta & { glob: (pattern: string) => Record<string, () => Promise<unknown>> }).glob("../**/*.*s");

describe("convex cards", () => {
  it("creates, lists, increments, and removes cards with storage URLs", async () => {
    const t = convexTest({ schema, modules });
    const storageId = await t.run(async (ctx) => ctx.storage.store(new Blob(["card"], { type: "image/png" })));
    await t.mutation(api.cards.createCard, {
      slug: "Abc123ZZ",
      editToken: "secret",
      brand: "POPCA",
      name: "Genie",
      title: "Maker",
      handle: "@genie",
      website: "pop.ca",
      styleName: "Arctic Glass",
      accent: "#5ac8ff",
      cellIndex: 0,
      cardImageId: storageId,
    });
    const found = await t.query(api.cards.getBySlug, { slug: "Abc123ZZ" });
    expect(found?.cardImageUrl).toContain("/api/storage/");
    expect(found).not.toHaveProperty("editToken");
    expect(found).not.toHaveProperty("cardImageId");
    expect(found).not.toHaveProperty("_id");
    const list = await t.query(api.cards.list, { limit: 10 });
    expect(list.map((item) => item.slug)).toContain("Abc123ZZ");
    expect(list[0]).not.toHaveProperty("editToken");
    expect(list[0]).not.toHaveProperty("cardImageId");
    expect(list[0]).not.toHaveProperty("_id");
    await t.mutation(api.cards.incrementViews, { slug: "Abc123ZZ" });
    expect((await t.query(api.cards.getBySlug, { slug: "Abc123ZZ" }))?.views).toBe(1);
    await expect(t.mutation(api.cards.remove, { slug: "Abc123ZZ", editToken: "wrong" })).rejects.toThrow();
    await t.mutation(api.cards.remove, { slug: "Abc123ZZ", editToken: "secret" });
    expect(await t.query(api.cards.getBySlug, { slug: "Abc123ZZ" })).toBeNull();
  });
});
