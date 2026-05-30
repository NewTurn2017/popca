import { describe, expect, it } from "vitest";
import { blobToDataUrl, cellRect, cropCell } from "@/lib/crop";
import { buildPrompt, normalizeCardInput, validateCardInput } from "@/lib/prompt";
import { isSlug, makeEditToken, makeSlug } from "@/lib/slug";
import { POPCA_STYLES, styleFor } from "@/lib/styles";

describe("styleFor", () => {
  it("maps all six cells to stable style names and accents", () => {
    expect(POPCA_STYLES).toHaveLength(6);
    expect(styleFor(0).styleName).toBe("Arctic Glass");
    expect(styleFor(5).styleName).toBe("Liquid Metal");
  });
  it("rejects invalid cells", () => expect(() => styleFor(6)).toThrow(RangeError));
});

describe("crop helpers", () => {
  it("returns 2x3 crop rectangles", () => {
    expect(cellRect(1024, 1536, 0)).toEqual({ sx: 0, sy: 0, sw: 512, sh: 512 });
    expect(cellRect(1024, 1536, 5)).toEqual({ sx: 512, sy: 1024, sw: 512, sh: 512 });
    expect(() => cellRect(100, 100, -1)).toThrow(RangeError);
  });
  it("crops a cell to a blob and reads blobs as data URLs", async () => {
    const image = new Image();
    Object.defineProperty(image, "naturalWidth", { value: 1024 });
    Object.defineProperty(image, "naturalHeight", { value: 1536 });
    const blob = await cropCell(image, 2);
    expect(blob.type).toBe("image/png");
    const dataUrl = await blobToDataUrl(new Blob(["hello"], { type: "text/plain" }));
    expect(dataUrl).toContain("data:text/plain");
  });
});

describe("slug helpers", () => {
  it("generates url-safe 8 character slugs and long edit tokens", () => {
    const slugs = new Set(Array.from({ length: 1000 }, () => makeSlug()));
    expect(slugs.size).toBe(1000);
    for (const slug of slugs) expect(isSlug(slug)).toBe(true);
    expect(makeEditToken()).toMatch(/^popca_[0-9A-Za-z_-]{32}$/);
  });
});

describe("prompt", () => {
  it("normalizes unsafe text and validates required fields", () => {
    expect(normalizeCardInput({ brand: " <b>POP</b> ", name: " Genie " })).toMatchObject({ brand: "bPOP/b", name: "Genie" });
    expect(() => validateCardInput({ brand: "", name: "Genie" })).toThrow(/required/);
  });
  it("injects user info, fixed layout constraints, six styles, and logo guidance", () => {
    const prompt = buildPrompt({ brand: "POPCA", name: "Genie", title: "Maker", handle: "@genie", website: "pop.ca" }, true);
    expect(prompt).toContain("Exactly 6 separate cards only");
    expect(prompt).toContain("2 columns by 3 rows");
    expect(prompt).toContain("POPCA");
    expect(prompt).toContain("Genie");
    expect(prompt).toContain("Liquid Metal");
    expect(prompt).toContain("provided logo");
  });
});
