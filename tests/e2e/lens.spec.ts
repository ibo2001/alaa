import { expect, test } from "@playwright/test";

// Runs against `next start` with VISION_PROVIDER=stub (see playwright.config.ts): no API key needed.

test("lens → sample photo → verified blessing card", async ({ page }) => {
  await page.goto("/en/lens");
  await expect(page.locator("[data-ready]")).toBeVisible();

  await page.getByRole("button", { name: "Try sample: Glass of water" }).click();

  await expect(page).toHaveURL(/\/en\/blessing\/drinking-water$/);
  await expect(page.getByRole("heading", { level: 1, name: "Drinking water" })).toBeVisible();
  // Verse text from Tanzil, the licensed translation, the review badge and the quran.com link.
  await expect(page.locator("p.verse").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Translation by Talal Itani/ }).first()).toBeVisible();
  await expect(page.getByText("Mapping under review")).toBeVisible();
  await expect(page.getByRole("link", { name: /in context on quran\.com/ })).toHaveAttribute("href", "https://quran.com/56/68-70");
});

test("lens → sample with no verse → polite abstention", async ({ page }) => {
  await page.goto("/ar/lens");
  await expect(page.locator("[data-ready]")).toBeVisible();
  await page.locator('[data-sample="keyboard"]').click();
  await expect(page.getByRole("heading", { name: /لوحة المفاتيح/ })).toBeVisible();
  await expect(page.getByText("إبراهيم ١٤:٣٤")).toBeVisible();
});
