// Shared building blocks for an app-like look: one button family, large titles, inset cards.

export const button = {
  primary:
    "press inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-layl px-6 font-medium text-lazima disabled:opacity-50",
  gold: "press inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-lazima px-6 font-medium text-layl disabled:opacity-50",
  secondary:
    "press inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-surface px-6 font-medium text-layl shadow-sm ring-1 ring-layl/10 disabled:opacity-50",
  /** Small pill, for secondary actions inside cards. */
  chip: "press inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-layl/[0.07] px-4 text-sm font-medium text-layl",
  chipDark: "press inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-layl px-4 text-sm font-medium text-lazima",
  /** Text-only action, e.g. "None of these" or "Reset". */
  plain: "press inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm text-layl/70 hover:text-layl",
} as const;

/** iOS-style large title, aligned to the start, with an optional line under it. */
export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="pb-2 pt-5">
      <h1 className="font-heading text-4xl leading-tight text-layl">{title}</h1>
      {subtitle && <p className="mt-1 text-layl/70">{subtitle}</p>}
      {children}
    </header>
  );
}

/** White inset card on the sky background. */
export function Card({ className = "", children, ...rest }: React.HTMLAttributes<HTMLElement> & { as?: never }) {
  return (
    <section className={`rounded-2xl bg-surface p-5 shadow-sm ${className}`} {...rest}>
      {children}
    </section>
  );
}

/** Small section heading above a group, like iOS list headers. */
export function SectionLabel({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-2 mt-8 px-1 text-sm font-semibold text-layl/75">
      {children}
    </h2>
  );
}
