import { getTranslations, setRequestLocale } from "next-intl/server";
import { VersePassage } from "@/components/VersePassage";
import { Link } from "@/i18n/navigation";
import { formatRef } from "@/lib/quran/surahs";
import { refrainPassage } from "@/lib/sources/passages";
import type { Lang } from "@/lib/types";

export default async function Welcome({ params }: { params: Promise<{ locale: Lang }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const app = await getTranslations("app");
  const t = await getTranslations("welcome");
  const refrain = refrainPassage(locale);

  return (
    <section className="flex flex-col items-center py-10 text-center">
      <h1 className="font-heading text-5xl text-tamr">{app("name")}</h1>
      <p className="mt-2 text-lg">{app("tagline")}</p>

      {refrain.ok && (
        <figure className="mt-8 w-full rounded-3xl bg-layl px-6 py-8">
          <VersePassage ayat={refrain.ayat} translation={refrain.translation} lang={locale} tone="gold" size="xl" />
          <figcaption className="mt-3 text-xs text-sama/70">
            {formatRef(refrain.refs[0]!, locale)} · {t("refrainNote")}
          </figcaption>
        </figure>
      )}

      <p className="mt-8 max-w-md text-layl/80">{t("intro")}</p>
      <Link href="/lens" className="mt-8 rounded-full bg-layl px-8 py-3 text-lg text-lazima hover:bg-layl/90">
        {t("start")}
      </Link>
    </section>
  );
}
