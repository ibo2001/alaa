/**
 * Records the demo's screen shots from the live app at iPhone size, one clip per shot of
 * docs/video/SCRIPT.ar.md. Each shot runs in a fresh browser context (empty My Day and journey).
 *
 *   npx tsx video/record.ts [--base=https://alaa-alpha.vercel.app] [--only=s3,s5]
 *
 * Frames come from Chrome's screencast at device pixels (3×, 1170×2532), timed by their timestamps and
 * assembled with ffmpeg; Playwright's own recorder only captures CSS pixels (390×844).
 * Output: video/public/clips/<shot>.mp4 (git-ignored). Re-run any time the app changes.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Page } from "@playwright/test";

const args = process.argv.slice(2);
const base = args.find((a) => a.startsWith("--base="))?.split("=")[1] ?? "https://alaa-alpha.vercel.app";
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1]?.split(",");
const OUT = "video/public/clips";
const VIEW = { width: 390, height: 844 };

const pause = (page: Page, ms: number) => page.waitForTimeout(ms);

/** Smooth scroll by `px` over `ms`, like a finger. */
async function glide(page: Page, px: number, ms = 1200) {
  const steps = Math.max(1, Math.round(ms / 16));
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps);
    await page.waitForTimeout(16);
  }
}

async function ready(page: Page) {
  await page.locator("[data-ready]").first().waitFor({ timeout: 20_000 }).catch(() => {});
}

const shots: Record<string, (page: Page) => Promise<void>> = {
  // 2 · Home with the "Blessings beyond counting" card
  s2_home: async (page) => {
    await page.goto(`${base}/ar`);
    await ready(page);
    await pause(page, 4500);
  },
  // 3 · Lens → glass-of-water sample → drinking-water card, verse then refrain
  s3_lens_water: async (page) => {
    await page.goto(`${base}/ar/lens`);
    await ready(page);
    await pause(page, 1500);
    await glide(page, 420, 1400);
    await pause(page, 600);
    await page.locator('[data-sample="water"]').click();
    await page.waitForURL(/blessing\/drinking-water/, { timeout: 20_000 });
    await pause(page, 3500);
    await glide(page, 520, 2600);
    await pause(page, 3000);
  },
  // 4 · Add to My Day → My Day → share card
  s4_myday: async (page) => {
    await page.goto(`${base}/ar/blessing/drinking-water`);
    await pause(page, 1500);
    await glide(page, 900, 1500);
    await pause(page, 600);
    await page.getByRole("button", { name: "أضف إلى يومي" }).click();
    await pause(page, 1500);
    await page.getByRole("link", { name: "يومي" }).last().click();
    await ready(page);
    await pause(page, 2000);
    await glide(page, 700, 1500);
    await page.getByRole("button", { name: "اصنع بطاقة يومي" }).click();
    await page.getByRole("img").last().waitFor({ timeout: 15_000 });
    await pause(page, 600);
    await glide(page, 900, 1800);
    await pause(page, 2500);
  },
  // 5 · Keyboard sample → honest "no verse" sheet → next ayah
  s5_keyboard: async (page) => {
    await page.goto(`${base}/ar/lens`);
    await ready(page);
    await glide(page, 420, 1000);
    await pause(page, 500);
    await page.locator('[data-sample="keyboard"]').click();
    await page.locator("dialog[open]").waitFor({ timeout: 20_000 });
    await pause(page, 4500);
    await page.getByRole("button", { name: "الآية التالية" }).click();
    await pause(page, 3500);
  },
  // 6 · A card's source page: verified text, licence, review status, quran.com link
  s6_source: async (page) => {
    await page.goto(`${base}/ar/blessing/water`);
    await pause(page, 1200);
    await glide(page, 900, 1200);
    await page.getByRole("link", { name: "المصدر" }).click();
    await page.waitForURL(/source\/water/, { timeout: 20_000 });
    await pause(page, 2000);
    await glide(page, 500, 2200);
    await pause(page, 2000);
    await glide(page, 500, 2200);
    await pause(page, 2500);
  },
  // 7 · Journey timeline; read station 1's card and come back to see it turn green
  s7_journey: async (page) => {
    await page.goto(`${base}/ar/journey`);
    await ready(page);
    await pause(page, 2000);
    await page.locator('[data-station="1"] a[href*="/blessing/"]').first().click();
    await page.waitForURL(/blessing\//, { timeout: 20_000 });
    await pause(page, 2500);
    await page.goBack();
    await ready(page);
    await pause(page, 2000);
    await glide(page, 900, 2600);
    await pause(page, 1500);
  },
  // 8 · English: the water card with the approved translation and its footnote
  s8_english: async (page) => {
    await page.goto(`${base}/en/blessing/water`);
    await pause(page, 2500);
    await glide(page, 600, 2400);
    await pause(page, 3000);
  },
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [name, run] of Object.entries(shots)) {
    if (only && !only.some((o) => name.startsWith(o))) continue;
    const tmp = join(OUT, `.tmp-${name}`);
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const frames: { file: string; t: number }[] = [];
    cdp.on("Page.screencastFrame", async (f) => {
      const file = join(tmp, `${String(frames.length).padStart(5, "0")}.jpg`);
      frames.push({ file, t: f.metadata.timestamp ?? Date.now() / 1000 });
      writeFileSync(file, Buffer.from(f.data, "base64"));
      await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    });
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1170, maxHeight: 2532, everyNthFrame: 1 });
    try {
      await run(page);
      console.log(`✓ ${name} (${frames.length} frames)`);
    } catch (e) {
      console.log(`✗ ${name}: ${(e as Error).message.split("\n")[0]}`);
    }
    await cdp.send("Page.stopScreencast").catch(() => {});
    await context.close();
    if (frames.length > 1) {
      // Each frame lasts until the next one arrives (the screencast only sends frames when the screen changes).
      const lines = frames.map((f, i) => `file '${f.file.split("/").pop()}'\nduration ${Math.max(0.001, (frames[i + 1]?.t ?? f.t + 0.5) - f.t).toFixed(3)}`);
      lines.push(`file '${frames.at(-1)!.file.split("/").pop()}'`);
      writeFileSync(join(tmp, "list.txt"), lines.join("\n") + "\n");
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(tmp, "list.txt"),
        "-vf", "scale=1170:2532:force_original_aspect_ratio=decrease,pad=1170:2532:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p",
        "-c:v", "libx264", "-crf", "16", "-preset", "slow", join(OUT, `${name}.mp4`)]);
    }
    rmSync(tmp, { recursive: true, force: true });
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
