import { Amiri_Quran, Aref_Ruqaa, IBM_Plex_Sans_Arabic } from "next/font/google";

// UI text
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

// Headings
export const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-aref-ruqaa",
  display: "swap",
});

// Verse text only
export const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-amiri-quran",
  display: "swap",
});

export const fontVariables = [plexArabic, arefRuqaa, amiriQuran]
  .map((f) => f.variable)
  .join(" ");
