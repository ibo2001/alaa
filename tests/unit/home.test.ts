import { describe, expect, it } from "vitest";
import { homeRefs, pickHome, slotFor, type HomeRef } from "@/lib/home";
import { guardPassage } from "@/lib/guard";
import { loadSources } from "@/lib/sources/load";
import { blessings, data, getBlessing } from "@/lib/sources/data";
import home from "@/sources/home.json";

const refs = homeRefs(data);
const key = (r: HomeRef) => r.key;

describe("Home: blessing verses", () => {
  it("takes every verse from blessings.json and the abstention, one item per reference, no duplicates", () => {
    const keys = refs.map(key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(refs.length).toBeGreaterThan(blessings.length); // multi-verse cards give several items
    for (const r of refs) {
      if (r.blessingId) expect(getBlessing(r.blessingId)!.verses).toContainEqual(r.ref);
      else expect(data.abstention.verses).toContainEqual(r.ref);
    }
  });

  it("leaves out the refrain, which is shown under every verse anyway", () => {
    const refrain = data.refrain.verses[0]!;
    expect(refs.some((r) => r.ref.surah === refrain.surah && r.ref.ayah === refrain.ayah)).toBe(false);
  });

  it("every item passes the Source Guard with the real files", () => {
    const bundle = loadSources();
    for (const r of refs) expect(guardPassage([r.ref], [], "ar", bundle).ok, r.key).toBe(true);
  });

  it("home.json names only existing blessings", () => {
    for (const id of [...home.night, ...home.day]) expect(getBlessing(id), id).toBeDefined();
  });
});

describe("Home: picking by time of day", () => {
  it("night is 19:00–04:59, day is 05:00–18:59", () => {
    expect([4, 5, 18, 19, 23, 0].map(slotFor)).toEqual(["night", "day", "day", "night", "night", "night"]);
  });

  it("prefers the time-of-day cards when the first coin says so", () => {
    const i = pickHome(refs, home, 22, () => 0.1); // < 0.5 → preferred pool
    expect(home.night).toContain(refs[i]!.blessingId);
  });

  it("otherwise picks from all verses", () => {
    const seq = [0.9, 0.0]; // coin: all verses; then the first item
    const i = pickHome(refs, home, 10, () => seq.shift()!);
    expect(i).toBe(0);
  });

  it("never repeats the verse being shown", () => {
    for (let n = 0; n < 50; n++) {
      const i = pickHome(refs, home, 12, Math.random, 3);
      expect(i).not.toBe(3);
    }
  });
});
