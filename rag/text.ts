// Text helpers for search only. Nothing produced here is ever displayed: displayed text always comes
// from the original files through the Source Guard.

// Harakat, Quranic annotation marks, superscript alef, Uthmani small letters, tatweel.
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

export function normalizeArabic(s: string): string {
  return s
    .normalize("NFC")
    .replace(MARKS, "")
    .replace(/[آأإٱ-ٳ]/g, "ا") // آ أ إ ٱ → ا
    .replace(/ى/g, "ي") // ى → ي
    .replace(/ة/g, "ه") // ة → ه
    .replace(/ؤ/g, "و") // ؤ → و
    .replace(/ئ/g, "ي"); // ئ → ي
}

// Longest first, so "وال" wins over "ال".
const PREFIXES = ["وال", "بال", "فال", "كال", "لل", "ال"];

/** The word plus its form without a leading article (or conjunction/preposition + article). */
export function arabicVariants(word: string): string[] {
  for (const p of PREFIXES) {
    if (word.startsWith(p) && word.length - p.length >= 2) return [word, word.slice(p.length)];
  }
  return [word];
}

const STOP = new Set([
  "the", "and", "of", "to", "in", "is", "it", "that", "for", "you", "he", "they", "we", "with", "his", "them",
  "their", "who", "not", "be", "was", "which", "from", "on", "as", "are", "have", "will", "then", "this", "by",
  "but", "or", "those", "an", "so", "do", "has", "had", "its", "all", "what", "your", "our",
  "في", "من", "على", "الي", "عن", "ان", "ما", "لا", "لم", "لن", "هو", "هي", "هم", "الذي", "الذين", "التي",
  "ثم", "او", "قد", "كل", "ذلك", "هذا", "به", "له", "لهم", "انه", "كان",
]);

export function tokenize(s: string): string[] {
  return normalizeArabic(s.toLowerCase())
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

export const isArabic = (token: string) => /[؀-ۿ]/.test(token);

/** Removes QuranEnc footnote markers such as "[3]". */
export const stripMarkers = (s: string) => s.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();

export const stripHtml = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
