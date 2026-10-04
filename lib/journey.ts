import type { Blessing } from "@/lib/types";

export const STATION_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;
export type StationNumber = (typeof STATION_NUMBERS)[number];

export type Station = { n: StationNumber; blessingIds: string[] };

/** The 7 stations in the surah's order; each opens the blessings tagged with its number in blessings.json. */
export function stationsFrom(blessings: Blessing[]): Station[] {
  return STATION_NUMBERS.map((n) => ({
    n,
    blessingIds: blessings.filter((b) => b.journeyStation === n).map((b) => b.id),
  }));
}

/** blessing id → station number, for blessings that belong to a station. */
export function stationByBlessing(blessings: Blessing[]): Record<string, StationNumber> {
  return Object.fromEntries(blessings.filter((b) => b.journeyStation).map((b) => [b.id, b.journeyStation!]));
}

export type StationProgress = { at: string; via: "photo" | "read" };
export type JourneyProgress = Partial<Record<StationNumber, StationProgress>>;

/** First visit wins: a station found by photo stays "photo" even if its card is read again later. */
export function withStation(progress: JourneyProgress, n: StationNumber, via: StationProgress["via"], at: Date): JourneyProgress {
  if (progress[n]) return progress;
  return { ...progress, [n]: { at: at.toISOString(), via } };
}

export const completedCount = (p: JourneyProgress) => STATION_NUMBERS.filter((n) => p[n]).length;

/** The first station not yet done, or null when the journey is complete. */
export const nextStation = (p: JourneyProgress): StationNumber | null => STATION_NUMBERS.find((n) => !p[n]) ?? null;
