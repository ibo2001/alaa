// Home "Blessings beyond counting" card: a verse as a general reminder, not an answer about an object.
// Every verse comes from a reference already in blessings.json (or the abstention); text is loaded and
// guarded elsewhere. Pure functions, so the choice can be tested with a fixed hour and fixed randomness.
import type { BlessingsFile, VerseRef } from "@/lib/types";

export type HomeRef = { key: string; ref: VerseRef; blessingId: string | null };
export type HomeSlots = { night: string[]; day: string[] };
export type Slot = keyof HomeSlots;

const refKey = (r: VerseRef) => `${r.surah}:${r.ayah}${r.ayahEnd ? `-${r.ayahEnd}` : ""}`;

/** One item per reference, in file order, without duplicates and without the refrain. */
export function homeRefs(file: BlessingsFile): HomeRef[] {
  const refrain = new Set(file.refrain.verses.map(refKey));
  const seen = new Set<string>();
  const out: HomeRef[] = [];
  const add = (ref: VerseRef, blessingId: string | null) => {
    const key = refKey(ref);
    if (refrain.has(key) || seen.has(key)) return;
    seen.add(key);
    out.push({ key, ref, blessingId });
  };
  for (const b of file.blessings) for (const v of b.verses) add(v, b.id);
  for (const v of file.abstention.verses) add(v, null);
  return out;
}

export const slotFor = (hour: number): Slot => (hour >= 19 || hour < 5 ? "night" : "day");

/**
 * Index of the verse to show. Half the time (first random draw < 0.5) it comes from the cards preferred
 * at this time of day; otherwise from all verses. `current` is never picked again when there is a choice.
 */
export function pickHome(
  items: { blessingId: string | null }[],
  slots: HomeSlots,
  hour: number,
  random: () => number,
  current?: number,
): number {
  const all = items.map((_, i) => i).filter((i) => i !== current);
  if (all.length === 0) return current ?? 0;
  const preferredIds = new Set(slots[slotFor(hour)]);
  const preferred = all.filter((i) => preferredIds.has(items[i]!.blessingId ?? ""));
  const pool = random() < 0.5 && preferred.length > 0 ? preferred : all;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]!;
}
