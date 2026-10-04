import { createHash } from "node:crypto";
import type { VerseRef } from "@/lib/types";

/** Key for one ayah: "surah:ayah". */
export function ayahKey(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

/** Expands a reference (with optional ayahEnd) into its individual ayah keys, in order. */
export function expandRef(ref: VerseRef): string[] {
  const end = ref.ayahEnd ?? ref.ayah;
  const keys: string[] = [];
  for (let a = ref.ayah; a <= end; a++) keys.push(ayahKey(ref.surah, a));
  return keys;
}

/**
 * Parses a Tanzil text file in `surah|ayah|text` format.
 * Comment lines (starting with "#") and blank lines are skipped; the text itself is kept byte-for-byte.
 */
export function parseTanzil(content: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const raw of content.split("\n")) {
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    if (line === "" || line.startsWith("#")) continue;
    const first = line.indexOf("|");
    const second = line.indexOf("|", first + 1);
    if (first < 0 || second < 0) throw new Error(`Malformed Tanzil line: ${line.slice(0, 40)}`);
    const surah = Number(line.slice(0, first));
    const ayah = Number(line.slice(first + 1, second));
    if (!Number.isInteger(surah) || !Number.isInteger(ayah)) {
      throw new Error(`Malformed Tanzil reference: ${line.slice(0, 40)}`);
    }
    out.set(ayahKey(surah, ayah), line.slice(second + 1));
  }
  return out;
}

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export type TextManifest = {
  source: string;
  fileSha256: string;
  ayahCount: number;
  ayat: Record<string, string>;
};

export function buildManifest(source: string, content: string): TextManifest {
  const ayat: Record<string, string> = {};
  for (const [k, text] of parseTanzil(content)) ayat[k] = sha256(text);
  return { source, fileSha256: sha256(content), ayahCount: Object.keys(ayat).length, ayat };
}
