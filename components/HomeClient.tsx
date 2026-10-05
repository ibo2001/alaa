"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getJourney, getStage } from "@/lib/device";
import { pickHome, type HomeSlots } from "@/lib/home";
import { completedCount, nextStation, STATION_NUMBERS, type JourneyProgress } from "@/lib/journey";
import { getDay } from "@/lib/myday";
import { formatNumber } from "@/lib/quran/surahs";
import type { HomeVerse } from "@/lib/sources/home";
import type { GuardedAyah, TranslationStatus } from "@/lib/guard";
import type { Lang } from "@/lib/types";
import { ChevronIcon, DayIcon, JourneyIcon, RefreshIcon } from "./icons";
import { StagePicker } from "./StagePicker";
import { VersePassage } from "./VersePassage";

type Refrain = { ayat: GuardedAyah[]; translation: TranslationStatus; ref: string };
type Status = { dayCount: number; journey: JourneyProgress; stageSet: boolean };

/**
 * Home: today's date, a blessing verse (chosen on the device by time of day, from Guard-verified verses
 * the server sends), the user's day at a glance, and the learning-stage question until it is answered.
 */
export function HomeClient({
  lang,
  appName,
  verses,
  slots,
  refrain,
}: {
  lang: Lang;
  appName: string;
  verses: HomeVerse[];
  slots: HomeSlots;
  refrain: Refrain | null;
}) {
  const t = useTranslations("home");
  const tw = useTranslations("welcome");
  const td = useTranslations("today");
  const tj = useTranslations("journey");
  const [index, setIndex] = useState<number | null>(null);
  const [dates, setDates] = useState<{ greg: string; hijri: string } | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  // Everything here depends on the device (clock, randomness, IndexedDB), so it runs after hydration.
  useEffect(() => {
    const now = new Date();
    if (verses.length > 0) setIndex(pickHome(verses, slots, now.getHours(), Math.random));
    const greg = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en", { weekday: "long", day: "numeric", month: "long" }).format(now);
    const hijri = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
    setDates({ greg, hijri });
    Promise.all([getDay().catch(() => []), getJourney().catch(() => ({})), getStage().catch(() => null)]).then(([day, journey, stage]) =>
      setStatus({ dayCount: day.length, journey, stageSet: stage !== null }),
    );
  }, [verses, slots, lang]);

  const verse = index === null ? null : verses[index]!;
  const another = () => setIndex((i) => pickHome(verses, slots, new Date().getHours(), Math.random, i ?? undefined));

  const done = status ? completedCount(status.journey) : 0;
  const next = status ? nextStation(status.journey) : null;

  return (
    <div className="flex flex-col gap-5 pt-5" data-ready={status ? true : undefined}>
      <header>
        <h1 className="font-heading text-5xl leading-tight text-layl">{appName}</h1>
        <p className="mt-1 min-h-6 text-layl/70">
          {dates && (
            <>
              {dates.greg}
              <span aria-hidden> · </span>
              <span className="sr-only">, {t("hijri")}: </span>
              {dates.hijri}
            </>
          )}
        </p>
      </header>

      <section aria-labelledby="home-verse" className="hero-glow overflow-hidden rounded-[2rem] text-sama shadow-xl shadow-layl/20">
        <div className="px-6 pb-5 pt-6">
          <h2 id="home-verse" className="text-sm font-medium text-lazima/90">
            {t("verseTitle")}
          </h2>
          <div aria-live="polite" className="mt-3 flex min-h-36 flex-col justify-center">
            {verse && (
              <div key={verse.key} className="page-fade" data-verse={verse.key}>
                <VersePassage ayat={verse.ayat} translation={verse.translation} lang={lang} tone="dark" />
                <p className="mt-3 text-center text-sm text-sama/60">{verse.ref}</p>
              </div>
            )}
          </div>
        </div>

        {refrain && (
          <div className="border-t border-sama/10 px-6 py-4">
            <VersePassage ayat={refrain.ayat} translation={refrain.translation} lang={lang} tone="gold" />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-sama/10 px-3 py-2">
          <button
            type="button"
            onClick={another}
            disabled={verses.length < 2}
            className="press inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-lazima disabled:opacity-40"
          >
            <RefreshIcon className="size-5" />
            {t("another")}
          </button>
          {verse?.blessingId && verse.label && (
            <Link href={`/blessing/${verse.blessingId}`} className="press inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm text-sama/80">
              {t("openCard", { name: verse.label })}
              <ChevronIcon className="size-4 rtl:-scale-x-100" />
            </Link>
          )}
        </div>
      </section>

      <section aria-label={t("yourDay")} className="grid grid-cols-2 gap-3">
        <Link href="/today" className="press flex min-h-24 flex-col justify-between rounded-2xl bg-surface p-4 shadow-sm">
          <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-tamr text-sama">
            <DayIcon className="size-5" />
          </span>
          <span className="mt-3 text-sm font-medium">
            {status ? td("count", { count: status.dayCount, shown: formatNumber(status.dayCount, lang) }) : t("loading")}
          </span>
        </Link>
        <Link href="/journey" className="press flex min-h-24 flex-col justify-between rounded-2xl bg-surface p-4 shadow-sm">
          <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-nakhl text-sama">
            <JourneyIcon className="size-5" />
          </span>
          <span className="mt-3 text-sm">
            <span className="block font-medium">
              {status
                ? next === null
                  ? t("journeyDone")
                  : t("journey", { n: formatNumber(done, lang), total: formatNumber(STATION_NUMBERS.length, lang) })
                : t("loading")}
            </span>
            {status && next !== null && (
              <span className="block text-layl/60">{t("journeyNext", { name: tj(`stations.s${next}.title`) })}</span>
            )}
          </span>
        </Link>
      </section>

      {/* First visit: what Alaa is, and the optional learning stage. Later it lives in About. */}
      {status && !status.stageSet && (
        <>
          <p className="px-1 leading-relaxed text-layl/80">{tw("intro")}</p>
          <StagePicker />
        </>
      )}
    </div>
  );
}
