import { loadFont as loadRuqaa } from "@remotion/google-fonts/ArefRuqaa";
import { loadFont as loadPlexArabic } from "@remotion/google-fonts/IBMPlexSansArabic";
import { loadFont as loadPlex } from "@remotion/google-fonts/IBMPlexSans";
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Freeze,
  interpolate,
  OffthreadVideo,
  Sequence,
  Series,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clipFrames, FPS, lengthOf, scenes, voiceOf, type Scene } from "./script";

const { fontFamily: RUQAA } = loadRuqaa();
const { fontFamily: PLEX_AR } = loadPlexArabic();
const { fontFamily: PLEX } = loadPlex();

// The app's palette (app/globals.css).
const C = { layl: "#1B2340", deep: "#12183A", lazima: "#E6C478", sama: "#E4ECF3", nakhl: "#2F6B4F" };

const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 60% at 50% 18%, rgba(230,196,120,0.16), transparent 60%), linear-gradient(180deg, ${C.layl} 0%, ${C.deep} 100%)`,
    }}
  />
);

/** Fades and lifts children in at the start of a scene, and fades them out at its end. */
const Enter: React.FC<{ children: React.ReactNode; delay?: number; length: number }> = ({ children, delay = 0, length }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.8 } });
  const out = interpolate(frame, [length - 10, length], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity: Math.min(s, out), transform: `translateY(${(1 - s) * 30}px)` }}>{children}</div>;
};

const Title: React.FC<{ t: NonNullable<Scene["title"]>; length: number; landscape: boolean }> = ({ t, length, landscape }) => (
  <Enter length={length}>
    <div style={{ textAlign: "center", padding: landscape ? "0" : "0 60px" }}>
      <div dir="rtl" style={{ fontFamily: RUQAA, fontSize: landscape ? 64 : 76, color: C.lazima, lineHeight: 1.25 }}>
        {t.ar}
      </div>
      <div style={{ fontFamily: PLEX, fontSize: landscape ? 30 : 34, color: C.sama, opacity: 0.85, marginTop: 6, letterSpacing: 0.3 }}>{t.en}</div>
    </div>
  </Enter>
);

/** The app recording inside a phone frame; holds the last frame if the narration runs longer than the clip. */
const Phone: React.FC<{ clip: string; length: number; height: number }> = ({ clip, length, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = clipFrames(clip);
  const width = Math.round((height * 1170) / 2532);
  const pop = spring({ frame, fps, config: { damping: 200 } });
  const video = <OffthreadVideo src={staticFile(clip)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 64,
        padding: 14,
        background: "#0B0F22",
        boxShadow: "0 40px 90px rgba(0,0,0,0.55), 0 0 0 2px rgba(230,196,120,0.25)",
        transform: `scale(${0.94 + 0.06 * pop})`,
        opacity: interpolate(frame, [length - 10, length], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 50, overflow: "hidden", background: C.sama }}>
        {n > 0 && length > n ? (
          <>
            <Sequence durationInFrames={n}>{video}</Sequence>
            <Sequence from={n}>
              <Freeze frame={n - 1}>{video}</Freeze>
            </Sequence>
          </>
        ) : (
          video
        )}
      </div>
    </div>
  );
};

/** English captions for the Arabic narration, chunk by chunk, weighted by length. */
const Captions: React.FC<{ chunks: string[]; length: number; bottom: number; maxWidth: number }> = ({ chunks, length, bottom, maxWidth }) => {
  const frame = useCurrentFrame();
  const weights = chunks.map((c) => c.length);
  const sum = weights.reduce((a, b) => a + b, 0);
  let start = 0;
  const lead = 6;
  const span = length - lead - 12;
  const slots = chunks.map((text, i) => {
    const from = lead + Math.round((start / sum) * span);
    start += weights[i]!;
    const to = lead + Math.round((start / sum) * span);
    return { text, from, to };
  });
  const cur = slots.find((s) => frame >= s.from && frame < s.to);
  if (!cur) return null;
  const local = frame - cur.from;
  const a = interpolate(local, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth,
          padding: "14px 26px",
          borderRadius: 18,
          background: "rgba(11,15,34,0.78)",
          color: "#FFFFFF",
          fontFamily: PLEX,
          fontSize: 40,
          lineHeight: 1.3,
          textAlign: "center",
          opacity: a,
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};

const Numbers: React.FC<{ length: number }> = ({ length }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    { value: 88, fmt: (v: number) => `${Math.round(v)}%`, ar: "إجابة صحيحة أو امتناع صحيح", en: "correct or correctly abstained" },
    { value: 97, fmt: (v: number) => `${Math.round(v)}%`, ar: "ثبات عبر ٣ مرات", en: "consistent across 3 runs" },
    { value: 1.7, fmt: (v: number) => `${v.toFixed(1)} s`, ar: "زمن الاستجابة (الوسيط)", en: "median response" },
    { value: 0.004, fmt: (v: number) => `$${v.toFixed(3)}`, ar: "تكلفة الصورة", en: "cost per photo" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, width: 900 }}>
      {items.map((it, i) => {
        const p = spring({ frame: frame - 8 - i * 8, fps, config: { damping: 200 }, durationInFrames: 40 });
        return (
          <Enter key={it.en} delay={i * 8} length={length}>
            <div style={{ textAlign: "center", padding: "36px 10px", borderRadius: 28, background: "rgba(228,236,243,0.06)", border: "1px solid rgba(230,196,120,0.25)" }}>
              <div style={{ fontFamily: PLEX, fontWeight: 700, fontSize: 104, color: C.lazima }}>{it.fmt(it.value * p)}</div>
              <div dir="rtl" style={{ fontFamily: PLEX_AR, fontSize: 32, color: C.sama, marginTop: 8 }}>{it.ar}</div>
              <div style={{ fontFamily: PLEX, fontSize: 26, color: C.sama, opacity: 0.7, marginTop: 4 }}>{it.en}</div>
            </div>
          </Enter>
        );
      })}
      <div style={{ gridColumn: "1 / -1", textAlign: "center", fontFamily: PLEX, fontSize: 26, color: C.sama, opacity: 0.6 }}>
        34 photos × 3 runs · Claude Haiku 4.5 · docs/RESULTS.md
      </div>
    </div>
  );
};

const End: React.FC<{ length: number }> = ({ length }) => (
  <Enter length={length + 30}>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: RUQAA, fontSize: 220, color: C.lazima, lineHeight: 1.1 }}>آلاء</div>
      <div style={{ fontFamily: PLEX, fontSize: 46, color: C.sama, marginTop: 24 }}>alaa-alpha.vercel.app</div>
      <div style={{ fontFamily: PLEX, fontSize: 30, color: C.sama, opacity: 0.7, marginTop: 12 }}>github.com/ibo2001/alaa</div>
      <div dir="rtl" style={{ fontFamily: PLEX_AR, fontSize: 26, color: C.sama, opacity: 0.55, marginTop: 48 }}>
        التعليق الصوتي مولَّد بالذكاء الاصطناعي (ElevenLabs)
      </div>
    </div>
  </Enter>
);

const Footage: React.FC<{ clip: string; length: number }> = ({ clip, length }) => {
  const frame = useCurrentFrame();
  const n = clipFrames(clip);
  if (n === 0) {
    // Placeholder until the Pexels clip is added to public/footage/.
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: "#0B0F22" }}>
        <div style={{ fontFamily: PLEX, fontSize: 36, color: C.sama, opacity: 0.5 }}>[ glass of water footage ]</div>
      </AbsoluteFill>
    );
  }
  const zoom = interpolate(frame, [0, length], [1.04, 1.12]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo src={staticFile(clip)} muted style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "40% 50%", transform: `scale(${zoom})`, transformOrigin: "40% 60%" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(18,24,58,0.2), rgba(18,24,58,0.65))" }} />
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ s: Scene; landscape: boolean }> = ({ s, landscape }) => {
  const length = lengthOf(s);
  const voice = voiceOf(s);
  const phoneH = landscape ? 820 : 1300;
  return (
    <AbsoluteFill>
      {s.kind === "footage" ? <Footage clip={s.clip!} length={length} /> : <Background />}
      {s.kind === "phone" && (
        <AbsoluteFill
          style={
            landscape
              ? { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 120, paddingBottom: 140 }
              : { alignItems: "center", justifyContent: "flex-start", paddingTop: 120, gap: 50 }
          }
        >
          {landscape ? (
            <>
              <div style={{ width: 700 }}>{s.title && <Title t={s.title} length={length} landscape />}</div>
              <Phone clip={s.clip!} length={length} height={phoneH} />
            </>
          ) : (
            <>
              {s.title && <Title t={s.title} length={length} landscape={false} />}
              <Phone clip={s.clip!} length={length} height={phoneH} />
            </>
          )}
        </AbsoluteFill>
      )}
      {s.kind === "numbers" && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: landscape ? 36 : 70, flexDirection: "column", paddingBottom: landscape ? 150 : 0 }}>
          {s.title && <Title t={s.title} length={length} landscape={landscape} />}
          <Numbers length={length} />
        </AbsoluteFill>
      )}
      {s.kind === "end" && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <End length={length} />
        </AbsoluteFill>
      )}
      <Captions chunks={s.captions} length={length} bottom={landscape ? 36 : 150} maxWidth={landscape ? 1500 : 940} />
      {voice && <Audio src={staticFile(voice)} />}
    </AbsoluteFill>
  );
};

export const Demo: React.FC<{ landscape?: boolean }> = ({ landscape = false }) => (
  <AbsoluteFill style={{ background: C.deep }}>
    <Series>
      {scenes.map((s) => (
        <Series.Sequence key={s.id} durationInFrames={lengthOf(s)}>
          <SceneView s={s} landscape={landscape} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);

export { FPS };
