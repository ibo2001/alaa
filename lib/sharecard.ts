// Browser only. Draws the 1080×1920 "My Day's Surah" card on the device with the Canvas API; nothing is uploaded.

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;
const MAX_ITEMS = 7;

export type ShareCardInput = {
  lang: "ar" | "en";
  appName: string;
  title: string;
  date: string;
  items: { label: string; ref: string }[];
  /** Shown when there are more blessings than fit, e.g. "+ 3 more". */
  more: (n: number) => string;
  /** The refrain, verbatim from the Guard-verified Tanzil text, drawn whole. */
  refrain: { text: string; ref: string };
  footer: string;
};

const COLORS = { layl: "#1B2340", lazima: "#E6C478", sama: "#E4ECF3", muted: "#AEB8CC", line: "rgba(228,236,243,0.18)" };

/** Greedy word wrap. Never drops words: a text is always drawn whole, over as many lines as it needs. */
export function wrapLines(measure: (s: string) => number, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (line && measure(candidate) > maxWidth) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Splits the day's blessings into the ones drawn and the count left over. */
export function fitItems<T>(items: T[], max = MAX_ITEMS): { shown: T[]; rest: number } {
  return { shown: items.slice(0, max), rest: Math.max(0, items.length - max) };
}

function cssFont(variable: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

export async function drawShareCard(input: ShareCardInput): Promise<Blob> {
  const fonts = {
    heading: cssFont("--font-aref-ruqaa", "serif"),
    ui: cssFont("--font-plex-arabic", "sans-serif"),
    verse: cssFont("--font-amiri-quran", "serif"),
  };
  await Promise.all([
    document.fonts.load(`700 120px ${fonts.heading}`, input.appName),
    document.fonts.load(`400 48px ${fonts.ui}`, input.title),
    document.fonts.load(`400 64px ${fonts.verse}`, input.refrain.text),
  ]).catch(() => undefined);

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  const cx = CARD_WIDTH / 2;
  const uiDir: CanvasDirection = input.lang === "ar" ? "rtl" : "ltr";
  ctx.fillStyle = COLORS.layl;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const text = (s: string, y: number, font: string, color: string, dir: CanvasDirection = uiDir) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.direction = dir;
    ctx.fillText(s, cx, y);
  };

  // Header. The day's blessings are drawn as name and reference only, so no ayah is ever cut to fit.
  text(input.appName, 250, `700 140px ${fonts.heading}`, COLORS.lazima);
  text(input.title, 360, `600 60px ${fonts.ui}`, COLORS.sama);
  text(input.date, 425, `400 34px ${fonts.ui}`, COLORS.muted);
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(140, 480, CARD_WIDTH - 280, 2);

  // The refrain, whole, anchored to the bottom.
  ctx.font = `400 64px ${fonts.verse}`;
  ctx.direction = "rtl";
  const lines = wrapLines((s) => ctx.measureText(s).width, input.refrain.text, CARD_WIDTH - 200);
  const lineHeight = 120;
  const refY = 1770;
  let ly = refY - 70 - (lines.length - 1) * lineHeight;
  const refrainTop = ly - 130;
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(140, refrainTop, CARD_WIDTH - 280, 2);

  // The day's blessings, centred between the header and the refrain.
  const { shown, rest } = fitItems(input.items);
  const step = 118;
  const blockHeight = shown.length * step + (rest > 0 ? 60 : 0);
  let y = Math.max(580, 480 + (refrainTop - 480 - blockHeight) / 2 + 60);
  for (const item of shown) {
    text(item.label, y, `600 52px ${fonts.ui}`, COLORS.sama);
    text(item.ref, y + 46, `400 30px ${fonts.ui}`, COLORS.muted);
    y += step;
  }
  if (rest > 0) text(input.more(rest), y, `400 34px ${fonts.ui}`, COLORS.muted);
  for (const l of lines) {
    text(l, ly, `400 64px ${fonts.verse}`, COLORS.lazima, "rtl");
    ly += lineHeight;
  }
  text(input.refrain.ref, refY, `400 30px ${fonts.ui}`, COLORS.muted);
  text(input.footer, 1860, `400 28px ${fonts.ui}`, COLORS.muted, "ltr");

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}
