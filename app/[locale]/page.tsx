import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeClient } from "@/components/HomeClient";
import { formatRef } from "@/lib/quran/surahs";
import { homeVerses } from "@/lib/sources/home";
import { refrainPassage } from "@/lib/sources/passages";
import type { Lang } from "@/lib/types";
import slots from "@/sources/home.json";

export default async function Home({ params }: { params: Promise<{ locale: Lang }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const app = await getTranslations("app");
  const refrain = refrainPassage(locale);

  // Verses are verified by the Source Guard here, at build time; the device only chooses among them.
  return (
    <HomeClient
      lang={locale}
      appName={app("name")}
      verses={homeVerses(locale)}
      slots={{ night: slots.night, day: slots.day }}
      refrain={refrain.ok ? { ayat: refrain.ayat, translation: refrain.translation, ref: formatRef(refrain.refs[0]!, locale) } : null}
    />
  );
}
