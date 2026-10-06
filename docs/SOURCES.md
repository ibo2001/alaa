# Sources, tools and licenses

Every dependency, font, image, dataset and translation used by Alaa is listed here.

## Religious content
| Item | Source | License / terms | Location |
|---|---|---|---|
| Quran text (Uthmani), `quran-uthmani.txt` | Tanzil Project, https://tanzil.net | Creative Commons Attribution 3.0; verbatim only, changing it is not allowed (`sources/quran/LICENSE`) | `sources/quran/` |
| English translation, `english_rwwad_v1.0.19-xml.1.xml` (shown in the app) | Rowwad Translation Center, from QuranEnc.com (https://quranenc.com/en/browse/english_rwwad), version v1.0.19-xml.1, file kept unchanged | QuranEnc.com terms (`sources/translations/en.rwwad/LICENSE`): re-publish without changes, name the publisher and QuranEnc.com, mention the version, keep the version info in the file. Shown with the translator's footnotes. Attribution in the app: "Translation by Rowwad Translation Center" · "QuranEnc.com terms · v1.0.19-xml.1" | `sources/translations/en.rwwad/` |
| Previous English translation, `en.itani.txt` (registered, no longer used by any card) | Talal Itani, ClearQuran.com, obtained from https://tanzil.net/trans/ | CC BY-ND 4.0 (`sources/translations/en/LICENSE`). Attribution shown in the app: "Translation by Talal Itani, ClearQuran.com" | `sources/translations/en/` |
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
| Google Forms (Ibrahim's account) | User-testing forms and the reviewer's submissions inbox; created with the `gws` CLI; responses private to Ibrahim, never committed |
| IslamQA (islamqa.info) | Referral link for religious questions after the journey (linked, not embedded; chosen by Ibrahim) |

## AI tools used in development
| Tool | Use |
|---|---|
| Claude (Anthropic) | Helped draft the specification, pitch and visual identity before the challenge (see `BASELINE.md`) |
| Claude Code (Anthropic) | Pair-programming during the challenge. It never writes Quran or hadith text; verse text is loaded only from the Tanzil file |

## Demo video and evaluation tooling (not part of the app)
| Item | Use | License / terms |
|---|---|---|
| Remotion 4.0.533 (`remotion`, `@remotion/cli`, `@remotion/google-fonts`) | Composes the demo video in `video/` (separate `package.json`) | Remotion License: free for individuals and small teams |
| Playwright (existing dev dependency) + Chrome screencast | Records the app's screens for the video (`video/record.ts`) | Apache-2.0 |
| axe-core 4.13.0 (`@axe-core/playwright`) and Lighthouse 13.5 (run with `npx`, not installed in the repo) | Accessibility audit of the live site on Oct 6 (`docs/CHANGES_FROM_TESTING.md`) | MPL-2.0 (axe-core), Apache-2.0 (Lighthouse) |
| Pillow (Python, run with `uv`) | Made `app/favicon.ico` from the app's own 192px icon | MIT-CMU (HPND) |
| ffmpeg (Homebrew) | Assembles screen frames into clips | LGPL/GPL (tool only, not distributed) |
| whisper.cpp + `ggml-large-v3-turbo` model (Homebrew, local) | Transcribes the reviewer's voice notes on the developer's Mac; audio never leaves the machine | MIT (code), MIT (model) |
| LibreOffice + Poppler (Homebrew) | Renders the challenge PPTX decks to images for visual checks | MPL-2.0 / GPL (tools only) |
| Evaluation photos (`eval/images/`, local only) | 27 Pexels photos + 7 earlier photos; list in `eval/images/SOURCES.md` | Pexels License; earlier ones as listed |
| ElevenLabs (`eleven_multilingual_v2`, voice "Rawi – Calm & Clear Fusha Narrator", library voice) | Arabic voice-over of the demo video, 10 lines from `docs/video/SCRIPT.ar.md`, generated on 2026-10-05 (≈1,000 credits); disclosed on the video's end card; checked back with local whisper.cpp | ElevenLabs terms (Ibrahim's account); voice files stay out of git |
| "Water falling into a drinking glass" (Pexels video 10557768): https://www.pexels.com/video/water-falling-into-a-drinking-glass-10557768/ | Opening shot of the demo video (file in `video/public/footage/`, git-ignored) | Pexels License |

## RAG reviewer's assistant (offline tooling in `rag/`, not part of the app)
| Item | Use | License / terms |
|---|---|---|
| Tafsir Center for Quranic Studies database (`sources/tafsir/quran.db`, release v1.0, commit dbbfa77, SHA-256 pinned in `sources/tafsir/manifest.json`; local only, git-ignored) from the Hugging Face dataset `tafsircenter/tafsir-mcp-data` (https://huggingface.co/datasets/tafsircenter/tafsir-mcp-data), added by Ibrahim on 2026-10-05 | Arabic roots for retrieval and tafsir evidence (al-Muyassar, al-Mukhtasar) for the religious reviewer only; its own Quran text is never read or shown | Data CC BY 4.0, attribution "Tafsir Center for Quranic Studies (https://tafsir.net)" (`sources/tafsir/LICENSE`); code MIT (https://github.com/tafsircenter/tafsir-mcp) |
| `node:sqlite` (built into Node.js 22.5+) | Reads the Tafsir database read-only | Node.js license (MIT) |
