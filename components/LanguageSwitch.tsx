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
      className="press inline-flex min-h-9 items-center rounded-full bg-sama/10 px-3 text-sm hover:bg-sama/20"
    >
      {label}
    </Link>
  );
}
