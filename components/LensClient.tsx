"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { markStation } from "@/lib/device";
import { downscaleImage } from "@/lib/image/downscale";
import type { StationNumber } from "@/lib/journey";
import type { GuardedAyah, TranslationStatus } from "@/lib/guard";
import type { Decision, DecisionCandidate } from "@/lib/vision/decide";
import type { Lang } from "@/lib/types";
import { VersePassage } from "./VersePassage";

type SampleView = { id: string; file: string; alt: string; placeholder: boolean; credit: string; license: string; sourceUrl: string };
type ErrorKind = "network" | "daily-limit" | "model-unavailable" | "invalid-image" | "too-large" | "decode" | "invalid-request";
type AbstainReason = Extract<Decision, { kind: "abstain" }>["reason"];

type State =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "confirm"; candidates: DecisionCandidate[] }
  | { kind: "abstain"; reason: AbstainReason; concept?: string }
  | { kind: "error"; error: ErrorKind };

const KNOWN_ERRORS = new Set<ErrorKind>(["daily-limit", "model-unavailable", "invalid-image", "too-large", "invalid-request"]);

const primary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-layl px-6 py-3 text-lazima hover:bg-layl/90 disabled:opacity-50";
const secondary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-layl px-6 py-3 text-layl hover:bg-layl/5 disabled:opacity-50";

