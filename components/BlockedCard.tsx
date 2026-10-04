import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function BlockedCard() {
  const t = useTranslations("card");
  return (
    <section role="alert" className="mt-8 rounded-2xl border-2 border-tamr bg-white p-6 text-center">
      <h1 className="font-heading text-2xl text-tamr">{t("blockedTitle")}</h1>
      <p className="mt-3">{t("blockedBody")}</p>
      <Link href="/lens" className="mt-6 inline-block rounded-full bg-layl px-6 py-2 text-lazima">
        {t("lookAgain")}
      </Link>
    </section>
  );
}
