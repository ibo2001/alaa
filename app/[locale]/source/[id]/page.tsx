import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VersePassage } from "@/components/VersePassage";
import { Link } from "@/i18n/navigation";
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
    <div className="border-t border-layl/10 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="font-medium text-layl/70">{label}</dt>
      <dd className="mt-1 sm:col-span-2 sm:mt-0">{children}</dd>
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
    <article className="py-6">
      <h1 className="font-heading text-3xl">{t("title", { name: blessing.labels[locale] })}</h1>

      {card.ok && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <VersePassage ayat={card.ayat} translation={card.translation} lang={locale} />
        </div>
      )}

      <dl className="mt-6">
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
              <p>{tc("translationBy", { translator: card.translation.meta.translator })}</p>
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

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href={`/blessing/${blessing.id}`} className="rounded-full bg-layl px-5 py-2 text-lazima">
          ← {blessing.labels[locale]}
        </Link>
        <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 border-tamr px-5 py-2 text-tamr">
          {t("reportError")} ↗
        </a>
      </div>
    </article>
  );
}
