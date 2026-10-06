// Pure layout for the 1080×1920 "My Day's Surah" card: where everything goes, and which verses fit.
// No canvas here, so it can be tested. Text is only ever wrapped, never cut: a verse is drawn whole or not at all.

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;
export const TEXT_WIDTH = 860;
export const MAX_SHOWN = 6;
export const VERSE_SIZES = [46, 42, 38, 34] as const;
export const REFRAIN_SIZE = 72;
export const QR_SIZE = 170;

/** One blessing of the day. `passages` holds whole Guard-verified texts (one per surah), or null for reference only. */
export type LayoutItem = { id: string; label: string; ref: string; passages: string[] | null };

export type PlacedItem = {
  item: LayoutItem;
  top: number;
  iconCY: number;
  labelY: number;
  /** Lines per passage and the baseline of each line. Null: name and reference only. */
  verse: { passages: string[][]; ys: number[][] } | null;
  refY: number;
  /** Gold dot between this blessing and the next. */
  dotY: number | null;
};

export type CardLayout = {
  items: PlacedItem[];
  /** Blessings without a block, named in one wrapped "Also today: …" line (UI font). */
  also: { names: string[]; lines: string[]; ys: number[] };
  /** Blessings not named at all (only when even the "also" line would pass its line limit). */
  rest: number;
  verseSize: number;
  verseLineHeight: number;
  contentTop: number;
  contentBottom: number;
  dividerY: number;
  refrain: { lines: string[]; ys: number[]; refY: number };
  inviteY: number;
};

type Measure = (text: string, px: number) => number;

