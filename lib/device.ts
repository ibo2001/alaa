// Browser only. The learning stage and journey progress live on the device (IndexedDB), never on a server.
import { del, get, set } from "idb-keyval";
import { withStation, type JourneyProgress, type StationNumber, type StationProgress } from "@/lib/journey";
import type { Stage } from "@/lib/types";

const STAGE_KEY = "stage";
const JOURNEY_KEY = "journey";

/** The learning stage the user chose, or null if they skipped the question. Never inferred. */
export async function getStage(): Promise<Stage | null> {
  const v = await get<Stage>(STAGE_KEY);
  return v === "new" || v === "familiar" ? v : null;
}

export async function setStage(stage: Stage): Promise<void> {
  await set(STAGE_KEY, stage);
}

export async function getJourney(): Promise<JourneyProgress> {
  return (await get<JourneyProgress>(JOURNEY_KEY)) ?? {};
}

export async function markStation(n: StationNumber, via: StationProgress["via"]): Promise<JourneyProgress> {
  const next = withStation(await getJourney(), n, via, new Date());
  await set(JOURNEY_KEY, next);
  return next;
}

export async function resetJourney(): Promise<void> {
  await del(JOURNEY_KEY);
}
