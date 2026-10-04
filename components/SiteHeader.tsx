import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitch } from "./LanguageSwitch";

export function SiteHeader() {
  const t = useTranslations("nav");
  const app = useTranslations("app");
  const links = [
    { href: "/lens", label: t("lens") },
    { href: "/today", label: t("today") },
    { href: "/journey", label: t("journey") },
    { href: "/about", label: t("about") },
  ] as const;

  return (
    <header className="bg-layl text-sama">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-heading text-2xl text-lazima">
          {app("name")}
        </Link>
        <nav aria-label={t("label")} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-lazima">
              {l.label}
            </Link>
          ))}
          <LanguageSwitch label={t("switchLanguage")} ariaLabel={t("switchLanguageLabel")} />
        </nav>
      </div>
    </header>
  );
}
