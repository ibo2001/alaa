import samplesFile from "@/public/samples/samples.json";
import cacheFile from "@/public/samples/cache.json";
import type { VisionResult } from "./types";

export type Sample = (typeof samplesFile.samples)[number];
export const samples: Sample[] = samplesFile.samples;

/** Recorded model results for sample photos (written by `eval/quick.ts --record`), for instant, consistent demos. */
const cache = cacheFile.results as Record<string, { result: VisionResult; model: string; recordedAt: string }>;

export const getSample = (id: string) => samples.find((s) => s.id === id);
export const cachedSampleResult = (id: string): VisionResult | undefined => cache[id]?.result;
