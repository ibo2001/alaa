import { describe, expect, it } from "vitest";
import { completedCount, nextStation, stationByBlessing, stationsFrom, withStation } from "@/lib/journey";
import { blessings } from "@/lib/sources/data";
import { refrainRepeatCount } from "@/lib/sources/passages";

describe("Ar-Rahman Journey", () => {
  it("has 7 stations in order, each opening at least one blessing", () => {
    const stations = stationsFrom(blessings);
    expect(stations.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const s of stations) expect(s.blessingIds.length).toBeGreaterThan(0);
  });

  // Other verses may follow (e.g. a reviewer's suggestion), but the station opens with Ar-Rahman.
  it("every station blessing opens with a verse from Surah Ar-Rahman", () => {
    for (const id of Object.keys(stationByBlessing(blessings))) {
      const b = blessings.find((x) => x.id === id)!;
      expect(b.verses[0]!.surah).toBe(55);
    }
  });

  it("keeps the first visit: found by photo stays photo", () => {
    const t = new Date("2026-10-05T10:00:00Z");
    let p = withStation({}, 3, "photo", t);
    p = withStation(p, 3, "read", new Date("2026-10-05T11:00:00Z"));
    expect(p[3]).toEqual({ at: t.toISOString(), via: "photo" });
  });

  it("counts progress and finds the next station", () => {
    const t = new Date();
    const p = withStation(withStation({}, 1, "read", t), 2, "photo", t);
    expect(completedCount(p)).toBe(2);
    expect(nextStation(p)).toBe(3);
    const all = [1, 2, 3, 4, 5, 6, 7].reduce((acc, n) => withStation(acc, n as 1, "read", t), {});
    expect(nextStation(all)).toBeNull();
  });
});

describe("refrain repeat count", () => {
  it("is counted from the Tanzil hashes and matches the spec (31)", () => {
    expect(refrainRepeatCount()).toBe(31);
  });
});
