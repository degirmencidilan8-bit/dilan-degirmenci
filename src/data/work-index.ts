import { filmSub, films } from "./films";
import { NO_PHOTOS_YET, getProjectBySlug, projects } from "./projects";

// The Work index: every film and every photographed project in one grid,
// each shown by a single frame cut to 16:9.
//
// The frames are chosen, not defaulted. A project's cover was picked as its
// quietest picture for a band that no longer exists; in a grid of thirty
// rectangles the frame has to carry the whole project at the size of a
// thumbnail and survive a 16:9 crop. `pos` is where the crop holds — a
// portrait cut to a wide frame keeps the face, not the floor.

export type Kind = "film" | "photography";

export interface IndexItem {
  key: string;
  href: string;
  title: string;
  /** One line under the title: the film's type, or the disciplines. */
  sub: string;
  kind: Kind;
  img: string;
  pos?: string;
}

const PROJECT_FRAME: Record<string, { img: string; pos?: string }> = {
  kham: { img: "/media/kham/orman-ritual.jpg", pos: "50% 55%" },
  "atiye-konser": { img: "/media/atiye_konser/3.png", pos: "50% 28%" },
  "arkadas-basim": { img: "/media/arkadas_basım/DSC01060.jpg" },
  soulhaus: { img: "/media/soulhaus/DSC01563.jpg", pos: "50% 45%" },
  naya: { img: "/media/naya/naya-07-signature.jpg" },
  "happy-pilates": { img: "/media/happypilates/3.png", pos: "50% 38%" },
  sargus: { img: "/media/sargus/sargus-02-mirror-detail.jpg" },
  "turta-home-cafe": { img: "/media/turta/turta-01-signature.jpg" },
  "freya-gurme": { img: "/media/freya/DSC02467.jpg" },
  sushico: { img: "/media/sushico/sushico-02-rhythm.jpg" },
  glass: { img: "/media/glass/glass-rhythm.jpg" },
  "hop-scooter": { img: "/media/hop_scooter/hop-07-pair.jpg", pos: "50% 40%" },
  // A frame from its own film: the logo in the fire.
  koz: { img: "/media/koz/still-0.jpg", pos: "50% 41%" },
  "holiday-inn-kavaklidere": { img: "/media/holiday_inn/breakfast-tray.jpg", pos: "50% 45%" },
  // The one frame of the set with no type on it: the aircraft window.
  "efsense-travel": { img: "/media/efsense-travel/efs-03-window.webp", pos: "50% 22%" },
  // Already 16:9: the singer at the mic.
  hedonutopia: { img: "/media/hedonutopia/hedo-01-mic.jpg", pos: "50% 40%" },
  // The keys in a flood of blue light, the neon stair above.
  "kerala-dust": { img: "/media/kerala-dust/kd-03-keys.jpg", pos: "50% 40%" },
  // Portrait, so the 16:9 cut holds on the gold letters.
  "villa-meze": { img: "/media/villa-meze/vm-01-sign.jpg", pos: "50% 42%" },
  // A frame from G9: the neck of the hourglass.
  "goat-villas": { img: "/media/goat_villas/still-0.jpg", pos: "50% 50%" },
};

/** Where a vertical film's poster holds when it is cut to the grid's 16:9:
 * on the face, not the middle of the frame. */
const FILM_POS: Record<string, string> = {
  got2be: "50% 15%",
};

/** The order of the grid. Strongest first, and the studio's own work
 * leads: the films where its part was only the edit are spread through
 * the run, never stacked at the top, so the first names a visitor opens
 * are wholly its own. Films and photographs interleaved. */
export const ORDER: { kind: Kind; slug: string }[] = [
  { kind: "photography", slug: "kham" },
  { kind: "film", slug: "gustav" },
  { kind: "photography", slug: "sarajevo-film-festival" },
  { kind: "film", slug: "flormar" },
  { kind: "photography", slug: "atiye-konser" },
  { kind: "photography", slug: "naya" },
  { kind: "film", slug: "disney-ansizin" },
  { kind: "photography", slug: "soulhaus" },
  { kind: "photography", slug: "holiday-inn-kavaklidere" },
  { kind: "film", slug: "trendyol-eurovision" },
  { kind: "photography", slug: "hedonutopia" },
  { kind: "photography", slug: "arkadas-basim" },
  { kind: "film", slug: "arkadas-basim" },
  { kind: "photography", slug: "koz" },
  { kind: "film", slug: "got2be" },
  { kind: "photography", slug: "efsense-travel" },
  { kind: "photography", slug: "freya-gurme" },
  { kind: "film", slug: "royal-canin-igneada" },
  { kind: "photography", slug: "happy-pilates" },
  { kind: "photography", slug: "kerala-dust" },
  { kind: "photography", slug: "glass" },
  { kind: "film", slug: "felipe-massa-goturkiye" },
  { kind: "photography", slug: "goat-villas" },
  { kind: "photography", slug: "sargus" },
  { kind: "film", slug: "neova" },
  { kind: "photography", slug: "turta-home-cafe" },
  { kind: "film", slug: "ipana" },
  { kind: "photography", slug: "villa-meze" },
  { kind: "photography", slug: "hop-scooter" },
  { kind: "photography", slug: "sushico" },
];

export function getWorkIndex(): IndexItem[] {
  return ORDER.flatMap(({ kind, slug }): IndexItem[] => {
    if (kind === "film") {
      const f = films.find((x) => x.slug === slug);
      if (!f || !f.poster) return [];
      return [
        {
          key: `film-${slug}`,
          href: `/films/${slug}`,
          title: f.title,
          sub: filmSub(f),
          kind,
          img: f.poster,
          pos: FILM_POS[slug],
        },
      ];
    }
    const p = getProjectBySlug(slug);
    if (!p || NO_PHOTOS_YET.has(slug)) return [];
    const frame = PROJECT_FRAME[slug] ?? { img: p.coverImage.src };
    return [
      {
        key: `project-${slug}`,
        href: `/work/${slug}`,
        title: p.title,
        sub: p.disciplines.join(" / "),
        kind,
        ...frame,
      },
    ];
  });
}

/** The frame a project is represented by in the index — also what the
 * "next" panel at the foot of a feature shows. */
export function frameFor(slug: string): { img: string; pos?: string } | undefined {
  const own = PROJECT_FRAME[slug];
  if (own) return own;
  const p = getProjectBySlug(slug);
  return p ? { img: p.coverImage.src } : undefined;
}

/** Projects in index order — what "more work" on a project page offers. */
export function projectsInOrder() {
  return ORDER.filter((o) => o.kind === "photography")
    .map((o) => projects.find((p) => p.slug === o.slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && !NO_PHOTOS_YET.has(p!.slug));
}
