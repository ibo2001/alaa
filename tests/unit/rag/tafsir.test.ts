import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fileSha256, readTafsir, TafsirError, verifyTafsir } from "@/rag/tafsir";

const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite") as typeof import("node:sqlite");

/** Synthetic database: upstream schema, placeholder content. */
export function makeFixtureDb(path: string) {
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE word_statistics (surahNo INT, ayahNo INT, wordNo INT, root TEXT, wordText TEXT, repeatitionCount INT, rootRepeatitionCount INT);
    CREATE TABLE tafsir_moyassar (sura INT, aya INT, tafsir TEXT);
    CREATE TABLE QuranTafseer (surahNo INT, ayahNo INT, Mukhtasarar TEXT, Mukhtasaren TEXT, Mukhtasarbn TEXT);
    INSERT INTO word_statistics VALUES (16, 53, 1, 'نعم', 'نِعْمَةٍ', 1, 1), (1, 2, 2, 'حمد', 'ٱلْحَمْدُ', 1, 1), (1, 2, 3, NULL, 'x', 0, 0);
    INSERT INTO tafsir_moyassar VALUES (16, 53, '<p>placeholder muyassar 16:53</p>');
    INSERT INTO QuranTafseer VALUES (16, 53, 'placeholder mukhtasar ar 16:53', 'placeholder mukhtasar en 16:53', ''), (1, 2, '', '', '');
  `);
  db.close();
}

function fixtureRoot() {
  const root = mkdtempSync(join(tmpdir(), "alaa-rag-"));
  mkdirSync(join(root, "sources/tafsir"), { recursive: true });
  makeFixtureDb(join(root, "sources/tafsir/quran.db"));
  return root;
}

describe("readTafsir", () => {
  it("reads roots per ayah, word forms and tafsir texts, skipping empty values", () => {
    const root = fixtureRoot();
    const t = readTafsir(join(root, "sources/tafsir/quran.db"));
    expect([...t.rootsByAyah.get("16:53")!]).toEqual(["نعم"]);
    expect(t.forms).toContainEqual({ form: "نِعْمَةٍ", root: "نعم" });
    expect(t.forms.some((f) => f.form === "x")).toBe(false); // NULL root skipped
    expect(t.texts.get("16:53")).toEqual({
      "al-Muyassar": "<p>placeholder muyassar 16:53</p>",
      "al-Mukhtasar (Arabic)": "placeholder mukhtasar ar 16:53",
      "al-Mukhtasar (English)": "placeholder mukhtasar en 16:53",
    });
    expect(t.texts.get("1:2")).toEqual({});
  });
});

describe("verifyTafsir (fails closed)", () => {
  it("stops with the file name and location when the database is missing", async () => {
    const root = mkdtempSync(join(tmpdir(), "alaa-rag-"));
    await expect(verifyTafsir(root)).rejects.toThrow(/sources\/tafsir\/quran\.db/);
  });
  it("stops when LICENSE or manifest.json is missing", async () => {
    const root = fixtureRoot();
    await expect(verifyTafsir(root)).rejects.toThrow(/LICENSE/);
    writeFileSync(join(root, "sources/tafsir/LICENSE"), "CC BY 4.0");
    await expect(verifyTafsir(root)).rejects.toThrow(/manifest\.json/);
  });
  it("stops with the expected hash when the file changed", async () => {
    const root = fixtureRoot();
    writeFileSync(join(root, "sources/tafsir/LICENSE"), "CC BY 4.0");
    const manifest = { file: "quran.db", sha256: "0".repeat(64), source: "test", version: "test", obtained: "2026-10-06", license: "CC BY 4.0" };
    writeFileSync(join(root, "sources/tafsir/manifest.json"), JSON.stringify(manifest));
    const err = await verifyTafsir(root).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TafsirError);
    expect(String(err)).toContain("0".repeat(64));
  });
  it("passes when the hash matches the manifest", async () => {
    const root = fixtureRoot();
    writeFileSync(join(root, "sources/tafsir/LICENSE"), "CC BY 4.0");
    const sha256 = await fileSha256(join(root, "sources/tafsir/quran.db"));
    writeFileSync(join(root, "sources/tafsir/manifest.json"), JSON.stringify({ file: "quran.db", sha256, source: "t", version: "t", obtained: "t", license: "CC BY 4.0" }));
    await expect(verifyTafsir(root)).resolves.toMatchObject({ sha256 });
  });
});
