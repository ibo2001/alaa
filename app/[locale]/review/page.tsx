import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VersePassage } from "@/components/VersePassage";
import { REVIEW_LOG_URL } from "@/lib/links";
import { formatNumber, formatRef, quranComUrl } from "@/lib/quran/surahs";
import { blessings, data, getConcept } from "@/lib/sources/data";
import { blessingCard, guardedRefs } from "@/lib/sources/passages";
import type { Lang, ReviewStatus } from "@/lib/types";

type Props = { params: Promise<{ locale: Lang }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "review" });
  return { title: t("title"), robots: { index: false } };
}

const box = "inline-block h-5 w-5 shrink-0 rounded border-2 border-layl/60 align-middle";

function Checklist({ t }: { t: (k: string) => string }) {
  return (
    <div className="mt-4 space-y-2 border-t border-layl/10 pt-3 text-sm">
      <p className="flex items-center gap-2">
        <span className={box} aria-hidden /> {t("checkFits")}
      </p>
      <p className="flex items-center gap-2">
        <span className={box} aria-hidden /> {t("checkOther")}
      </p>
      <p className="text-layl/70">{t("notes")}</p>
      <div className="h-16 rounded border border-dashed border-layl/30" />
    </div>
  );
}

/**
 * Reviewer view: every card on one printable page, rendered through the Source Guard, so the reviewer sees
 * exactly what users see. Not linked from the main navigation and not indexed.
 */
export default async function ReviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("review");
  const tr = (k: string) => t(k);
  const status = (s: ReviewStatus) => (s === "reviewed" ? t("reviewed") : t("draft"));
  const reviewed = blessings.filter((b) => b.review.mapping === "reviewed").length;
  const fixed = [
    { id: "abstention", title: t("abstentionTitle"), hint: t("abstentionHint"), refs: data.abstention.verses },
    { id: "refrain", title: t("refrainTitle"), hint: t("refrainHint"), refs: data.refrain.verses },
  ];

  return (
    <article className="py-8 print:py-0">
      <h1 className="font-heading text-4xl">{t("title")}</h1>
      <p className="mt-3">{t("intro")}</p>
      <ul className="mt-4 list-disc space-y-1 ps-6 text-sm">
        <li>{t("rule1")}</li>
        <li>{t("rule2")}</li>
        <li>{t("rule3")}</li>
        <li>{t("rule4")}</li>
      </ul>
      <p className="mt-4 text-sm">
        {t("howToReturn")}{" "}
        <a href={REVIEW_LOG_URL} target="_blank" rel="noopener noreferrer" className="text-nakhl underline">
          {t("reviewLog")}
        </a>
      </p>
      <p className="mt-4 font-medium">
        {t("summary", { reviewed: formatNumber(reviewed, locale), total: formatNumber(blessings.length, locale) })}
      </p>

      <ol className="mt-8 space-y-6">
        {blessings.map((b, i) => {
          const card = blessingCard(b.id, locale, "new");
          const concepts = [b.concept, ...(b.relatedConcepts ?? [])].map((c) => getConcept(c)?.labels[locale] ?? c);
          return (
            <li key={b.id} id={b.id} className="break-inside-avoid rounded-2xl bg-white p-5 shadow-sm print:shadow-none print:ring-1 print:ring-layl/20">
              <h2 className="font-heading text-2xl">
                {formatNumber(i + 1, locale)}. {b.labels[locale]}
              </h2>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-layl/70">{t("opensFrom")}</dt>
                <dd>{concepts.join(locale === "ar" ? "، " : ", ")}</dd>
                <dt className="text-layl/70">{t("refs")}</dt>
                <dd>
                  {b.verses.map((v, j) => (
                    <span key={j}>
                      {j > 0 && " · "}
                      <a href={quranComUrl(v)} target="_blank" rel="noopener noreferrer" className="text-nakhl underline">
                        {formatRef(v, locale)}
                      </a>
                    </span>
                  ))}
                </dd>
                {b.journeyStation && (
                  <>
                    <dt className="text-layl/70">{t("station")}</dt>
                    <dd>{formatNumber(b.journeyStation, locale)}</dd>
                  </>
                )}
                <dt className="text-layl/70">{t("status")}</dt>
                <dd>
                  {t("mapping")}: {status(b.review.mapping)} · {t("reflection")}: {status(b.review.reflection)}
                </dd>
                {b.note && (
                  <>
                    <dt className="text-layl/70">{t("note")}</dt>
                    <dd lang="en" dir="ltr" className="text-start">
                      {b.note}
                    </dd>
                  </>
                )}
              </dl>
              <div className="mt-4">
                {card?.ok ? (
                  <VersePassage ayat={card.ayat} translation={card.translation} lang={locale} />
                ) : (
                  <p className="text-tamr">{t("blocked")}</p>
                )}
              </div>
              <Checklist t={tr} />
            </li>
          );
        })}

        {fixed.map((f) => {
          const passage = guardedRefs(f.refs, locale);
          return (
            <li key={f.id} id={f.id} className="break-inside-avoid rounded-2xl bg-white p-5 shadow-sm print:shadow-none print:ring-1 print:ring-layl/20">
              <h2 className="font-heading text-2xl">{f.title}</h2>
              <p className="mt-1 text-sm text-layl/70">{f.hint}</p>
              <div className="mt-4 space-y-4">
                {passage.map((p, j) => (
                  <div key={j}>
                    {p.ok ? <VersePassage ayat={p.ayat} translation={p.translation} lang={locale} /> : <p className="text-tamr">{t("blocked")}</p>}
                    <p className="mt-1 text-center text-sm text-layl/70">{formatRef(f.refs[j]!, locale)}</p>
                  </div>
                ))}
              </div>
              <Checklist t={tr} />
            </li>
          );
        })}
      </ol>
    </article>
  );
}
