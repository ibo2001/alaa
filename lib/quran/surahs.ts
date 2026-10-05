import type { Lang } from "@/lib/types";

// Names of the surahs referenced in sources/blessings.json (metadata, not Quran text).
// A unit test fails if a referenced surah is missing here.
const NAMES: Record<number, Record<Lang, string>> = {
  2: { ar: "البقرة", en: "Al-Baqarah" },
  6: { ar: "الأنعام", en: "Al-An'am" },
  7: { ar: "الأعراف", en: "Al-A'raf" },
  14: { ar: "إبراهيم", en: "Ibrahim" },
  16: { ar: "النحل", en: "An-Nahl" },
  21: { ar: "الأنبياء", en: "Al-Anbiya" },
  30: { ar: "الروم", en: "Ar-Rum" },
  36: { ar: "يس", en: "Ya-Sin" },
  50: { ar: "ق", en: "Qaf" },
  55: { ar: "الرحمن", en: "Ar-Rahman" },
  56: { ar: "الواقعة", en: "Al-Waqi'ah" },
  67: { ar: "الملك", en: "Al-Mulk" },
  78: { ar: "النبأ", en: "An-Naba" },
  90: { ar: "البلد", en: "Al-Balad" },
  95: { ar: "التين", en: "At-Tin" },
};

export const hasSurahName = (surah: number) => surah in NAMES;

export function surahName(surah: number, lang: Lang): string {
  return NAMES[surah]?.[lang] ?? (lang === "ar" ? `سورة ${formatNumber(surah, "ar")}` : `Surah ${surah}`);
}

export function formatNumber(n: number, lang: Lang): string {
  return lang === "ar" ? new Intl.NumberFormat("ar-EG").format(n) : String(n);
}

/** "Ar-Rahman 55:13" / "الرحمن ٥٥:١٣", with ranges "56:68–70". */
export function formatRef(ref: { surah: number; ayah: number; ayahEnd?: number }, lang: Lang): string {
  const f = (n: number) => formatNumber(n, lang);
  const ayah = ref.ayahEnd ? `${f(ref.ayah)}–${f(ref.ayahEnd)}` : f(ref.ayah);
  return `${surahName(ref.surah, lang)} ${f(ref.surah)}:${ayah}`;
}

export function quranComUrl(ref: { surah: number; ayah: number; ayahEnd?: number }): string {
  return `https://quran.com/${ref.surah}/${ref.ayah}${ref.ayahEnd ? `-${ref.ayahEnd}` : ""}`;
}
