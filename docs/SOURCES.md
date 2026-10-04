# Sources, tools and licenses

Every dependency, font, image, dataset and translation used by Alaa is listed here.

## Religious content
| Item | Source | License / terms | Location |
|---|---|---|---|
| Quran text (Uthmani), `quran-uthmani.txt` | Tanzil Project, https://tanzil.net | Creative Commons Attribution 3.0; verbatim only, changing it is not allowed (`sources/quran/LICENSE`) | `sources/quran/` |
| English translation, `en.itani.txt` | Talal Itani, ClearQuran.com, obtained from https://tanzil.net/trans/ | CC BY-ND 4.0 (`sources/translations/en/LICENSE`). Attribution shown in the app: "Translation by Talal Itani, ClearQuran.com" | `sources/translations/en/` |
| Concept list, blessing references | Written for this project during the challenge; references from `docs/SPEC.md` §9 | Project's own; mappings pending religious review | `sources/concepts.json`, `sources/blessings.json` |

## Fonts (via `next/font/google`, self-hosted at build time)
| Font | Use | License |
|---|---|---|
| Aref Ruqaa | Headings | SIL Open Font License 1.1 |
| Amiri Quran | Verse text only | SIL Open Font License 1.1 |
| IBM Plex Sans Arabic | UI text | SIL Open Font License 1.1 |

## Images
| Item | Source | License |
|---|---|---|
| App icons (`public/icons/`) | Placeholder drawn for this project during the challenge | Project's own |
| Sample photos (`public/samples/`) | Wikimedia Commons, chosen by Ibrahim; see the table below | Public domain / CC0; hand photo is the project's own |

### Sample photos
All resized to 768px (longest edge) and re-encoded as JPEG, which also strips metadata. No other changes.

| File | Work | Source | License |
|---|---|---|---|
| `public/samples/water.jpg` | "Glass of Water.JPG" by Jorge Barrios | https://commons.wikimedia.org/wiki/File:Glass_of_Water.JPG | Public domain |
| `public/samples/dates.jpg` | "Dates on date palm.jpg" by Stan Shebs | https://commons.wikimedia.org/wiki/File:Dates_on_date_palm.jpg | Public domain |
| `public/samples/sky.jpg` | "Sky clouds.JPG" by 12345danNL | https://commons.wikimedia.org/wiki/File:Sky_clouds.JPG | CC0 |
| `public/samples/sky-trees.jpg` | "Blue sky white clouds looking up at trees.jpg" | https://commons.wikimedia.org/wiki/File:Blue_sky_white_clouds_looking_up_at_trees.jpg | CC0 1.0 |
| `public/samples/bubbles.jpg` | "Bubbles in glass of water.jpg" by Paolo Neo | https://commons.wikimedia.org/wiki/File:Bubbles_in_glass_of_water.jpg | Public domain |
| `public/samples/hand.jpg` | Photo of Ibrahim Qraiqe's hand, taken for Alaa during the challenge | Project's own | Project's own |
| `public/samples/keyboard.jpg` | "Acer SF114-32 keyboard closeup.jpg" by Florine W. Dekker | https://commons.wikimedia.org/wiki/File:Acer_SF114-32_keyboard_closeup.jpg | CC0 |

## Design
| Item | Source |
|---|---|
| Visual identity (colors, typography, logo direction) | Team's own work, shared with the sister project Mizan. See `docs/LINKS.md` |

## npm packages (direct dependencies)
| Package | Version | License |
|---|---|---|
| `next` | 15.5.27 | MIT |
| `react`, `react-dom` | 19.1.0 | MIT |
| `next-intl` | 4.14.9 | MIT |
| `@serwist/next`, `serwist` | 9.5.12 | MIT |
| `idb-keyval` | 6.3.0 | Apache-2.0 |
| `@anthropic-ai/sdk` | 0.131.0 | MIT |
| `zod` | 4.6.5 | MIT |

### Development only
| Package | Version | License |
|---|---|---|
| `typescript` | 5.9.3 | Apache-2.0 |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.3 | MIT |
| `eslint`, `eslint-config-next`, `@eslint/eslintrc` | 9.39.5 / 15.5.27 / 3.3.7 | MIT |
| `vitest` | 5.0.3 | MIT |
| `@playwright/test` | 1.63.0 | Apache-2.0 |
| `tsx` | 4.23.15 | MIT |
| `sharp` | 0.34.5 | Apache-2.0 |
| `@types/node`, `@types/react`, `@types/react-dom` | 24 / 19 / 19 | MIT |

## External services
| Service | Use |
|---|---|
| Anthropic API (Claude) | Vision recognition in `/api/see`, constrained to a closed list of concept IDs |
| Vercel | Hosting |
| quran.com | "Read in context" verification links (linked, not embedded) |
| IslamQA (islamqa.info) | Referral link for religious questions after the journey (linked, not embedded; chosen by Ibrahim) |

## AI tools used in development
| Tool | Use |
|---|---|
| Claude (Anthropic) | Helped draft the specification, pitch and visual identity before the challenge (see `BASELINE.md`) |
| Claude Code (Anthropic) | Pair-programming during the challenge. It never writes Quran or hadith text; verse text is loaded only from the Tanzil file |
