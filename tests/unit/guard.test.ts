import { describe, expect, it } from "vitest";
import { guardBlessing, guardPassage, type SourceBundle } from "@/lib/guard";
import { loadSources } from "@/lib/sources/load";
import { blessings, data, getBlessing } from "@/lib/sources/data";
import type { Blessing } from "@/lib/types";

const real = loadSources();
const water = getBlessing("water")!;
const drinking = getBlessing("drinking-water")!; // a three-ayah range

/** Copy of the real bundle with one ayah's text replaced. */
function withQuranText(key: string, mutate: (t: string) => string): SourceBundle {
  const quran = new Map(real.quran);
  const original = quran.get(key)!;
  const altered = mutate(original);
  expect(altered).not.toBe(original);
  quran.set(key, altered);
  return { ...real, quran };
}

function withTranslation(id: string, patch: Partial<SourceBundle["translations"][string]>): SourceBundle {
  return {
    ...real,
    translations: { ...real.translations, [id]: { ...real.translations[id]!, ...patch } },
  };
}

const reviewed = (b: Blessing, patch: Partial<Blessing["review"]>): Blessing => ({
  ...b,
  review: { ...b.review, ...patch },
});

describe("Level 1: verse text must hash-match Tanzil", () => {
  it("every seed blessing, the abstention and the refrain pass with the real files", () => {
    for (const b of blessings) expect(guardBlessing(b, { lang: "ar", stage: "new" }, real).ok, b.id).toBe(true);
    expect(guardPassage(data.abstention.verses, [], "ar", real).ok).toBe(true);
    expect(guardPassage(data.refrain.verses, [], "ar", real).ok).toBe(true);
  });

  it("each abstention ayah is shown whole: every ayah key of the reference is present", async () => {
    const { abstentionPassages } = await import("@/lib/sources/passages");
    const cards = abstentionPassages("ar");
    expect(cards.map((c) => c.ayat.map((a) => a.key))).toEqual([["14:34"], ["16:18"]]);
    for (const c of cards) expect(c.ayat[0]!.text).toBe(real.quran.get(c.ayat[0]!.key));
  });

  it("blocks the card when one letter of an ayah is altered", () => {
    // Swap the first two characters: same letters, different text.
    const bundle = withQuranText("21:30", (t) => t.charAt(1) + t.charAt(0) + t.slice(2));
    const result = guardBlessing(water, { lang: "en", stage: "new" }, bundle);
    expect(result.ok).toBe(false);
  });

  it("blocks the card when a single character is removed from any ayah in a range", () => {
    const bundle = withQuranText("56:69", (t) => t.slice(0, -1));
    expect(guardBlessing(drinking, { lang: "ar", stage: "new" }, bundle).ok).toBe(false);
  });

  it("blocks the card when an ayah is missing", () => {
    const quran = new Map(real.quran);
    quran.delete("21:30");
    expect(guardBlessing(water, { lang: "ar", stage: "new" }, { ...real, quran }).ok).toBe(false);
  });

  it("blocks a reference that does not exist", () => {
    const bogus = { ...water, verses: [{ surah: 1, ayah: 99 }] };
    expect(guardBlessing(bogus, { lang: "ar", stage: "new" }, real).ok).toBe(false);
  });

  it("renders text exactly as in the Tanzil file", () => {
    const result = guardBlessing(drinking, { lang: "ar", stage: "new" }, real);
    if (!result.ok) throw new Error("expected ok");
    expect(result.ayat.map((a) => a.key)).toEqual(["56:68", "56:69", "56:70"]);
    for (const a of result.ayat) expect(a.text).toBe(real.quran.get(a.key));
  });
});

describe("Level 2: translation needs text and a LICENSE", () => {
  it("shows the licensed translation with its translator", () => {
    const result = guardBlessing(water, { lang: "en", stage: "new" }, real);
    if (!result.ok) throw new Error("expected ok");
    expect(result.translation.status).toBe("shown");
    if (result.translation.status === "shown") expect(result.translation.meta.translator).toBe("Talal Itani");
    expect(result.ayat[0]!.translation).toBe(real.translations["en.itani"]!.texts!.get("21:30"));
  });

  it("missing LICENSE → Arabic only, translation pending", () => {
    const bundle = withTranslation("en.itani", { licensePresent: false });
    const result = guardBlessing(water, { lang: "en", stage: "new" }, bundle);
    if (!result.ok) throw new Error("Arabic must still render");
    expect(result.translation.status).toBe("pending");
    expect(result.ayat.every((a) => a.translation === undefined)).toBe(true);
    expect(result.ayat[0]!.text).toBe(real.quran.get("21:30"));
  });

  it("missing translation text → pending", () => {
    const bundle = withTranslation("en.itani", { texts: null });
    const result = guardBlessing(water, { lang: "en", stage: "new" }, bundle);
    expect(result.ok && result.translation.status).toBe("pending");
  });

  it("altered translation text → pending", () => {
    const texts = new Map(real.translations["en.itani"]!.texts!);
    texts.set("21:30", texts.get("21:30")!.replace(/e/, "a"));
    const result = guardBlessing(water, { lang: "en", stage: "new" }, withTranslation("en.itani", { texts }));
    expect(result.ok && result.translation.status).toBe("pending");
  });

  it("Arabic UI needs no translation", () => {
    const result = guardBlessing(water, { lang: "ar", stage: "new" }, real);
    expect(result.ok && result.translation.status).toBe("not-needed");
  });
});

describe("Level 3: mapping review badge", () => {
  it("draft mapping → under-review badge", () => {
    const result = guardBlessing(water, { lang: "ar", stage: "new" }, real);
    expect(result.ok && result.mappingUnderReview).toBe(true);
  });

  it("reviewed mapping → no badge", () => {
    const result = guardBlessing(reviewed(water, { mapping: "reviewed" }), { lang: "ar", stage: "new" }, real);
    expect(result.ok && result.mappingUnderReview).toBe(false);
  });
});

describe("Level 4: reflection only when reviewed", () => {
  const withReflection: Blessing = { ...water, reflection: { new: { en: "test reflection" } } };

  it("draft reflection is hidden even when text exists", () => {
    const result = guardBlessing(withReflection, { lang: "en", stage: "new" }, real);
    expect(result.ok && result.reflection).toBeNull();
  });

  it("reviewed reflection is shown for the matching stage and language", () => {
    const b = reviewed(withReflection, { reflection: "reviewed" });
    const shown = guardBlessing(b, { lang: "en", stage: "new" }, real);
    expect(shown.ok && shown.reflection).toBe("test reflection");
    const otherStage = guardBlessing(b, { lang: "en", stage: "familiar" }, real);
    expect(otherStage.ok && otherStage.reflection).toBeNull();
  });
});
