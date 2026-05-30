import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { promises as fs } from "node:fs";
import path from "node:path";
import { buildPrompt, validateCardInput } from "@/lib/prompt";
import type { CardInput } from "@/types/card";

export const runtime = "nodejs";

async function fixtureBase64() {
  const bytes = await fs.readFile(path.join(process.cwd(), "src/test/fixtures/concept.png"));
  return bytes.toString("base64");
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const rawInfo = form.get("info");
    if (typeof rawInfo !== "string") return jsonError("info JSON is required");
    const info = validateCardInput(JSON.parse(rawInfo) as Partial<CardInput>);
    const logo = form.get("logo");
    const hasLogo = logo instanceof File && logo.size > 0;
    const prompt = buildPrompt(info, hasLogo);

    if (process.env.TEST === "1") {
      return NextResponse.json({ b64_json: await fixtureBase64(), prompt, fixture: true });
    }

    if (!process.env.OPENAI_API_KEY) return jsonError("OPENAI_API_KEY is not configured", 500);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = hasLogo
      ? await openai.images.edit({
          model: "gpt-image-2",
          image: [await toFile(Buffer.from(await (logo as File).arrayBuffer()), (logo as File).name || "logo.png", { type: (logo as File).type || "image/png" })],
          prompt,
          size: "1024x1536",
          quality: "high",
          n: 1,
        })
      : await openai.images.generate({ model: "gpt-image-2", prompt, size: "1024x1536", quality: "high", n: 1 });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) return jsonError("OpenAI returned no image data", 502);
    return NextResponse.json({ b64_json: b64, prompt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate image";
    return jsonError(message, message.includes("required") ? 400 : 500);
  }
}
