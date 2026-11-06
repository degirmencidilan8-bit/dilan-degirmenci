// The homepage after the opening: a few projects, each set its own way —
// one picture across the whole screen, a photograph beside its film, two
// portraits, a short film — the way a magazine lays out a feature. Drawn
// by components/EditorialFlow. (The tunnel it replaced is BrandTunnel;
// page.tsx chooses between them.)
//
// A FIRST DRAFT (Claude, 2026-11-06), for Dilan and Batu to go over: which
// projects, in what order, with which pictures. Every word shown comes
// from the project's own data (title, disciplines, the captions already
// on its pictures); nothing is written here.
//
// Resolution: a picture shown across the whole screen ("lead") needs a
// file at least 2400px wide. The others are set at half the screen or
// less, where the 1365–2048px files hold up.

export type FlowImage = { src: string; ratio: string; pos?: string };
export type FlowFilm = { src: string; ratio: string; poster?: string };

export type FlowBlock =
  /** One picture across the whole screen. */
  | { kind: "lead"; slug: string; image: FlowImage }
  /** A photograph beside a film of the same work; `flip` puts the film first. */
  | { kind: "duo"; slug: string; image: FlowImage; film: FlowFilm; flip?: boolean }
  /** Two pictures side by side. */
  | { kind: "pair"; slug: string; images: [FlowImage, FlowImage] }
  /** A film, wide. */
  | { kind: "film"; slug: string; film: FlowFilm };

export const HOME_FLOW: FlowBlock[] = [
  {
    kind: "lead",
    slug: "kerala-dust",
    image: { src: "/media/kerala-dust/kd-01-crowd.jpg", ratio: "3:2" },
  },
  {
    kind: "duo",
    slug: "soulhaus",
    image: { src: "/media/soulhaus/DSC07837.JPG", ratio: "2:3" },
    film: { src: "/media/soulhaus/sh-cugi-3.mp4", ratio: "9:16", poster: "/media/soulhaus/sh-cugi-3-still.jpg" },
  },
  {
    kind: "pair",
    slug: "kham",
    images: [
      { src: "/media/kham/DSC08020.jpg", ratio: "2:3" },
      { src: "/media/kham/huzur-box.jpg", ratio: "2:3" },
    ],
  },
  {
    kind: "film",
    slug: "naya",
    film: { src: "/media/naya/NAYA_VIDEO.mp4", ratio: "16:9", poster: "/media/naya/naya-01-arrival.jpg" },
  },
  {
    kind: "duo",
    slug: "holiday-inn-kavaklidere",
    flip: true,
    image: { src: "/media/holiday_inn/breakfast-tray.jpg", ratio: "1:1" },
    film: { src: "/media/holiday_inn/MIRENO_HOLIDAY_INN_REEL_6.mp4", ratio: "9:16" },
  },
];
