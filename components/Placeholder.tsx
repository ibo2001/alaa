import { useTranslations } from "next-intl";

export function Placeholder({ title }: { title: string }) {
  const t = useTranslations("placeholder");
  return (
    <section className="py-10">
      <h1 className="font-heading text-3xl">{title}</h1>
      <p className="mt-4 text-layl/70">{t("comingSoon")}</p>
    </section>
  );
}
