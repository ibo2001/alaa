// Browser only. Draws the 1080×1920 "My Day's Surah" card on the device with the Canvas API; nothing is uploaded.
// Layout (and which verses fit) comes from sharecard-layout.ts; verse texts arrive Guard-verified and are drawn whole.
import QRCode from "qrcode";
import { iconSvg } from "./sharecard-icons";
import { ALSO_SIZE, CARD_HEIGHT, CARD_WIDTH, QR_SIZE, REFRAIN_SIZE, TEXT_WIDTH, layoutCard, type LayoutItem } from "./sharecard-layout";

export { CARD_HEIGHT, CARD_WIDTH, wrapLines } from "./sharecard-layout";

export type ShareCardInput = {
  lang: "ar" | "en";
  appName: string;
  title: string;
  dates: { greg: string; hijri: string };
  count: string;
  /** Today's blessings. `passages`: whole Guard-verified texts, or null (mapping under review: reference only). */
  items: LayoutItem[];
  /** Prefix of the line naming blessings that don't get a block, e.g. "Also today:". */
  alsoToday: string;
  /** Shown when there are more blessings than fit, e.g. "+ 3 more". */
  more: (n: number) => string;
  /** The refrain, verbatim from the Guard-verified Tanzil text, drawn whole. */
  refrain: { text: string; ref: string };
  invite: { title: string; body: string; url: string; qrUrl: string };
};

const COLORS = {
  layl: "#1B2340",
  lazima: "#E6C478",
  sama: "#E4ECF3",
  muted: "#AEB8CC",
  line: "rgba(228,236,243,0.22)",
  ring: "rgba(228,236,243,0.35)",
  frame: "rgba(230,196,120,0.35)",
};

function cssFont(variable: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

function loadImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

/** Eight-pointed star: two squares, one turned by 45°. Plain geometry, no religious text. */
function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  ctx.translate(x, y);
  for (const turn of [0, Math.PI / 4]) {
    ctx.save();
    ctx.rotate(turn);
    ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
    ctx.restore();
  }
  ctx.restore();
}

function qr(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, size: number) {
  const code = QRCode.create(url, { errorCorrectionLevel: "M" });
  const n = code.modules.size;
  const pad = 14;
  ctx.fillStyle = COLORS.sama;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 18);
  ctx.fill();
  const cell = (size - pad * 2) / n;
  ctx.fillStyle = COLORS.layl;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (code.modules.get(r, c)) ctx.fillRect(x + pad + c * cell, y + pad + r * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
}

