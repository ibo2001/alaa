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

export const PlusIcon = ({ className }: Props) => (
  <svg {...base} className={className} strokeWidth={2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CheckIcon = ({ className }: Props) => (
  <svg {...base} className={className} strokeWidth={2.2}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const ShareIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" />
  </svg>
);

/** A shield with a check: the verified source. */
export const SourceIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M12 3l7 3v5.5c0 4.2-3 7.7-7 9.5-4-1.8-7-5.3-7-9.5V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const BookIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2zM12 6.5v13" />
  </svg>
);

export const PhotoIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M20.5 15.5l-4.5-4.5-8 8" />
  </svg>
);

export const CloseIcon = ({ className }: Props) => (
  <svg {...base} className={className} strokeWidth={2}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const DownloadIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
  </svg>
);

export const ExternalIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </svg>
);

/** Two arrows in a circle: show another. */
export const RefreshIcon = ({ className }: Props) => (
  <svg {...base} className={className}>
    <path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1" />
    <path d="M17.5 3.5v3.4h-3.4M6.5 20.5v-3.4h3.4" />
  </svg>
);
