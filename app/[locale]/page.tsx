import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/navigation";

export default function Welcome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const app = useTranslations("app");
  const t = useTranslations("welcome");

  return (
    <section className="flex flex-col items-center py-12 text-center">
      <h1 className="font-heading text-5xl text-tamr">{app("name")}</h1>
      <p className="mt-2 text-lg">{app("tagline")}</p>
      <p className="mt-8 max-w-md text-layl/80">{t("intro")}</p>
      <Link
        href="/lens"
        className="mt-10 rounded-full bg-layl px-8 py-3 text-lg text-lazima hover:bg-layl/90"
      >
        {t("start")}
      </Link>
    </section>
  );
}
