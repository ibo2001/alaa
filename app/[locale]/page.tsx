import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronIcon, DayIcon, InfoIcon, JourneyIcon, LensIcon } from "@/components/icons";
import { StagePicker } from "@/components/StagePicker";
import { VersePassage } from "@/components/VersePassage";
import { Link } from "@/i18n/navigation";
import { formatNumber, formatRef } from "@/lib/quran/surahs";
import { refrainPassage, refrainRepeatCount } from "@/lib/sources/passages";
import type { Lang } from "@/lib/types";

export default async function Welcome({ params }: { params: Promise<{ locale: Lang }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const app = await getTranslations("app");
  const t = await getTranslations("welcome");
  const pages = await getTranslations("pages");
  const refrain = refrainPassage(locale);

  const shortcuts = [
    { href: "/journey", label: pages("journey"), Icon: JourneyIcon, tint: "bg-nakhl" },
    { href: "/today", label: pages("today"), Icon: DayIcon, tint: "bg-tamr" },
    { href: "/about", label: pages("about"), Icon: InfoIcon, tint: "bg-layl" },
  ] as const;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <section className="hero-glow overflow-hidden rounded-[2rem] px-6 pb-6 pt-10 text-center text-sama shadow-xl shadow-layl/20">
        <h1 className="font-heading text-6xl leading-tight text-lazima">{app("name")}</h1>
        <p className="mt-1 text-sama/80">{app("tagline")}</p>

        {refrain.ok && (
          <figure className="mt-8">
            <VersePassage ayat={refrain.ayat} translation={refrain.translation} lang={locale} tone="gold" size="xl" />
            <figcaption className="mt-3 text-xs text-sama/60">
              {formatRef(refrain.refs[0]!, locale)} · {t("refrainNote", { count: formatNumber(refrainRepeatCount(), locale) })}
            </figcaption>
          </figure>
        )}

        <Link
          href="/lens"
          className="press mt-8 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-lazima text-lg font-medium text-layl"
        >
          <LensIcon className="size-6" />
          {t("start")}
        </Link>
      </section>

      <p className="px-2 text-center leading-relaxed text-layl/80">{t("intro")}</p>

      <StagePicker />

      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        <ul className="divide-y divide-layl/10">
          {shortcuts.map(({ href, label, Icon, tint }) => (
            <li key={href}>
              <Link href={href} className="flex min-h-14 items-center gap-3 px-4 active:bg-layl/5">
                <span className={`grid size-8 place-items-center rounded-lg text-sama ${tint}`}>
                  <Icon className="size-5" />
                </span>
                <span className="flex-1 font-medium">{label}</span>
                <ChevronIcon className="size-5 text-layl/35 rtl:-scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
