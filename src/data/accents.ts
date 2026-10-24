// One colour per project, and not one I chose.
//
// The brief asked for an accent that feels like a detail coming out of the
// project rather than a label stuck on it, so each of these was measured
// from that project's own cover: pixels weighted by how colourful they
// are, bucketed by hue, and the winning hue pulled into a range that can
// actually be used as a mark — never pastel, never neon, never so dark it
// reads as black.
//
// ATIYE has no entry. Its cover is black and white, so there is no colour
// in it to take; inventing one would be exactly the thing this file exists
// to avoid. A project without an accent simply uses the paper colour.
const ACCENTS: Record<string, string> = {
  glass: "#de8c51",
  soulhaus: "#c1b529",
  "freya-gurme": "#d29061",
  kham: "#bf692c",
  "happy-pilates": "#cb7052",
  naya: "#5780ba",
  sargus: "#ca6721",
  "hop-scooter": "#5986c4",
  "turta-home-cafe": "#ca2f21",
  sushico: "#e4c158",
  "arkadas-basim": "#4986b2",
};

export function accentFor(slug: string): string | undefined {
  return ACCENTS[slug];
}
