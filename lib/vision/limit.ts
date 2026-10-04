/**
 * Per-device daily limit. Best effort: counts live in this server instance's memory,
 * so on serverless the effective limit can be higher. Good enough to cap cost for the demo.
 */
const counts = new Map<string, number>();
let day = "";

export function dailyLimit(): number {
  const n = Number(process.env.DAILY_LIMIT);
  return Number.isFinite(n) && n > 0 ? n : 50;
}

/** Returns true if the device may make another recognition today, and counts it. */
export function takeQuota(deviceId: string, now = new Date()): boolean {
  const today = now.toISOString().slice(0, 10);
  if (today !== day) {
    counts.clear();
    day = today;
  }
  const used = counts.get(deviceId) ?? 0;
  if (used >= dailyLimit()) return false;
  counts.set(deviceId, used + 1);
  return true;
}
