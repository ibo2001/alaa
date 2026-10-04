"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LanguageSwitch({ label, ariaLabel }: { label: string; ariaLabel: string }) {
  const locale = useLocale();
  const pathname = usePathname(); // current path without the locale prefix
  const other = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={pathname}
      locale={other}
      lang={other}
      aria-label={ariaLabel}
      className="rounded border border-sama/40 px-2 py-0.5 hover:border-lazima hover:text-lazima"
    >
      {label}
    </Link>
  );
}
