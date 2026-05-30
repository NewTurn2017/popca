import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.delete("/api/cards");
});

test("create to 3D share to gallery flow uses TEST fixture", async ({ page }) => {
  await page.goto("/create");
  await page.getByLabel("브랜드").fill("POPCA Lab");
  await page.getByLabel("이름").fill("부산 지니");
  await page.getByLabel("타이틀").fill("Demo Maker");
  await page.getByLabel("핸들").fill("@busan-genie");
  await page.getByLabel("웹사이트").fill("popca.local");
  await page.getByRole("button", { name: /다음: 로고/ }).click();
  await page.getByRole("button", { name: /다음: 생성/ }).click();
  await page.getByRole("button", { name: /딸깍 생성/ }).click();
  await expect(page.getByTestId("concept-board")).toBeVisible();
  await page.getByRole("button", { name: /2번/ }).click();
  await expect(page).toHaveURL(/\/c\/[0-9A-Za-z]{8}$/);
  const slug = new URL(page.url()).pathname.split("/").pop();
  expect(slug).toBeTruthy();
  const response = await page.request.get(`/api/cards/${slug}`);
  expect(response.ok()).toBeTruthy();
  const { card } = await response.json();
  const imageSize = await page.evaluate(async (src: string) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, card.cardImageUrl as string);
  expect(imageSize).toEqual({ width: 452, height: 315 });
  await expect(page.getByTestId("card-3d")).toBeVisible();
  await expect(page.getByTestId("card-name")).toHaveText("부산 지니");
  await page.getByRole("button", { name: /링크 복사/ }).click();
  await expect(page.getByRole("status")).toContainText("복사");
  await page.getByRole("link", { name: /갤러리에서 보기/ }).click();
  await expect(page.getByTestId("gallery-board")).toContainText("부산 지니");
});

test("unknown slug shows 404", async ({ page }) => {
  await page.goto("/c/NOPE4040");
  await expect(page.getByText(/팝카를 찾을 수 없어요/)).toBeVisible();
});

test("owner can repair an existing mis-cropped card from its 2x3 board", async ({ page, request }) => {
  const generated = await request.post("/api/generate", {
    multipart: { info: JSON.stringify({ brand: "POPCA Lab", name: "복구 지니", title: "Repair Maker", handle: "@repair", website: "popca.local" }) },
  });
  expect(generated.ok()).toBeTruthy();
  const { b64_json: b64 } = await generated.json();
  const compositeUrl = `data:image/png;base64,${b64}`;
  await request.post("/api/cards", {
    data: {
      slug: "LEGACY01",
      editToken: "repair-token",
      brand: "POPCA Lab",
      name: "복구 지니",
      title: "Repair Maker",
      handle: "@repair",
      website: "popca.local",
      styleName: "Liquid Metal",
      accent: "#b8b8ff",
      cellIndex: 5,
      cardImageUrl: compositeUrl,
      compositeUrl,
    },
  });

  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("popca:owned", JSON.stringify([{ slug: "LEGACY01", editToken: "repair-token" }])));
  await page.goto("/c/LEGACY01");
  await page.getByRole("button", { name: /이미지 복구/ }).click();
  await expect(page.getByRole("status")).toContainText("복구했어요");
  const repaired = await request.get("/api/cards/LEGACY01");
  const { card } = await repaired.json();
  const imageSize = await page.evaluate(async (src: string) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, card.cardImageUrl as string);
  expect(imageSize).toEqual({ width: 452, height: 315 });
});
