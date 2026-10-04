"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { GuardedAyah, TranslationStatus } from "@/lib/guard";
import { getDay, removeFromDay, type DayEntry } from "@/lib/myday";
import { formatNumber } from "@/lib/quran/surahs";
import { drawShareCard } from "@/lib/sharecard";
import type { Lang } from "@/lib/types";
import { VersePassage } from "./VersePassage";

export type DayBlessing = { id: string; label: string; ref: string; ayat: GuardedAyah[]; translation: TranslationStatus };
type Refrain = { ayat: GuardedAyah[]; translation: TranslationStatus; ref: string };
type CardState = { kind: "idle" } | { kind: "drawing" } | { kind: "ready"; url: string; file: File } | { kind: "error" };

const ARABIC_ONLY: TranslationStatus = { status: "not-needed" };
const primary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-layl px-6 py-3 text-lazima hover:bg-layl/90 disabled:opacity-50";
const secondary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-layl px-6 py-3 text-layl hover:bg-layl/5";

export function TodayClient({ lang, cards, refrain }: { lang: Lang; cards: DayBlessing[]; refrain: Refrain | null }) {
  const t = useTranslations("today");
  const app = useTranslations("app");
  const [entries, setEntries] = useState<DayEntry[] | null>(null);
  const [card, setCard] = useState<CardState>({ kind: "idle" });

  useEffect(() => {
    getDay()
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  // A new list means a new card.
  useEffect(() => {
    setCard((c) => {
      if (c.kind === "ready") URL.revokeObjectURL(c.url);
      return { kind: "idle" };
    });
  }, [entries]);

  const byId = new Map(cards.map((c) => [c.id, c]));
  const today = (entries ?? []).map((e) => byId.get(e.blessingId)).filter((c): c is DayBlessing => !!c);
  const date = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en", { dateStyle: "full" }).format(new Date());

  async function onRemove(id: string) {
    try {
      setEntries(await removeFromDay(id));
    } catch {
      // IndexedDB unavailable: nothing to remove.
    }
  }

  async function onMakeCard() {
    if (!refrain) return;
    setCard({ kind: "drawing" });
    try {
      const blob = await drawShareCard({
        lang,
        appName: app("name"),
        title: t("title"),
        date,
        items: today.map((c) => ({ label: c.label, ref: c.ref })),
        more: (n) => t("more", { shown: formatNumber(n, lang) }),
        refrain: { text: refrain.ayat.map((a) => a.text).join(" "), ref: refrain.ref },
        footer: t("cardFooter"),
      });
      const file = new File([blob], "alaa-my-day.png", { type: "image/png" });
      setCard({ kind: "ready", url: URL.createObjectURL(blob), file });
    } catch {
      setCard({ kind: "error" });
    }
  }

  async function onShareCard(file: File) {
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: t("title") });
      } catch {
        // user cancelled
      }
    }
  }

  if (entries === null) {
    return <p className="py-10 text-center text-layl/70" aria-busy="true">{t("loading")}</p>;
  }

  return (
    <section className="py-8" data-ready>
      <h1 className="text-center font-heading text-4xl text-tamr">{t("title")}</h1>
      <p className="mt-1 text-center text-sm text-layl/70">{date}</p>
      <p className="mt-4 text-center text-lg font-medium" aria-live="polite">
        {t("count", { count: today.length, shown: formatNumber(today.length, lang) })}
      </p>

      {today.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-layl/5 p-6 text-center">
          <p>{t("empty")}</p>
          <Link href="/lens" className={`${primary} mt-6`}>
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <>
          <ol className="mt-6 space-y-4">
            {today.map((c) => (
              <li key={c.id} className="rounded-3xl bg-layl px-5 py-5 text-sama">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-heading text-2xl text-lazima">
                    <Link href={`/blessing/${c.id}`} className="hover:underline">
                      {c.label}
                    </Link>
                  </h2>
                  <button
                    type="button"
                    onClick={() => void onRemove(c.id)}
                    className="min-h-11 rounded-full px-3 text-xs text-sama/70 underline hover:text-lazima"
                    aria-label={t("remove", { name: c.label })}
                  >
                    {t("removeShort")}
                  </button>
                </div>
                <div className="mt-3">
                  <VersePassage ayat={c.ayat} translation={c.translation} lang={lang} tone="dark" />
                  <p className="mt-2 text-center text-xs text-sama/60">{c.ref}</p>
                </div>
                {refrain && (
                  <div className="mt-4 border-t border-sama/15 pt-4">
                    <VersePassage ayat={refrain.ayat} translation={ARABIC_ONLY} lang={lang} tone="gold" />
                  </div>
                )}
              </li>
            ))}
          </ol>

          {refrain && lang !== "ar" && (
            <figure className="mt-6 rounded-3xl bg-layl px-5 py-5">
              <VersePassage ayat={refrain.ayat} translation={refrain.translation} lang={lang} tone="gold" />
              <figcaption className="mt-2 text-center text-xs text-sama/60">{refrain.ref}</figcaption>
            </figure>
          )}

          <div className="mt-8 flex flex-col items-center gap-4">
            {card.kind !== "ready" && (
              <button type="button" className={primary} onClick={() => void onMakeCard()} disabled={card.kind === "drawing" || !refrain}>
                {card.kind === "drawing" ? t("drawing") : t("makeCard")}
              </button>
            )}
            {card.kind === "error" && <p role="alert" className="text-sm text-tamr">{t("cardError")}</p>}
            {card.kind === "ready" && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL, not an optimizable asset */}
                <img src={card.url} alt={t("previewAlt", { date })} width={270} height={480} className="rounded-2xl shadow-lg" />
                <div className="flex flex-wrap justify-center gap-3">
                  {typeof navigator !== "undefined" && navigator.canShare?.({ files: [card.file] }) && (
                    <button type="button" className={primary} onClick={() => void onShareCard(card.file)}>
                      {t("shareCard")}
                    </button>
                  )}
                  <a href={card.url} download="alaa-my-day.png" className={secondary}>
                    {t("download")}
                  </a>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <p className="mt-10 text-center text-xs text-layl/60">{t("privacy")}</p>
    </section>
  );
}
