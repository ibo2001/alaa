# Sources, tools and licenses

Every dependency, font, image, dataset and translation used by Alaa is listed here.

## Religious content
| Item | Source | License / terms | Location |
|---|---|---|---|
| Quran text (Uthmani) | Tanzil Project, tanzil.net | Tanzil terms of use (file included alongside the text) | `sources/quran/` (pending) |
| English translation | _pending: chosen by Ibrahim with its license_ | _pending_ | `sources/translations/en/` |

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
| Sample photos (`public/samples/`) | _pending: added by Ibrahim with licenses_ | _pending_ |

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
| `@types/node`, `@types/react`, `@types/react-dom` | 24 / 19 / 19 | MIT |

## External services
| Service | Use |
|---|---|
| Anthropic API (Claude) | Vision recognition in `/api/see`, constrained to a closed list of concept IDs |
| Vercel | Hosting |
| quran.com | "Read in context" verification links (linked, not embedded) |

## AI tools used in development
| Tool | Use |
|---|---|
| Claude (Anthropic) | Helped draft the specification, pitch and visual identity before the challenge (see `BASELINE.md`) |
| Claude Code (Anthropic) | Pair-programming during the challenge. It never writes Quran or hadith text; verse text is loaded only from the Tanzil file |
