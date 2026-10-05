import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { button } from "@/components/ui";

export default function Offline({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("offline");
  return (
    <section className="py-12 text-center">
      <h1 className="font-heading text-3xl">{t("title")}</h1>
      <p className="mt-4">{t("body")}</p>
      <a href="" className={`${button.primary} mt-8`}>
        {t("retry")}
      </a>
    </section>
  );
}