/** The general-gratitude ayat, each whole and on its own card, with previous/next. */
function AbstentionCards({
  cards,
  lang,
}: {
  cards: { ayat: GuardedAyah[]; translation: TranslationStatus; ref: string }[];
  lang: Lang;
}) {
  const t = useTranslations("abstain");
  const [i, setI] = useState(0);
  const card = cards[i]!;
  const nav = "min-h-11 min-w-11 rounded-full border border-sama/40 px-3 text-sama hover:border-lazima disabled:opacity-30";
  return (
    <div role="group" aria-roledescription="carousel" aria-label={t("cardsLabel")}>
      <div aria-live="polite" aria-label={t("cardOf", { n: i + 1, total: cards.length })}>
        <VersePassage ayat={card.ayat} translation={card.translation} lang={lang} tone="gold" />
        <p className="mt-2 text-center text-sm text-sama/80">{card.ref}</p>
      </div>
      {cards.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button type="button" className={nav} disabled={i === 0} onClick={() => setI(i - 1)} aria-label={t("previous")}>
            <span aria-hidden className="rtl:rotate-180 inline-block">←</span>
          </button>
          <span className="text-sm text-sama/70">{t("cardOf", { n: i + 1, total: cards.length })}</span>
          <button
            type="button"
            className={nav}
            disabled={i === cards.length - 1}
            onClick={() => setI(i + 1)}
            aria-label={t("next")}
          >
            <span aria-hidden className="rtl:rotate-180 inline-block">→</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function LensClient({
  lang,
  samples,
  conceptLabels,
  abstention,
  stationOf,
}: {
  lang: Lang;
  samples: SampleView[];
  conceptLabels: Record<string, string>;
  abstention: { ayat: GuardedAyah[]; translation: TranslationStatus; ref: string }[];
  /** blessing id → Ar-Rahman Journey station, so a photo counts as finding that station. */
  stationOf: Record<string, StationNumber>;
}) {
  const t = useTranslations("lens");
  const tc = useTranslations("confirm");
  const ta = useTranslations("abstain");
  const te = useTranslations("errors");
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "idle" });
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const busy = state.kind === "working";
  // Buttons do nothing until React hydrates; expose readiness for tests and keep controls disabled until then.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function openCard(blessingId: string) {
    const station = stationOf[blessingId];
    if (station) await markStation(station, "photo").catch(() => {});
    router.push(`/blessing/${blessingId}`);
  }

  function apply(decision: Decision) {
    if (decision.kind === "card") void openCard(decision.blessingId);
    else if (decision.kind === "confirm") setState({ kind: "confirm", candidates: decision.candidates });
    else setState({ kind: "abstain", reason: decision.reason, concept: decision.concept });
  }

  async function send(init: RequestInit) {
    setState({ kind: "working" });
    let res: Response;
    try {
      res = await fetch("/api/see", { method: "POST", ...init });
    } catch {
      setState({ kind: "error", error: "network" });
      return;
    }
    const body = (await res.json().catch(() => ({}))) as { decision?: Decision; error?: ErrorKind };
    if (res.ok && body.decision) apply(body.decision);
    else setState({ kind: "error", error: body.error && KNOWN_ERRORS.has(body.error) ? body.error : "model-unavailable" });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    setState({ kind: "working" });
    let blob: Blob;
    try {
      blob = await downscaleImage(file);
    } catch {
      setState({ kind: "error", error: "decode" });
      return;
    }
    const form = new FormData();
    form.append("image", blob, "photo.jpg");
    await send({ body: form });
  }

  function trySample(id: string) {
    void send({ body: JSON.stringify({ sampleId: id }), headers: { "content-type": "application/json" } });
  }

  function pick(c: DecisionCandidate) {
    if (c.blessingId) void openCard(c.blessingId);
    else setState({ kind: "abstain", reason: "no-blessing", concept: c.concept });
  }

  const label = (concept?: string) => (concept ? (conceptLabels[concept] ?? concept) : "");

  return (
    <div className="py-6" data-ready={ready || undefined}>
      <p className="text-center text-layl/80">{t("intro")}</p>

      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <button type="button" className={primary} disabled={busy || !ready} onClick={() => cameraInput.current?.click()}>
          <span aria-hidden>◉</span> {t("takePhoto")}
        </button>
        <button type="button" className={secondary} disabled={busy || !ready} onClick={() => galleryInput.current?.click()}>
          {t("upload")}
        </button>
        <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={onFile} tabIndex={-1} />
        <input ref={galleryInput} type="file" accept="image/*" hidden onChange={onFile} tabIndex={-1} />
      </div>
      <p className="mt-3 text-center text-xs text-layl/60">{t("privacy")}</p>

      <div aria-live="polite" className="mt-6">
        {state.kind === "working" && (
          <p className="text-center text-lg" role="status">
            <span className="inline-block animate-pulse">{t("working")}</span>
          </p>
        )}

        {state.kind === "confirm" && (
          <section className="rounded-2xl bg-white p-5 shadow" aria-labelledby="confirm-title">
            <h2 id="confirm-title" className="font-heading text-2xl">{tc("title")}</h2>
            <p className="mt-1 text-sm text-layl/70">{tc("hint")}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {state.candidates.map((c) => (
                <li key={c.concept}>
                  <button type="button" className={`${secondary} w-full`} onClick={() => pick(c)}>
                    {label(c.concept)}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="min-h-11 w-full rounded-full px-4 py-2 text-sm underline"
                  onClick={() => setState({ kind: "abstain", reason: "low-confidence" })}
                >
                  {tc("noneOfThese")}
                </button>
              </li>
            </ul>
          </section>
        )}

        {state.kind === "abstain" && (
          <section className="rounded-2xl bg-layl p-6 text-sama shadow" aria-labelledby="abstain-title">
            <h2 id="abstain-title" className="text-center text-lg">
              {ta(state.reason, { concept: label(state.concept) })}
            </h2>
            {abstention.length > 0 && (state.reason === "low-confidence" || state.reason === "no-blessing") && (
              <div className="mt-5">
                <p className="mb-3 text-center text-sm text-sama/70">{ta("general")}</p>
                <AbstentionCards cards={abstention} lang={lang} />
              </div>
            )}
            <p className="mt-6 text-center">
              <button
                type="button"
                className="min-h-11 rounded-full bg-lazima px-6 py-2 text-layl"
                onClick={() => setState({ kind: "idle" })}
              >
                {t("tryAgain")}
              </button>
            </p>
          </section>
        )}

        {state.kind === "error" && (
          <section role="alert" className="rounded-2xl border-2 border-tamr bg-white p-5">
            <h2 className="font-bold text-tamr">{te("title")}</h2>
            <p className="mt-2">{te(state.error)}</p>
            <button
              type="button"
              className="mt-4 min-h-11 rounded-full bg-layl px-5 py-2 text-lazima"
              onClick={() => setState({ kind: "idle" })}
            >
              {te("dismiss")}
            </button>
          </section>
        )}
      </div>

      <section className="mt-10" aria-labelledby="samples-title">
        <h2 id="samples-title" className="font-heading text-2xl">{t("samplesTitle")}</h2>
        <p className="text-sm text-layl/70">{t("samplesHint")}</p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {samples.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                disabled={busy || !ready}
                onClick={() => trySample(s.id)}
                aria-label={t("sampleLabel", { name: s.alt })}
                data-sample={s.id}
                className="group relative block w-full overflow-hidden rounded-xl bg-layl/10 disabled:opacity-50"
              >
                <Image src={s.file} alt={s.alt} width={384} height={384} className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 bg-layl/80 px-2 py-1 text-sm text-sama">
                  {s.alt}
                  {s.placeholder && <span className="ms-1 text-xs text-sama/60">({t("placeholderNote")})</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <details className="mt-3 text-xs text-layl/70">
          <summary className="cursor-pointer">{t("credits")}</summary>
          <ul className="mt-2 space-y-1">
            {samples.map((s) => (
              <li key={s.id}>
                <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline" lang="en" dir="ltr">
                  {s.credit}
                </a>{" "}
                · {s.license}
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}
