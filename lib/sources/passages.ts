// Server/build-time only.
import { ayahKey } from "@/lib/quran/tanzil";
import { guardBlessing, guardPassage, type GuardedBlessing, type GuardedPassage } from "@/lib/guard";
import type { Lang, Stage, VerseRef } from "@/lib/types";
import { data, getBlessing } from "./data";
import { loadSources } from "./load";

const DEFAULT_TRANSLATIONS = [{ lang: "en" as const, source: "en.itani" }];

export function refrainPassage(lang: Lang): GuardedPassage {
  return guardPassage(data.refrain.verses, DEFAULT_TRANSLATIONS, lang, loadSources());
}

/** How many ayat of the refrain's surah are identical to it, counted from the Tanzil manifest hashes. */
export function refrainRepeatCount(bundle = loadSources()): number {
  const ref = data.refrain.verses[0]!;
  const hashes = bundle.quranManifest.ayat;
  const target = hashes[ayahKey(ref.surah, ref.ayah)];
  if (!target) return 0;
  const prefix = `${ref.surah}:`;
  return Object.entries(hashes).filter(([key, h]) => key.startsWith(prefix) && h === target).length;
}

/** Each abstention ayah is shown whole, as its own card; any that fails the Guard is dropped. */
export function abstentionPassages(lang: Lang): Extract<GuardedPassage, { ok: true }>[] {
  return data.abstention.verses
    .map((ref) => guardPassage([ref], DEFAULT_TRANSLATIONS, lang, loadSources()))
    .filter((p): p is Extract<GuardedPassage, { ok: true }> => p.ok);
}

/** Each reference guarded on its own (whole ayat, never cut), in order. */
export function guardedRefs(refs: VerseRef[], lang: Lang): GuardedPassage[] {
  return refs.map((ref) => guardPassage([ref], DEFAULT_TRANSLATIONS, lang, loadSources()));
}

/** True if a blessing's only verse is the refrain itself (so the card doesn't show it twice). */
export function isRefrainOnly(refs: { surah: number; ayah: number; ayahEnd?: number }[]): boolean {
  const r = data.refrain.verses;
  return refs.length === r.length && refs.every((x, i) => x.surah === r[i]!.surah && x.ayah === r[i]!.ayah && !x.ayahEnd);
}

export function blessingCard(id: string, lang: Lang, stage: Stage): GuardedBlessing | null {
  const blessing = getBlessing(id);
  return blessing ? guardBlessing(blessing, { lang, stage }, loadSources()) : null;
}
