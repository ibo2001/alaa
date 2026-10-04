import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { issueUrl, REPO_URL, REVIEW_LOG_URL } from "@/lib/links";
import { formatNumber } from "@/lib/quran/surahs";
import { recognizableConceptIds } from "@/lib/sources/data";
import referral from "@/sources/referral.json";
import type { Lang } from "@/lib/types";

type Props = { params: Promise<{ locale: Lang }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("about") };
}

const ext = { target: "_blank", rel: "noopener noreferrer", className: "text-nakhl underline" } as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-2xl text-tamr">{title}</h2>
      <div className="mt-2 space-y-2 leading-relaxed">{children}</div>
    </section>
  );
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const r = referral[locale] as { name: string | null; url: string | null };

  return (
    <article className="py-8">
      <h1 className="font-heading text-4xl">{t("title")}</h1>
      <p className="mt-3 text-lg">{t("lead")}</p>

      <Section title={t("isTitle")}>
        <p>{t("is")}</p>
      </Section>

      <Section title={t("isNotTitle")}>
        <p>{t("isNot")}</p>
      </Section>

      <Section title={t("aiTitle")}>
        <p>{t("ai", { count: formatNumber(recognizableConceptIds.length, locale) })}</p>
        <p>{t("aiMapping")}</p>
      </Section>

      <Section title={t("sourcesTitle")}>
        <p>{t("sourcesQuran")}</p>
        <p>{t("sourcesTranslation")}</p>
        <p>{t("sourcesVerify")}</p>
      </Section>

      <Section title={t("reviewTitle")}>
        <p>{t("review")}</p>
        <p>
          <a href={REVIEW_LOG_URL} {...ext}>
            {t("reviewLog")}
          </a>
        </p>
      </Section>

      <Section title={t("privacyTitle")}>
        <p>{t("privacy")}</p>
      </Section>

      {r.url && r.name && (
        <Section title={t("questionsTitle")}>
          <p>{t("questions")}</p>
          <p>
            <a href={r.url} {...ext}>
              {t("questionsLink", { name: r.name })}
            </a>
          </p>
        </Section>
      )}

      <Section title={t("reportTitle")}>
        <p>{t("report")}</p>
        <p>
          <a href={issueUrl("Report", "What looks wrong, and where?\n")} {...ext}>
            {t("reportLink")}
          </a>
        </p>
      </Section>

      <Section title={t("builtTitle")}>
        <p>{t("built")}</p>
        <p>
          <a href={REPO_URL} {...ext} dir="ltr">
            github.com/ibo2001/alaa
          </a>
        </p>
      </Section>

      <p className="mt-10">
        <Link href="/lens" className="inline-flex min-h-12 items-center rounded-full bg-layl px-6 py-3 text-lazima hover:bg-layl/90">
          {t("cta")}
        </Link>
      </p>
    </article>
  );
}
