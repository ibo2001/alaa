"use client";

import { useEffect, useRef } from "react";

/**
 * Bottom sheet on the native <dialog> element: modal, focus kept inside, Esc closes, the page behind is inert.
 * Rises from the bottom edge (see .sheet in globals.css).
 */
export function Sheet({
  open,
  onDismiss,
  labelledBy,
  tone = "light",
  role,
  focusHeading = false,
  children,
}: {
  open: boolean;
  onDismiss: () => void;
  labelledBy: string;
  tone?: "light" | "dark";
  role?: "alertdialog";
  /** Start focus on the heading (labelledBy, needs tabIndex={-1}) instead of the first link or button. */
  focusHeading?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      if (focusHeading) document.getElementById(labelledBy)?.focus();
    }
    if (!open && d.open) d.close();
  }, [open, focusHeading, labelledBy]);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault(); // Esc: let the parent decide, so state and dialog stay in step
        onDismiss();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss(); // tap on the dimmed area
      }}
      className={`sheet ${tone === "dark" ? "bg-layl text-sama" : "bg-sama text-layl"}`}
    >
      <div className="sheet-body">
        <div aria-hidden className={`mx-auto mb-4 h-1.5 w-10 rounded-full ${tone === "dark" ? "bg-sama/25" : "bg-layl/20"}`} />
        {children}
      </div>
    </dialog>
  );
}
