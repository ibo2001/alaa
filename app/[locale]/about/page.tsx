import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LensIcon } from "@/components/icons";
import { StagePicker } from "@/components/StagePicker";
import { button, PageHeader } from "@/components/ui";
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
    <section className="mt-4 rounded-2xl bg-surface p-5 shadow-sm">
      <h2 className="font-heading text-2xl text-tamr">{title}</h2>
      <div className="mt-2 space-y-2 leading-relaxed text-layl/85">{children}</div>
    </section>
  );
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const r = referral[locale] as { name: string | null; url: string | null };

  return (
    <article className="pb-4">
      <PageHeader title={t("title")} subtitle={t("lead")} />

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
        <p>
          <Link href="/review" className="text-nakhl underline">
            {t("reviewSheet")}
          </Link>
        </p>
      </Section>

      {/* The learning stage is asked on Home only until answered; here it can always be changed. */}
      <div className="mt-4">
        <StagePicker />
      </div>

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
          <a href={REPO_URL} {...ext} className={`${ext.className} break-all`} dir="ltr">
            github.com/ibo2001/alaa
          </a>
        </p>
      </Section>

      <Link href="/lens" className={`${button.primary} mt-6 w-full`}>
        <LensIcon className="size-5" />
        {t("cta")}
      </Link>
    </article>
  );
}
