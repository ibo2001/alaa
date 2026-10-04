export type Lang = "ar" | "en";
export type Stage = "new" | "familiar"; // chosen by the user, never inferred

export type Concept = {
  id: string;
  labels: Record<Lang, string>;
  aliases?: string[];
  /** false = never offered to the vision model (e.g. concepts that would require describing people). */
  recognizable?: boolean;
  /** A more general concept for the same object (e.g. drinking_water → water); never counted as a second object. */
  broader?: string;
};

export type VerseRef = { surah: number; ayah: number; ayahEnd?: number };

export type ReviewStatus = "draft" | "reviewed";

export type Blessing = {
  id: string;
  concept: string;
  /** Other concept ids that open this blessing (e.g. "palm_tree" for dates and palms). Part of the level 3 mapping. */
  relatedConcepts?: string[];
  labels: Record<Lang, string>;
  verses: VerseRef[];
  translations: { lang: Lang; source: string }[];
  reflection?: Partial<Record<Stage, Partial<Record<Lang, string>>>>;
  tafsirRef?: { book: string; volume?: number; page?: number };
  journeyStation?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Why this entry is the way it is (decisions, interim choices). Not shown to users. */
  note?: string;
  review: {
    mapping: ReviewStatus;
    reflection: ReviewStatus;
    reviewer?: string;
    reviewedAt?: string;
  };
};

export type BlessingsFile = {
  abstention: { verses: VerseRef[]; review: Blessing["review"] };
  refrain: { verses: VerseRef[] };
  blessings: Blessing[];
};
