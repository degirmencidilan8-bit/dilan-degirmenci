// Project pages as magazine features.
//
// Photography is set on paper and film on the screen: a photographed
// project opens like a feature in a printed magazine — a spread with the
// title on the left page and the picture on the right, a standfirst, then
// the pictures in a deliberate rhythm of scales with numbered captions, a
// pull quote, the credits, and the next feature waiting at the foot. Films
// keep their dark page.
//
// Each feature's sequence is written by hand below, block by block. It is
// an edit, not a template: which frame goes full-bleed, which sits small in
// a field of paper, which two face each other, where the quote breaks the
// run. A project without an entry here keeps the plain project page until
// one is written.
//
// Every caption, quote and fact comes from the project's own data
// (projects.ts, colophons.ts). Nothing here is written for it.

/** Columns on a 12-column grid, 1-based and inclusive, desktop only; on a
 * phone every block is one column. */
type Span = [number, number];

export type FeatureBlock =
  /** Edge to edge and a full screen tall, cropped at the sides. */
  | { type: "bleed"; src: string; pos?: string }
  /** One frame placed on the grid, its caption in the margin beside it. */
  | { type: "image"; src: string; span: Span; caption?: "left" | "right" | "below"; capSpan?: Span }
  /** Two frames facing each other, one lifted out of line. */
  | { type: "pair"; a: string; b: string; spanA: Span; spanB: Span; lift?: "a" | "b" }
  /** The project's own line, set large. */
  | { type: "quote" }
  /** Short films side by side, playing while on screen. */
  | { type: "films"; srcs: string[]; span: Span }
  /** What was done and what came of it, in the studio's words. */
  | { type: "notes" };

export interface Feature {
  /** Where the cover crop holds. */
  coverPos?: string;
  /** The pull quote: a line the client already published, never one
   * written for them. Without it the quote block falls back to the
   * colophon's short line. */
  quote?: { text: string; by: string };
  blocks: FeatureBlock[];
}

const FEATURES: Record<string, Feature> = {
  // KHAM's paper feature was tried and rejected (2026-10-23): too quiet,
  // too polite for a site that promises brutal and cinematic. Empty until
  // a feature in the site's own voice is written.
};

export function getFeature(slug: string): Feature | undefined {
  return FEATURES[slug];
}

/** Slugs that have a feature — their pages are set on paper. */
export const FEATURE_SLUGS = new Set(Object.keys(FEATURES));
