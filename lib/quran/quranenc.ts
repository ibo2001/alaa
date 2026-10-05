// Reads a translation in QuranEnc.com's XML format. The file is kept exactly as downloaded (its licence
// forbids changes and asks to keep the version information inside it); text and footnotes are taken
// byte-for-byte from the CDATA sections.
import { ayahKey, parseTanzil, sha256, type TextManifest } from "./tanzil";

export type QuranEncTranslation = {
  version: string | null;
  texts: Map<string, string>;
  /** Footnotes per ayah, only for ayat that have them. Shown with the translation, never dropped. */
  notes: Map<string, string>;
};

const cdata = (s: string | undefined) => {
  const m = s?.match(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/);
  return m ? m[1]! : "";
};

export function parseQuranEncXml(content: string): QuranEncTranslation {
  const version = content.match(/<updated_at>[^<]*\((v[^)]+)\)<\/updated_at>/)?.[1] ?? null;
  const texts = new Map<string, string>();
  const notes = new Map<string, string>();
  const suraRe = /<sura number="(\d+)">([\s\S]*?)<\/sura>/g;
  const ayaRe = /<aya number="(\d+)">\s*<translation>([\s\S]*?)<\/translation>\s*<footnotes>([\s\S]*?)<\/footnotes>\s*<\/aya>/g;
  for (const sura of content.matchAll(suraRe)) {
    for (const aya of sura[2]!.matchAll(ayaRe)) {
      const key = ayahKey(Number(sura[1]), Number(aya[1]));
      texts.set(key, cdata(aya[2]));
      const note = cdata(aya[3]);
      if (note !== "") notes.set(key, note);
    }
  }
  if (texts.size === 0) throw new Error("No ayat found in QuranEnc XML");
  return { version, texts, notes };
}

/** What the per-ayah hash covers: the translation, plus its footnotes when it has any. */
export const hashedTranslation = (text: string, notes: string | undefined) => (notes ? `${text}\n\n${notes}` : text);

/** Any registered translation file, by format: texts by ayah key, plus footnotes where the format has them. */
export function parseTranslationFile(format: "tanzil" | "quranenc-xml", content: string): { texts: Map<string, string>; notes: Map<string, string> } {
  if (format === "quranenc-xml") return parseQuranEncXml(content);
  return { texts: parseTanzil(content), notes: new Map() };
}

/** Per-ayah SHA-256 of translation (+ footnotes) for the Source Guard, level 2. */
export function buildTranslationManifest(source: string, content: string, format: "tanzil" | "quranenc-xml"): TextManifest {
  const { texts, notes } = parseTranslationFile(format, content);
  const ayat: Record<string, string> = {};
  for (const [k, text] of texts) ayat[k] = sha256(hashedTranslation(text, notes.get(k)));
  return { source, fileSha256: sha256(content), ayahCount: Object.keys(ayat).length, ayat };
}
