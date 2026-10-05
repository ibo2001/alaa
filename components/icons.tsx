// Small line icons for the app chrome. Decorative: the label next to each icon is the accessible name.
type Props = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

export const HomeIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
  </svg>
);

/** A route between two stations. */
export const JourneyIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="18" cy="6" r="2.2" />
    <path d="M8.2 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.8" />
  </svg>
);

/** A camera lens. */
export const LensIcon = ({ className }: Props) => (
  <svg {...base} className={className} strokeWidth={2}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </svg>
);

/** The sun: today. */
export const DayIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
);

export const InfoIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.6v.1" strokeWidth={2.2} />
  </svg>
);

/** Points to the inline start (left in LTR); flipped for RTL with rtl:-scale-x-100. */
export const BackIcon = ({ className }: Props) => (
  <svg {...base} className={className} strokeWidth={2.2}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

/** Points to the inline end (right in LTR); flipped for RTL with rtl:-scale-x-100. */
export const ChevronIcon = ({ className }: Props) => (
  <svg {...base} className={className} strokeWidth={2}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
