import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function Offline({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("offline");
  return (
    <section className="py-12 text-center">
      <h1 className="font-heading text-3xl">{t("title")}</h1>
      <p className="mt-4">{t("body")}</p>
      <a href="" className="mt-8 inline-block rounded-full bg-layl px-6 py-2 text-lazima">
        {t("retry")}
      </a>
    </section>
  );
}
