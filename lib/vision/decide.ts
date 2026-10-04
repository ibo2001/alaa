import { blessingForConcept, getConcept } from "@/lib/sources/data";
import type { VisionResult } from "./types";

export const CARD_THRESHOLD = 0.75;
export const CONFIRM_THRESHOLD = 0.45;
/** With a person in frame, only these concepts may be offered (never attributes of the person). */
export const PERSON_ALLOWED = new Set(["eye", "hand"]);

/** True if one concept is a broader name for the other (the model often reports both for one object). */
function sameObject(a: string, b: string): boolean {
  return getConcept(a)?.broader === b || getConcept(b)?.broader === a;
}

export type DecisionCandidate = { concept: string; confidence: number; blessingId?: string };

export type Decision =
  | { kind: "card"; concept: string; blessingId: string }
  | { kind: "confirm"; candidates: DecisionCandidate[] }
  | { kind: "abstain"; reason: "low-confidence" | "no-blessing" | "person" | "unsafe"; concept?: string };

/**
 * Applies the thresholds from SPEC §6:
 *   ≥ 0.75 card · 0.45–0.75 "Is this…?" (up to 3 candidates) · < 0.45 abstain.
 * Two or more confident candidates that open different blessings → let the user choose.
 */
export function decide(result: VisionResult): Decision {
  if (result.unsafe) return { kind: "abstain", reason: "unsafe" };

  let candidates = result.candidates
    .filter((c) => c.concept !== "none")
    .sort((a, b) => b.confidence - a.confidence);

  if (result.is_person) {
    candidates = candidates.filter((c) => PERSON_ALLOWED.has(c.concept));
    if (candidates.length === 0) return { kind: "abstain", reason: "person" };
  }

  const withBlessing: DecisionCandidate[] = candidates
    .slice(0, 3)
    .map((c) => ({ ...c, blessingId: blessingForConcept(c.concept)?.id }));

  // If the model reports a concept and its broader name for one object (drinking_water / water) and both are
  // confident, prefer the specific one, so the same photo always opens the same card.
  const first = withBlessing[0];
  if (first && first.confidence >= CARD_THRESHOLD) {
    const specific = withBlessing.find(
      (c) => c.confidence >= CARD_THRESHOLD && getConcept(c.concept)?.broader === first.concept,
    );
    if (specific) {
      withBlessing.splice(withBlessing.indexOf(specific), 1);
      withBlessing.unshift(specific);
    }
  }

  const top = withBlessing[0];
  if (!top || top.confidence < CONFIRM_THRESHOLD) return { kind: "abstain", reason: "low-confidence" };

  if (top.confidence >= CARD_THRESHOLD) {
    const confidentBlessings = new Set(
      withBlessing
        .filter((c) => c.confidence >= CARD_THRESHOLD && c.blessingId && (c === top || !sameObject(c.concept, top.concept)))
        .map((c) => c.blessingId),
    );
    if (confidentBlessings.size > 1) {
      return { kind: "confirm", candidates: withBlessing.filter((c) => c.confidence >= CONFIRM_THRESHOLD) };
    }
    if (top.blessingId) return { kind: "card", concept: top.concept, blessingId: top.blessingId };
    // Confidently recognized, but nothing in the database mentions it.
    const alt = withBlessing.find((c) => c.blessingId && c.confidence >= CONFIRM_THRESHOLD);
    if (alt) return { kind: "confirm", candidates: withBlessing.filter((c) => c.confidence >= CONFIRM_THRESHOLD) };
    return { kind: "abstain", reason: "no-blessing", concept: top.concept };
  }

  return { kind: "confirm", candidates: withBlessing.filter((c) => c.confidence >= CONFIRM_THRESHOLD) };
}
