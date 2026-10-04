// Server/build-time only.
import { guardBlessing, guardPassage, type GuardedBlessing, type GuardedPassage } from "@/lib/guard";
import type { Lang, Stage } from "@/lib/types";
import { data, getBlessing } from "./data";
import { loadSources } from "./load";

const DEFAULT_TRANSLATIONS = [{ lang: "en" as const, source: "en.itani" }];

export function refrainPassage(lang: Lang): GuardedPassage {
  return guardPassage(data.refrain.verses, DEFAULT_TRANSLATIONS, lang, loadSources());
}

export function abstentionPassage(lang: Lang): GuardedPassage {
  return guardPassage(data.abstention.verses, DEFAULT_TRANSLATIONS, lang, loadSources());
}

export function blessingCard(id: string, lang: Lang, stage: Stage): GuardedBlessing | null {
  const blessing = getBlessing(id);
  return blessing ? guardBlessing(blessing, { lang, stage }, loadSources()) : null;
}