export async function drawShareCard(input: ShareCardInput): Promise<Blob> {
  const fonts = {
    heading: cssFont("--font-aref-ruqaa", "serif"),
    ui: cssFont("--font-plex-arabic", "sans-serif"),
    verse: cssFont("--font-amiri-quran", "serif"),
  };
  const verseSample = input.items.flatMap((i) => i.passages ?? []).join(" ") || input.refrain.text;
  await Promise.all([
    document.fonts.load(`700 120px ${fonts.heading}`, input.appName),
    document.fonts.load(`700 48px ${fonts.ui}`, input.title),
    document.fonts.load(`400 48px ${fonts.verse}`, `${verseSample} ${input.refrain.text}`),
  ]).catch(() => undefined);

  const cx = CARD_WIDTH / 2;
  const rtl = input.lang === "ar";
  const uiDir: CanvasDirection = rtl ? "rtl" : "ltr";
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  const measure = (s: string, px: number) => {
    ctx.font = `400 ${px}px ${fonts.verse}`;
    ctx.direction = "rtl";
    return ctx.measureText(s).width;
  };
  const measureUi = (s: string, px: number) => {
    ctx.font = `400 ${px}px ${fonts.ui}`;
    ctx.direction = uiDir;
    return ctx.measureText(s).width;
  };
  const layout = layoutCard({ items: input.items, refrain: input.refrain.text, measure, measureUi, alsoPrefix: input.alsoToday, more: input.more });

  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center", dir = uiDir) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.direction = dir;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
  };

  // Background: night blue with a soft gold glow at the top, a thin gold frame and a star in each corner.
  ctx.fillStyle = COLORS.layl;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  const glow = ctx.createRadialGradient(cx, 0, 0, cx, 0, 900);
  glow.addColorStop(0, "rgba(230,196,120,0.14)");
  glow.addColorStop(1, "rgba(230,196,120,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.strokeStyle = COLORS.frame;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(40, 40, CARD_WIDTH - 80, CARD_HEIGHT - 80, 36);
  ctx.stroke();
  ctx.fillStyle = COLORS.lazima;
  for (const [x, y] of [
    [40, 40],
    [CARD_WIDTH - 40, 40],
    [40, CARD_HEIGHT - 40],
    [CARD_WIDTH - 40, CARD_HEIGHT - 40],
  ] as const)
    star(ctx, x, y, 14);
  ctx.textBaseline = "alphabetic";

  // Header.
  text(input.appName, cx, 170, `700 130px ${fonts.heading}`, COLORS.lazima);
  ctx.fillStyle = COLORS.lazima;
  ctx.fillRect(cx - 40, 205, 80, 4);
  text(input.title, cx, 285, `700 56px ${fonts.ui}`, COLORS.sama);
  text(input.dates.greg, cx, 340, `400 32px ${fonts.ui}`, COLORS.muted);
  text(input.dates.hijri, cx, 385, `400 32px ${fonts.ui}`, COLORS.muted);
  text(input.count, cx, 440, `500 30px ${fonts.ui}`, COLORS.lazima);

  // The day's blessings: icon, name, the verse whole (or reference only), reference.
  const icons = await Promise.all(layout.items.map((p) => loadImage(iconSvg(p.item.id, COLORS.sama)).catch(() => null)));
  layout.items.forEach((p, i) => {
    ctx.strokeStyle = COLORS.ring;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, p.iconCY, 34, 0, Math.PI * 2);
    ctx.stroke();
    const icon = icons[i];
    if (icon) ctx.drawImage(icon, cx - 20, p.iconCY - 20, 40, 40);
    text(p.item.label, cx, p.labelY, `700 46px ${fonts.ui}`, COLORS.sama);
    p.verse?.passages.forEach((lines, pi) =>
      lines.forEach((line, li) => text(line, cx, p.verse!.ys[pi]![li]!, `400 ${layout.verseSize}px ${fonts.verse}`, COLORS.sama, "center", "rtl")),
    );
    text(p.item.ref, cx, p.refY, `400 28px ${fonts.ui}`, COLORS.muted);
    if (p.dotY !== null) {
      ctx.fillStyle = COLORS.lazima;
      ctx.beginPath();
      ctx.arc(cx, p.dotY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  layout.also.lines.forEach((l, i) => text(l, cx, layout.also.ys[i]!, `400 ${ALSO_SIZE}px ${fonts.ui}`, COLORS.muted));

  // Divider with a gold diamond, then the refrain, whole.
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(140, layout.dividerY - 1, cx - 140 - 24, 2);
  ctx.fillRect(cx + 24, layout.dividerY - 1, cx - 140 - 24, 2);
  ctx.save();
  ctx.translate(cx, layout.dividerY);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = COLORS.lazima;
  ctx.fillRect(-7, -7, 14, 14);
  ctx.restore();
  layout.refrain.lines.forEach((l, i) => text(l, cx, layout.refrain.ys[i]!, `400 ${REFRAIN_SIZE}px ${fonts.verse}`, COLORS.lazima, "center", "rtl"));
  text(input.refrain.ref, cx, layout.refrain.refY, `400 28px ${fonts.ui}`, COLORS.muted);

  // Invitation: QR code to the app, with a short line beside it (QR on the reading side's start).
  const groupWidth = TEXT_WIDTH - 120;
  const left = cx - groupWidth / 2;
  const qrX = rtl ? left + groupWidth - QR_SIZE : left;
  qr(ctx, input.invite.qrUrl, qrX, layout.inviteY, QR_SIZE);
  const textX = rtl ? qrX - 36 : qrX + QR_SIZE + 36;
  const align: CanvasTextAlign = rtl ? "right" : "left";
  text(input.invite.title, textX, layout.inviteY + 60, `700 38px ${fonts.ui}`, COLORS.sama, align);
  text(input.invite.body, textX, layout.inviteY + 110, `400 30px ${fonts.ui}`, COLORS.muted, align);
  text(input.invite.url, textX, layout.inviteY + 156, `500 28px ${fonts.ui}`, COLORS.lazima, align, "ltr");

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}
