// The demo, shot by shot, from docs/video/SCRIPT.ar.md (Arabic narration) with its English captions.
// No verse text here: verses appear only inside the app's own screen recordings.
import media from "./media.json";

export const FPS = 30;

export type Scene = {
  id: string;
  /** Default length in seconds (the script's timing); replaced by the voice line's length when it exists. */
  seconds: number;
  kind: "footage" | "phone" | "numbers" | "end";
  clip?: string;
  /** Headline shown above the phone (short, English and Arabic). */
  title?: { en: string; ar: string };
  /** English caption chunks for the Arabic narration, shown in order across the scene. */
  captions: string[];
  /** Arabic narration (for the voice file and reference only). */
  narration: string;
};

export const scenes: Scene[] = [
  {
    id: "s1",
    seconds: 8,
    kind: "footage",
    clip: "footage/glass.mp4",
    captions: ["We see water every day.", "When did we last really notice it?"],
    narration: "نرى الماء كل يوم… فمتى انتبهنا إليه آخر مرة؟",
  },
  {
    id: "s2",
    seconds: 8,
    kind: "phone",
    clip: "clips/s2_home.mp4",
    title: { en: "A lens for blessings", ar: "عدسةٌ ترى النِّعَم" },
    captions: ["Alaa is a lens for blessings:", "point your camera at something ordinary,", "and see where the Quran draws attention to it."],
    narration: "آلاء عدسةٌ ترى النِّعَم: وجّه الكاميرا إلى شيء عادي حولك، وانظر أين يلفت القرآن الانتباه إليه.",
  },
  {
    id: "s3",
    seconds: 18,
    kind: "phone",
    clip: "clips/s3_lens_water.mp4",
    title: { en: "The AI sees. It never speaks about religion.", ar: "الذكاء الاصطناعي يرى، ولا يتكلم في الدين" },
    captions: [
      "The AI only recognises the object,",
      "from a closed list of 122 everyday things.",
      "It never writes religious text:",
      "the verse is loaded by its reference from a verified copy of the Quran,",
      "checked before it is shown,",
      "and followed by Surah Ar-Rahman's refrain.",
    ],
    narration:
      "الذكاء الاصطناعي هنا يتعرّف على الشيء فقط، من قائمة مغلقة من مئة واثنين وعشرين شيئاً يومياً. ولا يكتب نصاً دينياً أبداً: الآية تُحمَّل بمرجعها من نسخة موثّقة من القرآن، وتُفحص قبل عرضها، ثم تتبعها لازمة سورة الرحمن.",
  },
  {
    id: "s4",
    seconds: 10,
    kind: "phone",
    clip: "clips/s4_myday.mp4",
    title: { en: "My Day's Surah", ar: "سورة يومي" },
    captions: ["Blessings you notice become your day's surah,", "a card you can share."],
    narration: "والنِّعَم التي تلاحظها تصير سورةَ يومك، بطاقةً تشاركها.",
  },
  {
    id: "s5",
    seconds: 12,
    kind: "phone",
    clip: "clips/s5_keyboard.mp4",
    title: { en: "When unsure, it says so", ar: "حين لا يتيقّن، يقول ذلك" },
    captions: ["When there is no verse for something, Alaa says so, honestly,", "and offers a general reminder instead of guessing."],
    narration: "وحين لا يجد آيةً لشيء، يقول ذلك بصدق، ويذكّرك بآية عامة بدل أن يخمّن.",
  },
  {
    id: "s6",
    seconds: 14,
    kind: "phone",
    clip: "clips/s6_source.mp4",
    title: { en: "Verifiable · reviewed by a da'i", ar: "قابل للتحقق · بمراجعة داعية" },
    captions: [
      "Every card shows its source and a quran.com link to verify it.",
      "Four automatic checks guard the text, the translation, and the religious review;",
      "a da'i reviewed the mappings,",
      "and anything unreviewed is clearly marked.",
    ],
    narration:
      "كل بطاقة تبيّن مصدرها، ومعها رابط إلى quran.com للتحقق. أربعة فحوص آلية تحرس النص والترجمة والمراجعة الشرعية؛ راجع الروابطَ داعيةٌ، وما لم يُراجَع يظهر عليه ذلك بوضوح.",
  },
  {
    id: "s7",
    seconds: 14,
    kind: "phone",
    clip: "clips/s7_journey.mp4",
    title: { en: "Ar-Rahman Journey · 7 stations", ar: "رحلة الرحمن · سبع محطات" },
    captions: ["The Ar-Rahman Journey walks through seven stations in the surah's order,", "a short path from noticing to reflecting."],
    narration: "ورحلة الرحمن سبع محطات بترتيب السورة، طريقٌ قصير من الانتباه إلى التدبّر.",
  },
  {
    id: "s8",
    seconds: 12,
    kind: "phone",
    clip: "clips/s8_english.mp4",
    title: { en: "Arabic · English", ar: "العربية · الإنجليزية" },
    captions: ["It works in Arabic and English,", "with an approved translation shown exactly as published."],
    narration: "ويعمل بالعربية والإنجليزية، مع ترجمة معتمدة تُعرض كما نُشرت.",
  },
  {
    id: "s9",
    seconds: 12,
    kind: "numbers",
    title: { en: "Measured, not claimed", ar: "قِسناه، ولم نكتفِ بالقول" },
    captions: [
      "We measured it: 88% correct or correctly abstained,",
      "97% consistent across runs,",
      "under two seconds, less than half a cent per photo.",
    ],
    narration:
      "وقِسناه: ثمانية وثمانون بالمئة إجابات صحيحة أو امتناع صحيح، وسبعة وتسعون بالمئة ثبات بين المرات، في أقل من ثانيتين، وبأقل من نصف سنت للصورة.",
  },
  {
    id: "s10",
    seconds: 7,
    kind: "end",
    captions: ["Built in three days for the AI Challenge.", "Try it on your phone."],
    narration: "بُني في ثلاثة أيام لتحدي الذكاء الاصطناعي في خدمة المحتوى الإسلامي. جرّبه على جوالك.",
  },
];

const frames = media as Record<string, number>;
/** Voice file for a scene, if generated (public/voice/<id>.mp3). */
export const voiceOf = (s: Scene) => (frames[`voice/${s.id}.mp3`] ? `voice/${s.id}.mp3` : null);
/** Scene length: the voice line plus a short breath, never shorter than the script's timing allows for reading. */
export const lengthOf = (s: Scene) => {
  const v = voiceOf(s);
  return v ? frames[v]! + Math.round(0.7 * FPS) : Math.round(s.seconds * FPS);
};
export const clipFrames = (clip?: string) => (clip ? frames[clip] ?? 0 : 0);
export const total = () => scenes.reduce((n, s) => n + lengthOf(s), 0);
