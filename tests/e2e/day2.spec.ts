import { expect, test, type Page } from "@playwright/test";

/** The learning stage as stored in IndexedDB (buttons update before the write commits). */
const storedStage = (page: Page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        const open = indexedDB.open("keyval-store");
        open.onsuccess = () => {
          const req = open.result.transaction("keyval").objectStore("keyval").get("stage");
          req.onsuccess = () => resolve(req.result);
        };
      }),
  );

// Learning stage, My Day's Surah and the Ar-Rahman Journey. All state is on the device (IndexedDB),
// and each Playwright test starts with a fresh browser context.

test("learning stage: new readers see the refrain note", async ({ page }) => {
  await page.goto("/en");
  const option = page.getByRole("button", { name: "I'm new to the Quran" });
  await option.click();
  await expect(option).toHaveAttribute("aria-pressed", "true");
  // The button updates before the IndexedDB write commits; wait for the stored value before leaving the page.
  await expect.poll(() => storedStage(page)).toBe("new");

  await page.goto("/en/blessing/water");
  await expect(page.getByText("This ayah is from Surah Ar-Rahman, where it is repeated 31 times.")).toBeVisible();
});

test("My Day's Surah: add a card, see it with the refrain, draw the share card", async ({ page }) => {
  await page.goto("/en/blessing/water");
  await page.getByRole("button", { name: "Add to My Day" }).click();
  await expect(page.getByRole("button", { name: /Added to My Day/ })).toBeVisible();

  await page.goto("/en/today");
  await expect(page.locator("[data-ready]")).toBeVisible();
  await expect(page.getByText("1 blessing today")).toBeVisible();
  await expect(page.getByRole("link", { name: "Water" })).toBeVisible();

  await page.getByRole("button", { name: "Make my day's card" }).click();
  const img = page.getByRole("img", { name: /My Day's Surah card/ });
  await expect(img).toBeVisible();
  expect(await img.evaluate((el: HTMLImageElement) => [el.naturalWidth, el.naturalHeight])).toEqual([1080, 1920]);
  await expect(page.getByRole("link", { name: "Download image" })).toHaveAttribute("download", "alaa-my-day.png");
});

test("Ar-Rahman Journey: photo and read progress, then the after-journey screen", async ({ page }) => {
  await page.goto("/en/journey");
  await expect(page.locator("[data-ready]")).toBeVisible();
  await expect(page.getByText("0 of 7 stations")).toBeVisible();

  // Station 1 by reading its card.
  await page.getByRole("link", { name: /Read the card Speech and writing/ }).click();
  await expect(page).toHaveURL(/\/en\/blessing\/speech-writing$/);
  await page.goto("/en/journey");
  await expect(page.locator('[data-station="1"]')).toHaveAttribute("data-done", "true");
  await expect(page.locator('[data-station="1"]').getByText("Card read")).toBeVisible();

  // Station 5 by a (sample) photo of dates.
  await page.goto("/en/lens");
  await expect(page.locator("[data-ready]")).toBeVisible();
  await page.locator('[data-sample="dates"]').click();
  await expect(page).toHaveURL(/\/en\/blessing\/dates-palms$/);
  await page.goto("/en/journey");
  await expect(page.locator('[data-station="5"]').getByText("Found with a photo")).toBeVisible();
  await expect(page.getByText("2 of 7 stations")).toBeVisible();
  await expect(page.getByRole("heading", { name: "After the journey" })).toBeHidden();

  // The remaining stations.
  for (const id of ["sun-moon", "stars-trees", "sky", "sea", "pearls"]) {
    await page.goto(`/en/blessing/${id}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(200); // let the station mark reach IndexedDB
  }
  await page.goto("/en/journey");
  await expect(page.getByText("7 of 7 stations")).toBeVisible();
  await expect(page.getByRole("heading", { name: "After the journey" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Surah Ar-Rahman with translation/ })).toHaveAttribute("href", "https://quran.com/55");
  await expect(page.getByRole("link", { name: "Ask the specialists at IslamQA" })).toHaveAttribute("href", "https://islamqa.info/en");
});

test("About: what Alaa is and is not, referral and report links", async ({ page }) => {
  await page.goto("/ar/about");
  await expect(page.getByRole("heading", { level: 1, name: "عن آلاء" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ما ليس هو" })).toBeVisible();
  await expect(page.getByRole("link", { name: /الإسلام سؤال وجواب/ })).toHaveAttribute("href", "https://islamqa.info/ar");
  await expect(page.getByRole("link", { name: "أبلغ عن خطأ عبر GitHub" })).toHaveAttribute("href", /github\.com\/ibo2001\/alaa\/issues\/new/);
});

test("Review sheet: every card through the Guard, with status and checklist", async ({ page }) => {
  await page.goto("/ar/review");
  await expect(page.getByRole("heading", { level: 1, name: "ورقة المراجعة" })).toBeVisible();
  await expect(page.getByText("الروابط المراجَعة: ١٢ من ٢٥")).toBeVisible();
  await expect(page.locator("article > ol > li")).toHaveCount(27); // 25 cards + abstention + refrain
  await expect(page.locator("#water p.verse")).toBeVisible();
  await expect(page.locator("#abstention p.verse")).toHaveCount(2);
});

test("Review sheet: answers are saved on the device and sent to the review inbox", async ({ page }) => {
  let posted = "";
  // Never reach the real Google Form from tests.
  await page.route("**/formResponse", async (route) => {
    posted = route.request().postData() ?? "";
    await route.fulfill({ status: 200, body: "" });
  });
  await page.goto("/ar/review");
  await page.locator('[data-review-card="water"]').getByRole("button", { name: "الآية مناسبة لهذه النعمة" }).click();
  const sky = page.locator('[data-review-card="sky"]');
  await sky.getByRole("button", { name: "تحتاج إلى تبديل" }).click();
  await sky.getByLabel("الآية المقترحة").fill("٥٥:١٠");

  await page.reload();
  await expect(page.locator('[data-review-card="water"]').getByRole("button", { name: "الآية مناسبة لهذه النعمة" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-review-card="sky"]').getByLabel("الآية المقترحة")).toHaveValue("٥٥:١٠");
  await expect(page.getByText("تمت مراجعة ٢ من ٢٧")).toBeVisible();

  await page.getByLabel("اسمك").fill("مراجع تجريبي");
  await page.getByRole("button", { name: "أرسل المراجعة" }).click();
  await expect(page.getByRole("status")).toContainText("أُرسلت إلى إبراهيم");
  const review = new URLSearchParams(posted);
  const text = [...review.values()].join("\n");
  expect(text).toContain("مراجع تجريبي");
  expect(text).toContain("[sky]");
  expect(text).toContain("٥٥:١٠");
});

test("Home: a Guard-verified blessing verse that changes, and the stage question only until answered", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("[data-ready]")).toBeVisible();
  const verse = page.locator("[data-verse]");
  await expect(verse.locator("p.verse")).toBeVisible();
  const first = await verse.getAttribute("data-verse");
  await page.getByRole("button", { name: "Another verse" }).click();
  await expect(verse).not.toHaveAttribute("data-verse", first!);
  await expect(page.getByRole("link", { name: "My Day's Surah" })).toHaveCount(0); // no repeated shortcuts

  // First visit asks the learning stage; once answered, Home no longer shows it (About still does).
  await page.getByRole("button", { name: "I know the Quran" }).click();
  await expect(page.getByRole("button", { name: "I know the Quran" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => storedStage(page)).toBe("familiar");
  await page.reload();
  await expect(page.locator("[data-ready]")).toBeVisible();
  await expect(page.getByRole("button", { name: "I know the Quran" })).toHaveCount(0);
  await page.goto("/en/about");
  await expect(page.getByRole("button", { name: "I know the Quran" })).toHaveAttribute("aria-pressed", "true");
});
