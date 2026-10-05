import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { button } from "./ui";

export function BlockedCard() {
  const t = useTranslations("card");
  return (
    <section role="alert" className="mt-6 rounded-2xl bg-surface p-6 text-center shadow-sm ring-2 ring-tamr/40">
      <h1 className="font-heading text-2xl text-tamr">{t("blockedTitle")}</h1>
      <p className="mt-3">{t("blockedBody")}</p>
      <Link href="/lens" className={`${button.primary} mt-6`}>
        {t("lookAgain")}
      </Link>
    </section>
  );
}
