import { describe, expect, it, vi } from "vitest";
import { POST } from "../route";

describe("POST /api/generate", () => {
  it("returns fixture base64 and prompt in TEST mode", async () => {
    vi.stubEnv("TEST", "1");
    const form = new FormData();
    form.set("info", JSON.stringify({ brand: "POPCA", name: "Genie", title: "Maker", handle: "@g", website: "pop.ca" }));
    const response = await POST(new Request("http://test/api/generate", { method: "POST", body: form }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.b64_json.length).toBeGreaterThan(100);
    expect(body.prompt).toContain("POPCA");
    vi.unstubAllEnvs();
  });

  it("rejects invalid input", async () => {
    const form = new FormData();
    form.set("info", JSON.stringify({ brand: "", name: "" }));
    const response = await POST(new Request("http://test/api/generate", { method: "POST", body: form }));
    expect(response.status).toBe(400);
  });
});
