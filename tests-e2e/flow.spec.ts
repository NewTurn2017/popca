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
