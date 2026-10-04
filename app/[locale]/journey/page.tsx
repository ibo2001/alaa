import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JourneyClient, type StationView } from "@/components/JourneyClient";
import { stationsFrom } from "@/lib/journey";
import { formatRef } from "@/lib/quran/surahs";
import { getBlessing, blessings } from "@/lib/sources/data";
import referral from "@/sources/referral.json";
import type { Lang } from "@/lib/types";

type Props = { params: Promise<{ locale: Lang }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("journey") };
}

export default async function JourneyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const stations: StationView[] = stationsFrom(blessings).map((s) => ({
    n: s.n,
    blessings: s.blessingIds.map((id) => {
      const b = getBlessing(id)!;
      return { id, label: b.labels[locale], ref: b.verses.map((v) => formatRef(v, locale)).join(" · ") };
    }),
  }));

  const r = referral[locale] as { name: string | null; url: string | null };
  return <JourneyClient stations={stations} referral={r.url && r.name ? { name: r.name, url: r.url } : null} />;
}
