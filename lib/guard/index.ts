/**
 * Source Guard: the four content gates from CLAUDE.md / SPEC §7.
 *
 *  Level 1 (hard): every ayah must hash-match the Tanzil manifest, otherwise nothing renders.
 *  Level 2: a translation renders only if its text and a LICENSE file are present (and hash-match);
 *           otherwise Arabic only with "translation pending".
 *  Level 3: review.mapping !== "reviewed" → "mapping under review" badge.
 *  Level 4: review.reflection !== "reviewed" → reflection is not rendered at all.
 */
import { expandRef, sha256, type TextManifest } from "@/lib/quran/tanzil";
import type { TranslationMeta } from "@/lib/sources/translations";
import type { Blessing, Lang, Stage, VerseRef } from "@/lib/types";

export type TranslationSource = {
  meta: TranslationMeta;
  texts: Map<string, string> | null;
  manifest: TextManifest | null;
  licensePresent: boolean;
};

export type SourceBundle = {
  quran: Map<string, string>;
  quranManifest: TextManifest;
  translations: Record<string, TranslationSource>;
};

export type GuardedAyah = { key: string; surah: number; ayah: number; text: string; translation?: string };

export type TranslationStatus =
  | { status: "not-needed" }
  | { status: "shown"; meta: TranslationMeta }
  | { status: "pending" };

export type GuardedPassage =
  | { ok: false; reason: string }
  | { ok: true; refs: VerseRef[]; ayat: GuardedAyah[]; translation: TranslationStatus };

export type GuardedBlessing =
  | { ok: false; reason: string }
  | {
      ok: true;
      blessing: Blessing;
      refs: VerseRef[];
      ayat: GuardedAyah[];
      translation: TranslationStatus;
      mappingUnderReview: boolean;
      reflection: string | null;
    };

type TranslationChoice = { lang: Lang; source: string };

/** Level 1. Returns null (block) if any ayah is missing or its hash differs from the manifest. */
export function verifyAyat(refs: VerseRef[], bundle: SourceBundle): GuardedAyah[] | null {
  if (refs.length === 0) return null;
  const out: GuardedAyah[] = [];
  for (const ref of refs) {
    for (const key of expandRef(ref)) {
      const text = bundle.quran.get(key);
      const expected = bundle.quranManifest.ayat[key];
      if (text === undefined || expected === undefined || sha256(text) !== expected) return null;
      const [surah, ayah] = key.split(":").map(Number) as [number, number];
      out.push({ key, surah, ayah, text });
    }
  }
  return out;
}

/** Level 2. Returns translated texts by ayah key, or null if the translation may not be shown. */
export function verifyTranslation(
  keys: string[],
  choices: TranslationChoice[],
  lang: Lang,
  bundle: SourceBundle,
): { meta: TranslationMeta; texts: Map<string, string> } | null {
  const choice = choices.find((c) => c.lang === lang);
  const source = choice ? bundle.translations[choice.source] : undefined;
  if (!source || !source.licensePresent || !source.texts || !source.manifest) return null;
  const texts = new Map<string, string>();
  for (const key of keys) {
    const text = source.texts.get(key);
    const expected = source.manifest.ayat[key];
    if (!text || expected === undefined || sha256(text) !== expected) return null;
    texts.set(key, text);
  }
  return { meta: source.meta, texts };
}

export function guardPassage(
  refs: VerseRef[],
  choices: TranslationChoice[],
  lang: Lang,
  bundle: SourceBundle,
): GuardedPassage {
  const ayat = verifyAyat(refs, bundle);
  if (!ayat) return { ok: false, reason: "verse-text-mismatch" };

  if (lang === "ar") return { ok: true, refs, ayat, translation: { status: "not-needed" } };

  const tr = verifyTranslation(
    ayat.map((a) => a.key),
    choices,
    lang,
    bundle,
  );
  if (!tr) return { ok: true, refs, ayat, translation: { status: "pending" } };
  return {
    ok: true,
    refs,
    ayat: ayat.map((a) => ({ ...a, translation: tr.texts.get(a.key) })),
    translation: { status: "shown", meta: tr.meta },
  };
}

export function guardBlessing(
  blessing: Blessing,
  opts: { lang: Lang; stage: Stage },
  bundle: SourceBundle,
): GuardedBlessing {
  const passage = guardPassage(blessing.verses, blessing.translations, opts.lang, bundle);
  if (!passage.ok) return passage;

  const reflection =
    blessing.review.reflection === "reviewed"
      ? blessing.reflection?.[opts.stage]?.[opts.lang]?.trim() || null
      : null;

  return {
    ok: true,
    blessing,
    refs: passage.refs,
    ayat: passage.ayat,
    translation: passage.translation,
    mappingUnderReview: blessing.review.mapping !== "reviewed",
    reflection,
  };
}

/** One group of verified ayat per reference, in order, so a card quoting several places shows each on its own. */
export function ayatByRef(refs: VerseRef[], ayat: GuardedAyah[]): { ref: VerseRef; ayat: GuardedAyah[] }[] {
  return refs.map((ref) => ({
    ref,
    ayat: ayat.filter((a) => a.surah === ref.surah && a.ayah >= ref.ayah && a.ayah <= (ref.ayahEnd ?? ref.ayah)),
  }));
}
