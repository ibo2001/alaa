"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getJourney, resetJourney } from "@/lib/device";
import { formatNumber } from "@/lib/quran/surahs";
import type { Lang } from "@/lib/types";
import { completedCount, nextStation, STATION_NUMBERS, type JourneyProgress, type StationNumber } from "@/lib/journey";
import { BookIcon, CheckIcon, ChevronIcon, DayIcon, ExternalIcon, LensIcon } from "./icons";
import { button, Card, PageHeader } from "./ui";

export type StationView = { n: StationNumber; blessings: { id: string; label: string; ref: string }[] };

// A row in the after-journey list: icon, label, trailing chevron or external mark.
const afterRow = "press flex min-h-14 items-center gap-3 px-4 text-sama";

export function JourneyClient({ stations, referral }: { stations: StationView[]; referral: { name: string; url: string } | null }) {
  const t = useTranslations("journey");
  const lang = useLocale() as Lang;
  const [progress, setProgress] = useState<JourneyProgress | null>(null);

  useEffect(() => {
    getJourney()
      .then(setProgress)
      .catch(() => setProgress({}));
  }, []);

  if (progress === null) {
    return <p className="py-10 text-center text-layl/70" aria-busy="true">{t("loading")}</p>;
  }

  const done = completedCount(progress);
  const next = nextStation(progress);

  async function onReset() {
    try {
      await resetJourney();
    } finally {
      setProgress({});
    }
  }

  const pct = (done / STATION_NUMBERS.length) * 100;

  return (
    <section className="pb-4" data-ready>
      <PageHeader title={t("title")} subtitle={t("intro")} />

      <Card className="mt-3">
        <p className="text-sm font-medium" id="journey-progress">
          {t("progress", { n: formatNumber(done, lang), total: formatNumber(STATION_NUMBERS.length, lang) })}
        </p>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-layl/10"
          role="progressbar"
          aria-labelledby="journey-progress"
          aria-valuemin={0}
          aria-valuemax={STATION_NUMBERS.length}
          aria-valuenow={done}
        >
          <div className="h-full rounded-full bg-nakhl transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      {/* Timeline: a line joins the station markers, filled up to the stations already reached. */}
      <ol className="mt-6">
        {stations.map((s, i) => {
          const p = progress[s.n];
          const isNext = s.n === next;
          const last = i === stations.length - 1;
          return (
            <li key={s.n} data-station={s.n} data-done={p ? "true" : "false"} className="relative flex gap-4 pb-4">
              {!last && (
                <span aria-hidden className={`absolute start-[1.3rem] top-12 -bottom-0 w-0.5 ${p ? "bg-nakhl/50" : "bg-layl/12"}`} />
              )}
              <span
                aria-hidden
                className={`relative z-10 mt-1 grid size-11 shrink-0 place-items-center rounded-full font-heading text-xl shadow-sm ${
                  p ? "bg-nakhl text-sama" : isNext ? "bg-layl text-lazima ring-4 ring-lazima/40" : "bg-surface text-layl/60 ring-1 ring-layl/10"
                }`}
              >
                {p ? <CheckIcon className="size-5" /> : t(`stations.s${s.n}.number`)}
              </span>
              <div
                className={`min-w-0 flex-1 rounded-2xl p-4 ${
                  isNext ? "bg-surface shadow-md ring-2 ring-layl/80" : p ? "bg-surface/70" : "bg-surface/50"
                }`}
              >
                <p className={`text-xs font-medium ${p ? "text-nakhl" : isNext ? "text-tamr" : "text-layl/55"}`}>
                  {p ? t(p.via === "photo" ? "foundByPhoto" : "cardRead") : isNext ? t("next") : t("upcoming")}
                </p>
                <h2 className="mt-0.5 font-heading text-2xl">
                  <span className="sr-only">{t("stationLabel", { n: formatNumber(s.n, lang) })}: </span>
                  {t(`stations.s${s.n}.title`)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-layl/80">{t(`stations.s${s.n}.mission`)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!p && (
                    <Link href="/lens" className={isNext ? button.chipDark : button.chip}>
                      <LensIcon className="size-4" />
                      {t("takePhoto")}
                    </Link>
                  )}
                  {s.blessings.map((b) => (
                    <Link key={b.id} href={`/blessing/${b.id}`} className={button.chip} aria-label={t("readCardLabel", { name: b.label, ref: b.ref })}>
                      {t("readCard", { name: b.label })}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {next === null ? (
        <section aria-labelledby="after-journey" className="hero-glow mt-6 overflow-hidden rounded-[2rem] text-sama shadow-xl shadow-layl/20">
          <div className="px-6 pb-4 pt-7">
            <h2 id="after-journey" className="font-heading text-3xl text-lazima">
              {t("after.title")}
            </h2>
            <p className="mt-2 text-sama/80">{t("after.intro")}</p>
          </div>
          <ol className="divide-y divide-sama/10 border-t border-sama/10">
            <li>
              <h3 className="px-4 pt-3 text-xs text-sama/60">{t("after.readTitle")}</h3>
              <a href="https://quran.com/55" target="_blank" rel="noopener noreferrer" className={afterRow}>
                <BookIcon className="size-5 text-lazima" />
                <span className="flex-1">{t("after.readLink")}</span>
                <ExternalIcon className="size-4 text-sama/50" />
              </a>
            </li>
            <li>
              <h3 className="px-4 pt-3 text-xs text-sama/60">{t("after.habitTitle")}</h3>
              <Link href="/today" className={afterRow}>
                <DayIcon className="size-5 text-lazima" />
                <span className="flex-1">{t("after.habitLink")}</span>
                <ChevronIcon className="size-4 text-sama/50 rtl:-scale-x-100" />
              </Link>
            </li>
            {referral && (
              <li>
                <h3 className="px-4 pt-3 text-xs text-sama/60">{t("after.askTitle")}</h3>
                <a href={referral.url} target="_blank" rel="noopener noreferrer" className={afterRow}>
                  <span aria-hidden className="grid size-5 place-items-center text-lazima">?</span>
                  <span className="flex-1">{t("after.askLink", { name: referral.name })}</span>
                  <ExternalIcon className="size-4 text-sama/50" />
                </a>
              </li>
            )}
          </ol>
        </section>
      ) : (
        <p className="mt-4 px-2 text-center text-sm text-layl/70">{t("afterLocked")}</p>
      )}

      {done > 0 && (
        <p className="mt-6 text-center">
          <button type="button" onClick={() => void onReset()} className={`${button.plain} text-tamr`}>
            {t("reset")}
          </button>
        </p>
      )}
      <p className="mt-4 px-2 text-center text-xs text-layl/60">{t("privacy")}</p>
    </section>
  );
}
