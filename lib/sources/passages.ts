// Server/build-time only.
import { guardBlessing, guardPassage, type GuardedBlessing, type GuardedPassage } from "@/lib/guard";
import type { Lang, Stage } from "@/lib/types";
import { data, getBlessing } from "./data";
import { loadSources } from "./load";

const DEFAULT_TRANSLATIONS = [{ lang: "en" as const, source: "en.itani" }];

export function refrainPassage(lang: Lang): GuardedPassage {
  return guardPassage(data.refrain.verses, DEFAULT_TRANSLATIONS, lang, loadSources());
}

/** Each abstention ayah is shown whole, as its own card; any that fails the Guard is dropped. */
export function abstentionPassages(lang: Lang): Extract<GuardedPassage, { ok: true }>[] {
  return data.abstention.verses
    .map((ref) => guardPassage([ref], DEFAULT_TRANSLATIONS, lang, loadSources()))
    .filter((p): p is Extract<GuardedPassage, { ok: true }> => p.ok);
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
