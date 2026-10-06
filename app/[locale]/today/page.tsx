import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TodayClient, type DayBlessing } from "@/components/TodayClient";
import { formatRef } from "@/lib/quran/surahs";
import { blessings } from "@/lib/sources/data";
import { blessingCard, refrainPassage } from "@/lib/sources/passages";
import type { Lang } from "@/lib/types";

type Props = { params: Promise<{ locale: Lang }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("today") };
}

export default async function TodayPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // My Day is stored on the device, so the page ships every Guard-verified card and the client picks today's.
  // Cards that fail the Guard are left out and never shown.
  const cards: DayBlessing[] = [];
  for (const b of blessings) {
    const card = blessingCard(b.id, locale, "new");
    if (!card?.ok) continue;
    cards.push({
      id: b.id,
      label: b.labels[locale],
      ref: card.refs.map((r) => formatRef(r, locale)).join(" · "),
      ayat: card.ayat,
      translation: card.translation,
      // Share card: the verse is drawn only for reviewed mappings, one group per reference (never cut).
      groups: card.mappingUnderReview
        ? null
        : card.refs.map((r) => card.ayat.filter((a) => a.surah === r.surah && a.ayah >= r.ayah && a.ayah <= (r.ayahEnd ?? r.ayah))),
    });
  }

  const refrain = refrainPassage(locale);

  return (
    <TodayClient
      lang={locale}
      cards={cards}
      refrain={refrain.ok ? { ayat: refrain.ayat, translation: refrain.translation, ref: formatRef(refrain.refs[0]!, locale) } : null}
    />
  );
}
