"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getJourney, resetJourney } from "@/lib/device";
import { formatNumber } from "@/lib/quran/surahs";
import type { Lang } from "@/lib/types";
import { completedCount, nextStation, STATION_NUMBERS, type JourneyProgress, type StationNumber } from "@/lib/journey";

export type StationView = { n: StationNumber; blessings: { id: string; label: string; ref: string }[] };

const primary =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-layl px-5 py-2 text-sm text-lazima hover:bg-layl/90";
const secondary =
  "inline-flex min-h-11 items-center justify-center rounded-full border-2 border-layl px-5 py-2 text-sm text-layl hover:bg-layl/5";

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

  return (
    <section className="py-8" data-ready>
      <h1 className="text-center font-heading text-4xl text-tamr">{t("title")}</h1>
      <p className="mt-3 text-center text-layl/80">{t("intro")}</p>

      <div className="mt-6">
        <p className="text-center text-sm font-medium" id="journey-progress">
          {t("progress", { n: formatNumber(done, lang), total: formatNumber(STATION_NUMBERS.length, lang) })}
        </p>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-layl/10"
          role="progressbar"
          aria-labelledby="journey-progress"
          aria-valuemin={0}
          aria-valuemax={STATION_NUMBERS.length}
          aria-valuenow={done}
        >
          <div className="h-full bg-nakhl transition-all" style={{ width: `${(done / STATION_NUMBERS.length) * 100}%` }} />
        </div>
      </div>

      <ol className="mt-8 space-y-4">
        {stations.map((s) => {
          const p = progress[s.n];
          const isNext = s.n === next;
          return (
            <li
              key={s.n}
              data-station={s.n}
              data-done={p ? "true" : "false"}
              className={`rounded-3xl border-2 p-5 ${p ? "border-nakhl/40 bg-nakhl/5" : isNext ? "border-layl bg-white/60" : "border-layl/15"}`}
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-heading text-xl ${
                    p ? "bg-nakhl text-sama" : isNext ? "bg-layl text-lazima" : "bg-layl/10 text-layl"
                  }`}
                >
                  {p ? "✓" : t(`stations.s${s.n}.number`)}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-heading text-2xl">
                    <span className="sr-only">{t("stationLabel", { n: formatNumber(s.n, lang) })}: </span>
                    {t(`stations.s${s.n}.title`)}
                  </h2>
                  <p className="mt-1 text-sm text-layl/70">
                    {p ? t(p.via === "photo" ? "foundByPhoto" : "cardRead") : isNext ? t("next") : t("upcoming")}
                  </p>
                  <p className="mt-3">{t(`stations.s${s.n}.mission`)}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!p && (
                      <Link href="/lens" className={primary}>
                        {t("takePhoto")}
                      </Link>
                    )}
                    {s.blessings.map((b) => (
                      <Link key={b.id} href={`/blessing/${b.id}`} className={secondary} aria-label={t("readCardLabel", { name: b.label, ref: b.ref })}>
                        {t("readCard", { name: b.label })}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {next === null ? (
        <section aria-labelledby="after-journey" className="mt-10 rounded-3xl bg-layl p-6 text-sama">
          <h2 id="after-journey" className="font-heading text-3xl text-lazima">
            {t("after.title")}
          </h2>
          <p className="mt-2 text-sama/80">{t("after.intro")}</p>
          <ol className="mt-6 space-y-5">
            <li>
              <h3 className="font-medium">{t("after.readTitle")}</h3>
              <a href="https://quran.com/55" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-lazima underline">
                {t("after.readLink")}
              </a>
            </li>
            <li>
              <h3 className="font-medium">{t("after.habitTitle")}</h3>
              <Link href="/today" className="mt-1 inline-block text-lazima underline">
                {t("after.habitLink")}
              </Link>
            </li>
            {referral && (
              <li>
                <h3 className="font-medium">{t("after.askTitle")}</h3>
                <a href={referral.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-lazima underline">
                  {t("after.askLink", { name: referral.name })}
                </a>
              </li>
            )}
          </ol>
        </section>
      ) : (
        <p className="mt-10 text-center text-sm text-layl/70">{t("afterLocked")}</p>
      )}

      {done > 0 && (
        <p className="mt-8 text-center">
          <button type="button" onClick={() => void onReset()} className="min-h-11 text-sm text-layl/70 underline hover:text-layl">
            {t("reset")}
          </button>
        </p>
      )}
      <p className="mt-6 text-center text-xs text-layl/60">{t("privacy")}</p>
    </section>
  );
}
