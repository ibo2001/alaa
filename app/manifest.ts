import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "آلاء · Alaa",
    short_name: "آلاء",
    description: "A lens for seeing blessings · عدسة لرؤية النعم",
    start_url: "/",
    display: "standalone",
    background_color: "#1B2340",
    theme_color: "#1B2340",
    dir: "rtl",
    lang: "ar",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
