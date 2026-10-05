// Per-ayah passages for search. Normalised copies only; the app and the reviewer page render text from
// the original files through the Source Guard.
import type { SourceBundle } from "@/lib/guard";
import { TRANSLATION_ID } from "./config";
import type { TafsirData } from "./tafsir";
import { indexSpellings, normalizeArabic, stripHtml, stripMarkers } from "./text";

export type Passage = { key: string; ar: string; en: string; enMukhtasar: string; arMuyassar: string; roots: string[] };

export function buildPassages(bundle: SourceBundle, tafsir: TafsirData): Passage[] {
  const tr = bundle.translations[TRANSLATION_ID]?.texts;
  if (!tr) throw new Error(`Translation ${TRANSLATION_ID} is missing; it is required for search`);
  const out: Passage[] = [];
  for (const [key, text] of bundle.quran) {
    const t = tafsir.texts.get(key) ?? {};
    out.push({
      key,
      ar: normalizeArabic(text),
      en: stripMarkers(tr.get(key) ?? ""),
      enMukhtasar: stripHtml(t["al-Mukhtasar (English)"] ?? ""),
      arMuyassar: normalizeArabic(stripHtml(t["al-Muyassar"] ?? "")),
      roots: [...(tafsir.rootsByAyah.get(key) ?? [])].sort(),
    });
  }
  return out;
}

export function buildLexicon(forms: { form: string; root: string }[]): Record<string, string[]> {
  const lex = new Map<string, Set<string>>();
  for (const { form, root } of forms) {
    for (const v of indexSpellings(form)) {
      if (!lex.has(v)) lex.set(v, new Set());
      lex.get(v)!.add(root);
    }
  }
  return Object.fromEntries([...lex].map(([k, v]) => [k, [...v].sort()]));
}
