"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { markStation } from "@/lib/device";
import { downscaleImage } from "@/lib/image/downscale";
import { formatNumber } from "@/lib/quran/surahs";
import type { StationNumber } from "@/lib/journey";
import type { GuardedAyah, TranslationStatus } from "@/lib/guard";
import type { Decision, DecisionCandidate } from "@/lib/vision/decide";
import type { Lang } from "@/lib/types";
import { BackIcon, LensIcon, PhotoIcon } from "./icons";
import { Sheet } from "./Sheet";
import { button } from "./ui";
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
  const counter = t("cardOf", { n: formatNumber(i + 1, lang), total: formatNumber(cards.length, lang) });
  const nav = "press grid size-11 place-items-center rounded-full bg-sama/10 text-sama disabled:opacity-30";
  return (
    <div role="group" aria-roledescription="carousel" aria-label={t("cardsLabel")}>
      <div aria-live="polite" aria-label={counter}>
        <VersePassage ayat={card.ayat} translation={card.translation} lang={lang} tone="gold" />
        <p className="mt-2 text-center text-sm text-sama/80">{card.ref}</p>
      </div>
      {cards.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button type="button" className={nav} disabled={i === 0} onClick={() => setI(i - 1)} aria-label={t("previous")}>
            <BackIcon className="size-5 rtl:-scale-x-100" />
          </button>
          <span className="text-sm text-sama/70">{counter}</span>
          <button
            type="button"
            className={nav}
            disabled={i === cards.length - 1}
            onClick={() => setI(i + 1)}
            aria-label={t("next")}
          >
            <BackIcon className="size-5 -scale-x-100 rtl:scale-x-100" />
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
  title,
}: {
  title: string;
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

  const dismiss = () => setState({ kind: "idle" });

  return (
    <div className="pb-4 pt-5" data-ready={ready || undefined}>
      <h1 className="font-heading text-4xl leading-tight">{title}</h1>

      {/* Viewfinder: the main action, styled like a camera. */}
      <section className="viewfinder relative mt-4 overflow-hidden rounded-[2rem] px-6 pb-6 pt-8 text-sama shadow-xl shadow-layl/20">
        <div aria-hidden className="viewfinder-corners pointer-events-none absolute inset-4" />
        {busy && <div aria-hidden className="scan-line pointer-events-none absolute inset-x-0 top-0 h-full" />}

        <div aria-live="polite" className="relative flex min-h-24 items-center justify-center px-4 text-center">
          {busy ? (
            <p role="status" className="text-lg text-lazima">
              <span className="inline-block animate-pulse">{t("working")}</span>
            </p>
          ) : (
            <p className="text-sama/85">{t("intro")}</p>
          )}
        </div>

        <div className="relative mt-6 grid grid-cols-3 items-end">
          <div className="flex justify-center">
            <button
              type="button"
              className="press flex flex-col items-center gap-1.5 text-xs text-sama/80 disabled:opacity-40"
              disabled={busy || !ready}
              onClick={() => galleryInput.current?.click()}
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-sama/12 ring-1 ring-sama/20">
                <PhotoIcon className="size-6" />
              </span>
              {t("upload")}
            </button>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="press flex flex-col items-center gap-1.5 text-xs font-medium text-lazima disabled:opacity-40"
              disabled={busy || !ready}
              onClick={() => cameraInput.current?.click()}
            >
              <span className="grid size-[4.5rem] place-items-center rounded-full ring-4 ring-lazima/40">
                <span className="grid size-16 place-items-center rounded-full bg-lazima text-layl">
                  <LensIcon className="size-7" />
                </span>
              </span>
              {t("takePhoto")}
            </button>
          </div>
          <div />
        </div>
        <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={onFile} tabIndex={-1} />
        <input ref={galleryInput} type="file" accept="image/*" hidden onChange={onFile} tabIndex={-1} />
      </section>
      <p className="mt-3 px-2 text-center text-xs text-layl/60">{t("privacy")}</p>

      <Sheet open={state.kind === "confirm"} onDismiss={dismiss} labelledBy="confirm-title">
        {state.kind === "confirm" && (
          <>
            <h2 id="confirm-title" className="font-heading text-3xl">{tc("title")}</h2>
            <p className="mt-1 text-sm text-layl/70">{tc("hint")}</p>
            <ul className="mt-5 flex flex-col gap-2">
              {state.candidates.map((c) => (
                <li key={c.concept}>
                  <button type="button" className={`${button.secondary} w-full`} onClick={() => pick(c)}>
                    {label(c.concept)}
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className={`${button.plain} w-full`} onClick={() => setState({ kind: "abstain", reason: "low-confidence" })}>
                  {tc("noneOfThese")}
                </button>
              </li>
            </ul>
          </>
        )}
      </Sheet>

      <Sheet open={state.kind === "abstain"} onDismiss={dismiss} labelledBy="abstain-title" tone="dark">
        {state.kind === "abstain" && (
          <>
            <h2 id="abstain-title" className="text-center text-lg">
              {ta(state.reason, { concept: label(state.concept) })}
            </h2>
            {abstention.length > 0 && (state.reason === "low-confidence" || state.reason === "no-blessing") && (
              <div className="mt-5">
                <p className="mb-3 text-center text-sm text-sama/70">{ta("general")}</p>
                <AbstentionCards cards={abstention} lang={lang} />
              </div>
            )}
            <button type="button" className={`${button.gold} mt-6 w-full`} onClick={dismiss}>
              {t("tryAgain")}
            </button>
          </>
        )}
      </Sheet>

      <Sheet open={state.kind === "error"} onDismiss={dismiss} labelledBy="error-title" role="alertdialog">
        {state.kind === "error" && (
          <>
            <h2 id="error-title" className="text-lg font-bold text-tamr">{te("title")}</h2>
            <p className="mt-2">{te(state.error)}</p>
            <button type="button" className={`${button.primary} mt-6 w-full`} onClick={dismiss}>
              {te("dismiss")}
            </button>
          </>
        )}
      </Sheet>

      <section className="mt-8" aria-labelledby="samples-title">
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
                className="press group relative block w-full overflow-hidden rounded-2xl bg-layl/10 shadow-sm disabled:opacity-50"
              >
                <Image src={s.file} alt={s.alt} width={384} height={384} className="aspect-square w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-layl/90 to-transparent px-3 pb-2 pt-6 text-start text-sm font-medium text-sama">
                  {s.alt}
                  {s.placeholder && <span className="ms-1 text-xs text-sama/60">({t("placeholderNote")})</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <details className="mt-3 px-1 text-xs text-layl/70">
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
