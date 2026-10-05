import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalIcon } from "@/components/icons";
import { button, PageHeader } from "@/components/ui";
import { VersePassage } from "@/components/VersePassage";
import { routing } from "@/i18n/routing";
import { formatRef, quranComUrl } from "@/lib/quran/surahs";
import { blessings, getBlessing } from "@/lib/sources/data";
import { blessingCard } from "@/lib/sources/passages";
import type { Lang, ReviewStatus } from "@/lib/types";
import { issueUrl, REVIEW_LOG_URL } from "@/lib/links";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => blessings.map((b) => ({ locale, id: b.id })));
}

type Props = { params: Promise<{ locale: Lang; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "source" });
  const b = getBlessing(id);
  return b ? { title: t("title", { name: b.labels[locale] }) } : {};
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3.5">
      <dt className="text-xs font-semibold text-layl/55">{label}</dt>
      <dd className="mt-1 leading-relaxed">{children}</dd>
    </div>
  );
}

export default async function SourcePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("source");
  const tc = await getTranslations("card");

  const blessing = getBlessing(id);
  if (!blessing) notFound();
  const card = blessingCard(id, locale, "new")!;
  const status = (s: ReviewStatus) => (s === "reviewed" ? t("reviewed") : t("draft"));
  const refs = blessing.verses.map((r) => formatRef(r, locale)).join(" · ");
  const reportUrl = issueUrl(
    `Content report: ${blessing.id}`,
    `Card: ${blessing.id}\nVerses: ${blessing.verses.map((r) => `${r.surah}:${r.ayah}${r.ayahEnd ? `-${r.ayahEnd}` : ""}`).join(", ")}\n\nWhat looks wrong?\n`,
  );

  return (
    <article className="pb-4">
      <PageHeader title={t("title", { name: blessing.labels[locale] })} />

      {card.ok && (
        <div className="mt-3 rounded-2xl bg-surface p-5 shadow-sm">
          <VersePassage ayat={card.ayat} translation={card.translation} lang={locale} />
        </div>
      )}

      <dl className="mt-4 divide-y divide-layl/10 overflow-hidden rounded-2xl bg-surface shadow-sm">
        <Row label={t("verses")}>
          {refs}
          <ul className="mt-1">
            {blessing.verses.map((r) => (
              <li key={`${r.surah}:${r.ayah}`}>
                <a href={quranComUrl(r)} target="_blank" rel="noopener noreferrer" className="text-nakhl underline">
                  {t("readOnQuranCom")}: {formatRef(r, locale)} ↗
                </a>
              </li>
            ))}
          </ul>
        </Row>
        <Row label={t("textSource")}>
          <p>
            {t("textSourceBody")}{" "}
            <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer" className="text-nakhl underline">
              tanzil.net
            </a>
          </p>
          <p className={`mt-1 text-sm ${card.ok ? "text-nakhl" : "text-tamr"}`}>
            {card.ok ? `✓ ${t("verified")}` : `✗ ${t("notVerified")}`}
          </p>
        </Row>
        <Row label={t("translation")}>
          {!card.ok || card.translation.status === "pending" ? (
            t("translationPending")
          ) : card.translation.status === "not-needed" ? (
            t("translationNone")
          ) : (
            <>
              <p>{tc("translationBy", { translator: card.translation.meta.translator, publisher: card.translation.meta.publisher })}</p>
              <p className="text-sm">
                {t("license")}:{" "}
                <a href={card.translation.meta.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-nakhl underline">
                  {card.translation.meta.license}
                </a>
              </p>
            </>
          )}
        </Row>
        <Row label={t("review")}>
          <p>
            {t("mapping")}: <strong>{status(blessing.review.mapping)}</strong>
          </p>
          <p>
            {t("reflection")}: <strong>{status(blessing.review.reflection)}</strong>
          </p>
          {blessing.review.reviewer && (
            <p>
              {t("reviewer")}: {blessing.review.reviewer}
              {blessing.review.reviewedAt ? ` · ${blessing.review.reviewedAt}` : ""}
            </p>
          )}
          <p className="mt-1 text-sm">
            <a href={REVIEW_LOG_URL} target="_blank" rel="noopener noreferrer" className="text-nakhl underline">
              {t("reviewLog")} ↗
            </a>
          </p>
        </Row>
      </dl>

      <a href={reportUrl} target="_blank" rel="noopener noreferrer" className={`${button.secondary} mt-6 w-full text-tamr`}>
        {t("reportError")}
        <ExternalIcon className="size-4" />
      </a>
    </article>
  );
}