/** Greedy word wrap. Never drops words: a text is always drawn whole, over as many lines as it needs. */
export function wrapLines(measure: (s: string) => number, text: string, maxWidth: number): string[] {
  // Spaces only: a no-break space keeps an ayah number with the last word before it.
  const words = text.split(/[ \t\n]+/).filter(Boolean);
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

// Vertical rhythm of one blessing block (baselines measured from the block's top).
const ICON_BOX = 72;
const LABEL_GAP = 52;
const REF_AFTER_LABEL = 46;
const REF_AFTER_VERSE = 50;
const BLOCK_TAIL = 12;
const GAP = 56; // between blocks, with a gold dot in the middle
export const ALSO_SIZE = 32;
const ALSO_LINE = 50;
const ALSO_GAP = 40;
const ALSO_MAX_LINES = 3;

const lineHeightFor = (px: number) => Math.round(px * 1.85);

function wrapPassages(passages: string[], px: number, measure: Measure): string[][] {
  return passages.map((p) => wrapLines((s) => measure(s, px), p, TEXT_WIDTH));
}

function blockHeight(item: LayoutItem, withVerse: boolean, px: number, measure: Measure): number {
  const label = ICON_BOX + LABEL_GAP;
  if (!withVerse || !item.passages) return label + REF_AFTER_LABEL + BLOCK_TAIL;
  const lh = lineHeightFor(px);
  const passages = wrapPassages(item.passages, px, measure);
  const lines = passages.reduce((n, p) => n + p.length, 0);
  const between = (passages.length - 1) * Math.round(lh * 0.3);
  return label + 16 + lines * lh + between + REF_AFTER_VERSE - Math.round(lh * 0.2) + BLOCK_TAIL;
}

function bottomRegion(refrain: string, measure: Measure) {
  const inviteY = CARD_HEIGHT - 60 - QR_SIZE;
  const refY = inviteY - 50;
  const lines = wrapLines((s) => measure(s, REFRAIN_SIZE), refrain, TEXT_WIDTH);
  const lh = 124;
  const last = refY - 56;
  const ys = lines.map((_, i) => last - (lines.length - 1 - i) * lh);
  const dividerY = ys[0]! - 96;
  return { inviteY, refrain: { lines, ys, refY }, dividerY, contentBottom: dividerY - 28 };
}

export const CONTENT_TOP = 490;

type LayoutArgs = {
  items: LayoutItem[];
  refrain: string;
  /** Width of verse text (Quran font) at a size. */
  measure: Measure;
  /** Width of UI text at a size; defaults to `measure`. */
  measureUi?: Measure;
  /** "Also today:" prefix and the "+ N more" suffix, localized. */
  alsoPrefix?: string;
  more?: (n: number) => string;
};

/** The "also today" line: as many names as fit in ALSO_MAX_LINES, then "+ N more" for the rest. */
function alsoLines(names: string[], args: LayoutArgs): { names: string[]; lines: string[]; rest: number } {
  if (names.length === 0) return { names: [], lines: [], rest: 0 };
  const m = args.measureUi ?? args.measure;
  const prefix = args.alsoPrefix ?? "Also:";
  const more = args.more ?? ((n: number) => `+ ${n}`);
  for (let k = names.length; k >= 1; k--) {
    const rest = names.length - k;
    const text = `${prefix} ${names.slice(0, k).join(" · ")}${rest > 0 ? ` ${more(rest)}` : ""}`;
    const lines = wrapLines((x) => m(x, ALSO_SIZE), text, TEXT_WIDTH);
    if (lines.length <= ALSO_MAX_LINES) return { names: names.slice(0, k), lines, rest };
  }
  return { names: [], lines: [more(names.length)], rest: names.length };
}

export function layoutCard(args: LayoutArgs): CardLayout {
  const { items, refrain, measure } = args;
  const bottom = bottomRegion(refrain, measure);
  const avail = bottom.contentBottom - CONTENT_TOP;
  const verseLength = (it: LayoutItem) => (it.passages ? it.passages.reduce((n, p) => n + measure(p, 1), 0) : 0);

  const anyVerse = items.some((it) => it.passages !== null);
  let fallback: CardLayout | null = null;
  // Most blocks first; within a block count, shrink the verse size, then turn the longest verse into
  // "reference only". A layout must keep at least one verse if any blessing has one; otherwise try fewer
  // blocks, with the rest named in the "also today" line. A verse is never cut.
  for (let count = Math.min(items.length, MAX_SHOWN); count >= 1; count--) {
    const blocks = items.slice(0, count);
    const also = alsoLines(items.slice(count).map((i) => i.label), args);
    const alsoHeight = also.lines.length ? ALSO_GAP + also.lines.length * ALSO_LINE : 0;
    const on = blocks.map((it) => it.passages !== null);
    for (;;) {
      let fit: CardLayout | null = null;
      for (const px of VERSE_SIZES) {
        const heights = blocks.map((it, i) => blockHeight(it, on[i]!, px, measure));
        const total = heights.reduce((x, y) => x + y, 0) + (blocks.length - 1) * GAP + alsoHeight;
        if (total <= avail) {
          fit = place(blocks, on, heights, px, also, total, bottom, measure);
          break;
        }
      }
      if (fit) {
        if (!anyVerse || on.some(Boolean)) return fit;
        fallback ??= fit;
        break;
      }
      let longest = -1;
      blocks.forEach((it, i) => {
        if (on[i] && (longest < 0 || verseLength(it) > verseLength(blocks[longest]!))) longest = i;
      });
      if (longest < 0) break;
      on[longest] = false;
    }
  }
  if (fallback) return fallback;
  // Unreachable with the card's sizes (one block without a verse always fits); keep a safe layout.
  const one = items.slice(0, 1);
  const also = alsoLines(items.slice(1).map((i) => i.label), args);
  return place(one, [false], one.map((it) => blockHeight(it, false, VERSE_SIZES[0], measure)), VERSE_SIZES[0], also, 0, bottom, measure);
}

function place(
  shown: LayoutItem[],
  on: boolean[],
  blocks: number[],
  px: number,
  also: { names: string[]; lines: string[]; rest: number },
  total: number,
  bottom: ReturnType<typeof bottomRegion>,
  measure: Measure,
): CardLayout {
  const lh = lineHeightFor(px);
  let top = CONTENT_TOP + Math.max(0, (bottom.contentBottom - CONTENT_TOP - total) / 2);
  const placed: PlacedItem[] = shown.map((item, i) => {
    const iconCY = top + ICON_BOX / 2;
    const labelY = top + ICON_BOX + LABEL_GAP;
    let refY = labelY + REF_AFTER_LABEL;
    let verse: PlacedItem["verse"] = null;
    if (on[i] && item.passages) {
      const passages = wrapPassages(item.passages, px, measure);
      let y = labelY + 16 + Math.round(lh * 0.8);
      const ys = passages.map((lines, pi) => {
        if (pi > 0) y += Math.round(lh * 0.3);
        return lines.map(() => {
          const at = y;
          y += lh;
          return at;
        });
      });
      verse = { passages, ys };
      refY = y - lh + REF_AFTER_VERSE;
    }
    const blockTop = top;
    top += blocks[i]!;
    const dotY = i < shown.length - 1 ? top + GAP / 2 : null;
    if (i < shown.length - 1) top += GAP;
    return { item, top: blockTop, iconCY, labelY, verse, refY, dotY };
  });
  const alsoYs = also.lines.map((_, i) => top + ALSO_GAP + (i + 1) * ALSO_LINE - 14);
  return {
    items: placed,
    also: { names: also.names, lines: also.lines, ys: alsoYs },
    rest: also.rest,
    verseSize: px,
    verseLineHeight: lh,
    contentTop: CONTENT_TOP,
    contentBottom: bottom.contentBottom,
    dividerY: bottom.dividerY,
    refrain: bottom.refrain,
    inviteY: bottom.inviteY,
  };
}
