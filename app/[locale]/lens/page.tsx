import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LensClient } from "@/components/LensClient";
import { formatRef } from "@/lib/quran/surahs";
import { concepts } from "@/lib/sources/data";
import { abstentionPassage } from "@/lib/sources/passages";
import { samples } from "@/lib/vision/samples";
import type { Lang } from "@/lib/types";

type Props = { params: Promise<{ locale: Lang }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  return { title: t("lens") };
}

export default async function LensPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  // The abstention verse is verified by the Source Guard here, on the server, then passed down.
  const passage = abstentionPassage(locale);
  const abstention = passage.ok
    ? { ayat: passage.ayat, translation: passage.translation, ref: formatRef(passage.refs[0]!, locale) }
    : null;

  return (
    <>
      <h1 className="sr-only">{t("lens")}</h1>
      <LensClient
        lang={locale}
        samples={samples.map((s) => ({ id: s.id, file: s.file, alt: s.alt[locale], placeholder: s.placeholder }))}
        conceptLabels={Object.fromEntries(concepts.map((c) => [c.id, c.labels[locale]]))}
        abstention={abstention}
      />
    </>
  );
}
