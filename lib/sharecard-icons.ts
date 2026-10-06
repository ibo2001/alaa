// Line icons for the share card, one per blessing, from Lucide (ISC). Drawn on the canvas as SVG images.
import {
  BedDouble,
  Cherry,
  Cloud,
  CloudRain,
  Droplet,
  Eye,
  Gem,
  GlassWater,
  Grape,
  Hand,
  Hexagon,
  House,
  Milk,
  Mountain,
  PawPrint,
  PenLine,
  Ship,
  Shirt,
  Sparkles,
  Star,
  SunMoon,
  Sunset,
  TreePalm,
  Users,
  Waves,
  Wheat,
  type IconNode,
} from "lucide";

const ICONS: Record<string, IconNode> = {
  water: Droplet,
  "drinking-water": GlassWater,
  rain: CloudRain,
  "dates-palms": TreePalm,
  pomegranate: Cherry,
  "figs-olives": Grape,
  honey: Hexagon,
  milk: Milk,
  "sun-moon": SunMoon,
  sky: Cloud,
  "stars-trees": Sparkles,
  sea: Waves,
  pearls: Gem,
  ships: Ship,
  "eyes-tongue": Eye,
  "speech-writing": PenLine,
  sleep: BedDouble,
  "night-day": Sunset,
  mountains: Mountain,
  clothing: Shirt,
  livestock: PawPrint,
  home: House,
  "crops-grain": Wheat,
  family: Users,
  hand: Hand,
};

const escape = (v: unknown) => String(v).replace(/[&"<>]/g, (c) => `&#${c.charCodeAt(0)};`);

/** A standalone SVG for the blessing's icon (a star if none is mapped), stroked in `color`. */
export function iconSvg(blessingId: string, color: string): string {
  const node = ICONS[blessingId] ?? Star;
  const children = node
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${escape(v)}"`).join(" ")}/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
}

export const hasIcon = (blessingId: string) => blessingId in ICONS;
