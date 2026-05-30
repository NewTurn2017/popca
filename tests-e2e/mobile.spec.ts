import { expect, test } from "@playwright/test";

test("landing is usable on mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /팝카 만들기|만들기/ }).first()).toBeVisible();
  await page.getByRole("link", { name: "팝카 만들기" }).click();
  await page.waitForURL("**/create");
  await expect(page.getByLabel("브랜드")).toBeVisible();
});
