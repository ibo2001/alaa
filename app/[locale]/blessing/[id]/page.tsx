import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlockedCard } from "@/components/BlockedCard";
import { CardActions } from "@/components/CardActions";
import { JourneyMark } from "@/components/JourneyMark";
import { LensIcon } from "@/components/icons";
import { StageNote } from "@/components/StageNote";
import { VersePassage } from "@/components/VersePassage";
import { ayatByRef } from "@/lib/guard";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { formatNumber, formatRef, quranComUrl } from "@/lib/quran/surahs";
import { blessings, getBlessing } from "@/lib/sources/data";
import { blessingCard, isRefrainOnly, refrainPassage, refrainRepeatCount } from "@/lib/sources/passages";
import type { Lang } from "@/lib/types";

// Cards are generated at build time from the Tanzil file; unknown ids are 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => blessings.map((b) => ({ locale, id: b.id })));
}

type Props = { params: Promise<{ locale: Lang; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const b = getBlessing(id);
  return b ? { title: b.labels[locale] } : {};
}

export default async function BlessingPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("card");
  const ts = await getTranslations("stage");
  const refrainIntro = ts("refrainIntro", { count: formatNumber(refrainRepeatCount(), locale) });

  // Reflections depend on the learning stage; all reflections are hidden until reviewed (level 4).
  const card = blessingCard(id, locale, "new");
  if (!card) notFound();
  if (!card.ok) return <BlockedCard />;

  // Interim cards whose only verse is the refrain show it once, in gold.
  const refrainOnly = isRefrainOnly(card.refs);
  const refrain = refrainPassage(locale);
  const { blessing } = card;
  const first = card.refs[0]!;

  return (
    <article className="mt-4 overflow-hidden rounded-[2rem] bg-layl text-sama shadow-xl shadow-layl/20">
      {blessing.journeyStation && <JourneyMark station={blessing.journeyStation} />}
      <header className="hero-glow px-6 pb-2 pt-8 text-center">
        <h1 className="font-heading text-5xl leading-tight text-lazima">{blessing.labels[locale]}</h1>
        {card.mappingUnderReview && (
          <details className="mt-3 inline-block text-sm">
            <summary className="press inline-flex min-h-9 cursor-pointer list-none items-center rounded-full bg-lazima/15 px-3 text-lazima">
              ⓘ {t("underReview")}
            </summary>
            <p className="mt-2 max-w-sm text-sama/80">{t("underReviewHint")}</p>
          </details>
        )}
      </header>

      <section className="px-6 py-6">
        {ayatByRef(card.refs, card.ayat).map(({ ref, ayat }, i) => (
          <div key={formatRef(ref, locale)} className={i > 0 ? "mt-6 border-t border-sama/10 pt-6" : undefined}>
            <VersePassage ayat={ayat} translation={card.translation} lang={locale} tone={refrainOnly ? "gold" : "dark"} size={refrainOnly ? "xl" : "lg"} />
            <p className="mt-4 text-center text-sm text-sama/70">{formatRef(ref, locale)}</p>
          </div>
        ))}
        {refrainOnly && <StageNote text={refrainIntro} />}
        {card.reflection && <p className="mt-6 border-s-4 border-lazima ps-4">{card.reflection}</p>}
      </section>

      {refrain.ok && !refrainOnly && (
        <section className="border-t border-sama/15 px-6 py-6">
          <VersePassage ayat={refrain.ayat} translation={refrain.translation} lang={locale} tone="gold" size="xl" />
          <p className="mt-2 text-center text-xs text-sama/60">{formatRef(refrain.refs[0]!, locale)}</p>
          <StageNote text={refrainIntro} />
        </section>
      )}

      <footer className="border-t border-sama/15 px-6 py-6">
        <CardActions
          blessingId={blessing.id}
          title={blessing.labels[locale]}
          quranUrl={quranComUrl(first)}
          readLabel={t("readInContextLabel", { ref: formatRef(first, locale) })}
        />
        <Link href="/lens" className="press mt-6 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sama/10 text-sm font-medium text-sama">
          <LensIcon className="size-5" />
          {t("lookAgain")}
        </Link>
      </footer>
    </article>
  );
}
