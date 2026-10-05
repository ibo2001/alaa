"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { GuardedAyah, TranslationStatus } from "@/lib/guard";
import { getDay, removeFromDay, type DayEntry } from "@/lib/myday";
import { formatNumber } from "@/lib/quran/surahs";
import { drawShareCard } from "@/lib/sharecard";
import type { Lang } from "@/lib/types";
import { CloseIcon, DayIcon, DownloadIcon, LensIcon, ShareIcon } from "./icons";
import { button, Card, PageHeader } from "./ui";
import { VersePassage } from "./VersePassage";

export type DayBlessing = { id: string; label: string; ref: string; ayat: GuardedAyah[]; translation: TranslationStatus };
type Refrain = { ayat: GuardedAyah[]; translation: TranslationStatus; ref: string };
type CardState = { kind: "idle" } | { kind: "drawing" } | { kind: "ready"; url: string; file: File } | { kind: "error" };

const ARABIC_ONLY: TranslationStatus = { status: "not-needed" };

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
    <section className="pb-4" data-ready>
      <PageHeader title={t("title")} subtitle={date}>
        <p
          className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-full bg-tamr/10 px-3 text-sm font-medium text-tamr"
          aria-live="polite"
        >
          <DayIcon className="size-4" />
          {t("count", { count: today.length, shown: formatNumber(today.length, lang) })}
        </p>
      </PageHeader>

      {today.length === 0 ? (
        <Card className="mt-4 flex flex-col items-center px-6 py-10 text-center">
          <span aria-hidden className="grid size-16 place-items-center rounded-full bg-lazima/25 text-tamr">
            <DayIcon className="size-8" />
          </span>
          <p className="mt-5 max-w-xs leading-relaxed text-layl/80">{t("empty")}</p>
          <Link href="/lens" className={`${button.primary} mt-6`}>
            <LensIcon className="size-5" />
            {t("emptyCta")}
          </Link>
        </Card>
      ) : (
        <>
          <ol className="mt-4 space-y-4">
            {today.map((c) => (
              <li key={c.id} className="overflow-hidden rounded-[1.75rem] bg-layl px-5 pb-5 pt-4 text-sama shadow-lg shadow-layl/15">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-heading text-3xl text-lazima">
                    <Link href={`/blessing/${c.id}`} className="hover:underline">
                      {c.label}
                    </Link>
                  </h2>
                  <button
                    type="button"
                    onClick={() => void onRemove(c.id)}
                    className="press grid size-11 place-items-center rounded-full bg-sama/10 text-sama/80"
                    aria-label={t("remove", { name: c.label })}
                  >
                    <CloseIcon className="size-5" />
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
            <figure className="mt-4 rounded-[1.75rem] bg-layl px-5 py-5">
              <VersePassage ayat={refrain.ayat} translation={refrain.translation} lang={lang} tone="gold" />
              <figcaption className="mt-2 text-center text-xs text-sama/60">{refrain.ref}</figcaption>
            </figure>
          )}

          <Card className="mt-6 flex flex-col items-center gap-4">
            {card.kind !== "ready" && (
              <button type="button" className={`${button.gold} w-full`} onClick={() => void onMakeCard()} disabled={card.kind === "drawing" || !refrain}>
                {card.kind === "drawing" ? t("drawing") : t("makeCard")}
              </button>
            )}
            {card.kind === "error" && <p role="alert" className="text-sm text-tamr">{t("cardError")}</p>}
            {card.kind === "ready" && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL, not an optimizable asset */}
                <img src={card.url} alt={t("previewAlt", { date })} width={270} height={480} className="rounded-2xl shadow-xl" />
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                  {typeof navigator !== "undefined" && navigator.canShare?.({ files: [card.file] }) && (
                    <button type="button" className={button.primary} onClick={() => void onShareCard(card.file)}>
                      <ShareIcon className="size-5" />
                      {t("shareCard")}
                    </button>
                  )}
                  <a href={card.url} download="alaa-my-day.png" className={button.secondary}>
                    <DownloadIcon className="size-5" />
                    {t("download")}
                  </a>
                </div>
              </>
            )}
          </Card>
        </>
      )}

      <p className="mt-8 px-2 text-center text-xs text-layl/60">{t("privacy")}</p>
    </section>
  );
}
