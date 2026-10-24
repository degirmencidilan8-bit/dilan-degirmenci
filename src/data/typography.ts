// Thirteen projects, one typeface, thirteen tones.
//
// Archivo is variable on width (62–125) and weight (100–900). Those two
// numbers, plus tracking, are the whole per-project system — no second
// display face, no per-project colour, no per-project motion. A project's
// character is a static property of its type, which is why the site still
// reads as one thing when you move between them.
//
// The house setting is narrow and heavy. A project moves off it only when
// its work genuinely asks for something else.
export interface TypeDial {
  /** Archivo width axis, 62 (condensed) – 125 (extended). */
  wdth: number;
  /** Archivo weight axis, 100 – 900. */
  wght: number;
  /** Letter-spacing at display size. */
  track: string;
}

export const HOUSE_TYPE: TypeDial = { wdth: 68, wght: 800, track: "-0.03em" };

const PROJECT_TYPE: Record<string, TypeDial> = {
  // Quiet, tactile, unhurried. The only project that steps all the way
  // back: light, wide and letterspaced open where everything else is
  // narrow and black. Restraint is its character, so the system has to be
  // able to whisper, not only shout.
  //
  // (Case is not one of the dials. Titles are stored uppercase, and
  // deriving title case from them would mis-set Turkish names — BASIM
  // would come back as Basim, not Basım.)
  kham: { wdth: 108, wght: 300, track: "0.04em" },

  // Social and rhythmic — the tightest, heaviest setting on the site.
  soulhaus: { wdth: 62, wght: 900, track: "-0.045em" },

  // Motion-led and technical. Not heavy: wide-tracked and mid-weight, the
  // way a spec sheet is set.
  glass: { wdth: 92, wght: 600, track: "0.14em" },

  // Digital and graphic.
  "efsense-travel": { wdth: 64, wght: 900, track: "-0.035em" },

  // A print house. Set like a colophon: steady, mid-width, not loud.
  "arkadas-basim": { wdth: 84, wght: 600, track: "-0.01em" },

  // Movement and discipline — upright and even.
  "happy-pilates": { wdth: 88, wght: 700, track: "-0.02em" },

  // A concert. Loud, and the only other project as tight as Soulhaus.
  "atiye-konser": { wdth: 62, wght: 900, track: "-0.04em" },

  // Another concert, set apart from Atiye by width: wider, still black.
  hedonutopia: { wdth: 80, wght: 900, track: "-0.03em" },

  // The third concert, and the widest: neon and open sky, set extended.
  "kerala-dust": { wdth: 112, wght: 800, track: "-0.02em" },
};

export function typeDial(slug: string): TypeDial {
  return PROJECT_TYPE[slug] ?? HOUSE_TYPE;
}

/** The inline custom properties the `.display` class reads. */
export function dialStyle(d: TypeDial): React.CSSProperties {
  return {
    ["--dw" as string]: String(d.wdth),
    ["--dg" as string]: String(d.wght),
    ["--dt" as string]: d.track,
  };
}
