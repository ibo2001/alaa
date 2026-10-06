"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatNumber } from "@/lib/quran/surahs";
import { updateCard, updateReview, useReview, type ReviewState } from "@/lib/review-store";
import type { Lang } from "@/lib/types";

type T = (key: string, values?: Record<string, string | number>) => string;

const choice = "min-h-11 flex-1 rounded-full border-2 px-4 py-2 text-sm transition-colors";
const field = "w-full rounded-xl border border-layl/30 bg-white px-3 py-2 text-sm focus:border-layl focus:outline-none";

/** "Fits" / "needs replacing", a suggested reference and notes for one card. Saved on the device as you go. */
export function ReviewCardControls({ id, label }: { id: string; label: string }) {
  const t = useTranslations("review");
  const card = useReview().cards[id] ?? {};

  return (
    <div className="mt-4 space-y-3 border-t border-layl/10 pt-4 print:hidden" data-review-card={id}>
      <div role="group" aria-label={t("verdictLabel", { name: label })} className="flex gap-2">
        <button
          type="button"
          aria-pressed={card.verdict === "fits"}
          onClick={() => updateCard(id, { verdict: "fits" })}
          className={`${choice} ${card.verdict === "fits" ? "border-nakhl bg-nakhl text-sama" : "border-nakhl/40 text-nakhl hover:border-nakhl"}`}
        >
          {t("checkFits")}
        </button>
        <button
          type="button"
          aria-pressed={card.verdict === "replace"}
          onClick={() => updateCard(id, { verdict: "replace" })}
          className={`${choice} ${card.verdict === "replace" ? "border-tamr bg-tamr text-sama" : "border-tamr/40 text-tamr hover:border-tamr"}`}
        >
          {t("needsReplace")}
        </button>
      </div>
      {card.verdict === "replace" && (
        <label className="block text-sm">
          {t("suggestion")}
          <input
            className={`${field} mt-1`}
            value={card.suggestion ?? ""}
            onChange={(e) => updateCard(id, { suggestion: e.target.value })}
            placeholder={t("suggestionPlaceholder")}
          />
        </label>
      )}
      <label className="block text-sm">
        {t("notes")}
        <textarea className={`${field} mt-1`} rows={2} value={card.notes ?? ""} onChange={(e) => updateCard(id, { notes: e.target.value })} />
      </label>
    </div>
  );
}

type Item = { id: string; label: string; refs: string };

function summaryText(s: ReviewState, items: Item[], t: T): string {
  const lines = [t("textTitle"), `${t("name")}: ${s.name || "—"}`, `${t("qualification")}: ${s.qualification || "—"}`, `${t("consentShort")}: ${s.consent ? t("yes") : t("no")}`, ""];
  items.forEach((it, i) => {
    const c = s.cards[it.id] ?? {};
    const verdict = c.verdict === "fits" ? t("checkFits") : c.verdict === "replace" ? t("needsReplace") : t("notReviewed");
    let line = `${i + 1}. ${it.label} [${it.id}] (${it.refs}): ${verdict}`;
    if (c.verdict === "replace" && c.suggestion) line += ` → ${t("suggestion")}: ${c.suggestion}`;
    if (c.notes) line += ` · ${t("notes")} ${c.notes}`;
    lines.push(line);
  });
  return lines.join("\n");
}

/** Progress, reviewer details and sending. Answers go to Ibrahim's private Google Form; copying is the fallback. */
export function ReviewSubmit({ items, action, entries }: { items: Item[]; action: string; entries: Record<"name" | "qualification" | "consent" | "review", string> }) {
  const t = useTranslations("review") as unknown as T;
  const lang = useLocale() as Lang;
  const s = useReview();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "copied">("idle");
  const done = items.filter((it) => s.cards[it.id]?.verdict).length;
  const toReplace = items.filter((it) => s.cards[it.id]?.verdict === "replace");

  async function send() {
    setStatus("sending");
    const body = new URLSearchParams({
      [entries.name]: s.name,
      [entries.qualification]: s.qualification,
      [entries.consent]: s.consent ? "yes" : "no",
      [entries.review]: summaryText(s, items, t),
    });
    try {
      // Google Forms doesn't allow reading the reply cross-origin; a network error is the only failure we can see.
      await fetch(action, { method: "POST", mode: "no-cors", body });
      updateReview((x) => ({ ...x, sentAt: new Date().toISOString() }));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(summaryText(s, items, t));
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  const input = "mt-1 w-full rounded-xl border border-layl/30 bg-white px-3 py-2 text-layl focus:border-layl";
  return (
    <section aria-labelledby="send-review" className="mt-10 rounded-2xl bg-layl p-5 text-sama print:hidden">
      <h2 id="send-review" className="font-heading text-2xl text-lazima">
        {t("sendTitle")}
      </h2>
      <p className="mt-2" aria-live="polite">
        {t("progress", { done: formatNumber(done, lang), total: formatNumber(items.length, lang) })}
      </p>
      {toReplace.length > 0 && <p className="mt-1 text-sm text-sama/80">{t("toReplace", { list: toReplace.map((x) => x.label).join(lang === "ar" ? "، " : ", ") })}</p>}

      <div className="mt-4 space-y-3 text-layl">
        <label className="block text-sm text-sama">
          {t("name")}
          <input className={input} value={s.name} onChange={(e) => updateReview((x) => ({ ...x, name: e.target.value }))} />
        </label>
        <label className="block text-sm text-sama">
          {t("qualification")}
          <input className={input} value={s.qualification} onChange={(e) => updateReview((x) => ({ ...x, qualification: e.target.value }))} />
        </label>
        <label className="flex items-start gap-2 text-sm text-sama">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={s.consent} onChange={(e) => updateReview((x) => ({ ...x, consent: e.target.checked }))} />
          {t("consent")}
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => void send()} disabled={status === "sending" || done === 0} className="min-h-12 rounded-full bg-lazima px-6 py-2 font-medium text-layl disabled:opacity-50">
          {status === "sending" ? t("sending") : t("send")}
        </button>
        <button type="button" onClick={() => void copy()} disabled={done === 0} className="min-h-12 rounded-full border-2 border-sama/60 px-6 py-2 text-sama disabled:opacity-50">
          {t("copy")}
        </button>
      </div>
      <p role="status" className="mt-3 text-sm">
        {status === "sent" && t("sent")}
        {status === "copied" && t("copied")}
        {status === "error" && t("sendError")}
        {status === "idle" && s.sentAt && t("sentBefore", { date: new Date(s.sentAt).toLocaleString(lang === "ar" ? "ar-EG" : "en") })}
      </p>
      <p className="mt-2 text-xs text-sama/70">{t("savedHint")}</p>
    </section>
  );
}
