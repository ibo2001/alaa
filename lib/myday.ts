// Browser only. "My Day" lives on the device (IndexedDB), never on a server.
import { get, set } from "idb-keyval";

export type DayEntry = { blessingId: string; at: string };

export const dayKey = (d = new Date()) =>
  `myday:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export async function getDay(d = new Date()): Promise<DayEntry[]> {
  return (await get<DayEntry[]>(dayKey(d))) ?? [];
}

/** Adds a blessing to today's list once; returns the updated list. */
export async function addToDay(blessingId: string, d = new Date()): Promise<DayEntry[]> {
  const entries = await getDay(d);
  if (entries.some((e) => e.blessingId === blessingId)) return entries;
  const next = [...entries, { blessingId, at: d.toISOString() }];
  await set(dayKey(d), next);
  return next;
}
