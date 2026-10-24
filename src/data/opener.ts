import manifest from "./image-manifest.json";
import { filmSub, getFilmBySlug } from "./films";
import { getProjectBySlug } from "./projects";

// The opening reel: the first screen of the site. One large frame in the
// middle of the dark, cutting hard through the work, with the studio's
// name run across it. The same move as the project pages that open on a
// single figure (Atiye, Hedonutopia), so the site opens the way its pages
// do.
//
// The frame is 4:5 on every screen, and the name crosses its middle, so a
// picture here holds one subject near the centre and carries no type of
// its own. The order is the edit: each cut changes the light and the
// colour, so the run reads as cuts, not as a slideshow of one mood.

export interface ReelFrame {
  src: string;
  /** Where the frame holds when it is cut to the reel's shape. */
  pos?: string;
  href: string;
  title: string;
  sub: string;
}

type Cut = { work: string; src: string; pos?: string } | { film: string; src: string; pos?: string };

// The frames are the studio's own pick (2026-10-24), twelve across the
// work; the order is set here: dark against light, warm against cold, a
// figure, then a hand, then a table.
const CUT: Cut[] = [
  // The stage, black and white — pointing out.
  { work: "atiye-konser", src: "/media/atiye_konser/5.png" },
  // White on white — the pavlova handed across.
  { work: "freya-gurme", src: "/media/freya/1.png" },
  // The match to the tealight, amber in the dark.
  { work: "kham", src: "/media/kham/tealight-closing.jpg", pos: "50% 55%" },
  // Full daylight by the lake.
  { work: "hop-scooter", src: "/media/hop_scooter/hop-07-pair.jpg", pos: "50% 30%" },
  // Oil poured at a black table.
  { work: "naya", src: "/media/naya/naya-03-service.jpg", pos: "42% 50%" },
  // Lattice tarts, close and warm.
  { work: "turta-home-cafe", src: "/media/turta/turta-08-lattice.webp" },
  // Red ink in a cold machine.
  { work: "arkadas-basim", src: "/media/arkadas_bas%C4%B1m/DSC01232.jpg", pos: "56% 50%" },
  // Four cocktails in the sun.
  { work: "soulhaus", src: "/media/soulhaus/DSC01972.jpg", pos: "50% 55%" },
  // A plate at dusk, the city behind.
  { work: "naya", src: "/media/naya/naya-05-golden.jpg", pos: "50% 70%" },
  // Smoke off the glass, backlit, in hand.
  { work: "soulhaus", src: "/media/soulhaus/soulhaus-smoke-hand.webp" },
  // One leg to the ceiling.
  { work: "happy-pilates", src: "/media/happypilates/hp-reformer-split.webp", pos: "50% 40%" },
  // The drip, against white blossom.
  { work: "villa-meze", src: "/media/villa-meze/vm-06-drip.jpg" },
];

const ENTRIES = manifest as Record<string, unknown>;
const known = (src: string) => {
  try {
    return decodeURIComponent(src) in ENTRIES;
  } catch {
    return src in ENTRIES;
  }
};

/** The reel, checked against the site's data: a frame whose picture is
 * not part of its project or film is left out rather than shown broken. */
export function getReel(): ReelFrame[] {
  return CUT.flatMap((c): ReelFrame[] => {
    if (!known(c.src)) return [];
    if ("film" in c) {
      const f = getFilmBySlug(c.film);
      if (!f?.poster) return [];
      const stem = f.poster.replace(/-\d+\.jpg$/, "-");
      if (!c.src.startsWith(stem)) return [];
      return [{ src: c.src, pos: c.pos, href: `/films/${f.slug}`, title: f.title, sub: filmSub(f) }];
    }
    const p = getProjectBySlug(c.work);
    if (!p) return [];
    const has =
      p.coverImage.src === c.src || p.gallery.some((m) => m.src === c.src) || (p.stills ?? []).includes(c.src);
    if (!has) return [];
    return [{ src: c.src, pos: c.pos, href: `/work/${p.slug}`, title: p.title, sub: p.disciplines.join(" / ") }];
  });
}
