import type { CardInput } from "@/types/card";

const STYLE_BLOCK = `Create 6 clearly different digital card styles while keeping the exact same locked card size and 2:1 proportion:

1. Arctic Glass
A translucent frosted-glass card with icy blue glow, layered blur, soft refractions, luminous edge highlights, tiny snow-crystal micro-patterns.

2. Holographic Prism
A holographic gradient card with iridescent spectral shine, prism refractions, chrome foil type, shifting rainbow edge lighting.

3. Neural Tech
A dark neural interface card with circuit traces, faint node graphs, teal pulse highlights, technical depth layers, premium cyber UI.

4. Organic Aurora
A soft biomorphic aurora card with fluid gradients, natural contours, luminous green/orange atmosphere, subtle grain.

5. Editorial Mono
A sharp black-and-white editorial card with premium typography, strong grid alignment, micro text blocks, high contrast minimalism.

6. Liquid Metal
A silver liquid-metal card with reflective waves, graphite shadows, mirror highlights, luxurious futuristic material.`;

function sanitize(value: string): string {
  return value.replace(/[<>]/g, "").trim().slice(0, 120);
}

export function normalizeCardInput(input: Partial<CardInput>): CardInput {
  return {
    brand: sanitize(input.brand ?? ""),
    name: sanitize(input.name ?? ""),
    title: sanitize(input.title ?? ""),
    handle: sanitize(input.handle ?? ""),
    website: sanitize(input.website ?? ""),
  };
}

export function validateCardInput(input: Partial<CardInput>): CardInput {
  const normalized = normalizeCardInput(input);
  if (!normalized.brand || !normalized.name) {
    throw new Error("brand and name are required");
  }
  return normalized;
}

export function buildPrompt(info: CardInput, hasLogo: boolean): string {
  const card = validateCardInput(info);
  const optionalTitle = card.title || "Role / title";
  const optionalHandle = card.handle || "@handle";
  const optionalWebsite = card.website || "website.example";
  return `Create one high-end vertical concept board showing exactly 6 interactive digital business card designs arranged in a strict 2-column by 3-row grid.

The layout must be controlled like a CSS grid design system.
First imagine 6 identical locked placeholder frames arranged in a 2-column by 3-row grid.
Each placeholder frame is the exact same size.
Each placeholder frame is a true 2:1 horizontal business-card rectangle.
The card height must be exactly half of the card width.
After the 6 identical 2:1 frames are established, fill each frame with a different digital material design.
Do not resize, stretch, crop, rotate, tilt, or distort any card frame.
Only the internal visual style may change.

Critical fixed layout rules:
- Exactly 6 separate cards only
- 2 columns by 3 rows
- Same card width
- Same card height
- Same corner radius
- Same visual scale
- Same front-facing angle
- Same 2:1 card proportion
- No perspective distortion
- No tilted cards
- No overlapping cards
- No cropped cards
- No banner cards
- No tall app tiles
- No credit-card proportions
- No square cards
- No poster panels
- No thick UI blocks
- Front-facing orthographic view only

The overall board must be vertical, mobile-friendly, and close to a 2:3 presentation ratio.
Use a premium futuristic web design tool interface.
The cards should look like selectable digital UI components that could be hovered, selected, expanded, or animated on a website.

Board style:
Deep soft studio background, refined dark blue interface background, clean spacing between cards, polished design selection screen mood.
Do not add a title header, style labels, pagination dots, carousel controls, UI chrome, or any text outside the six card faces.
Each card face must be large and centered in its slot so it can be cleanly cropped as an individual business card.
No hands, no people, no desk objects, no paper stack, no clutter, no watermark.
No real people, no celebrity likenesses, no copyrighted characters.

Brand placeholder text on each card:
${card.brand}
${card.name}
${optionalTitle}
${optionalHandle}
${optionalWebsite}

${STYLE_BLOCK}
${hasLogo ? "Integrate the provided logo as a subtle brand reference on each card without making it dominate the layout." : ""}`;
}
