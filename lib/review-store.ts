// Browser only. The reviewer's answers, kept on their device until they send them (and after, so nothing is lost).
import { useSyncExternalStore } from "react";

export type Verdict = "fits" | "replace";
export type CardReview = { verdict?: Verdict; suggestion?: string; notes?: string };
export type ReviewState = {
  cards: Record<string, CardReview>;
  name: string;
  qualification: string;
  consent: boolean;
  sentAt?: string;
};

const KEY = "alaa:review:v1";
const EMPTY: ReviewState = { cards: {}, name: "", qualification: "", consent: false };
const listeners = new Set<() => void>();
let cache: ReviewState | null = null;

function read(): ReviewState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<ReviewState>) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

export function updateReview(fn: (s: ReviewState) => ReviewState) {
  cache = fn(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // storage blocked: answers live for this visit only
  }
  listeners.forEach((l) => l());
}

export function updateCard(id: string, patch: Partial<CardReview>) {
  updateReview((s) => ({ ...s, cards: { ...s.cards, [id]: { ...s.cards[id], ...patch } } }));
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useReview(): ReviewState {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
