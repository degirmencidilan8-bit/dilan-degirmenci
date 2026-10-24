import type { Film } from "./types";

// Long-form video work — national-brand campaign films and event/stage
// coverage, not boutique brand shoots. Titles are read straight from the
// delivered filenames; year and any credit are left blank until confirmed
// — do not invent them.
//
// `poster` is a frame grabbed from each film's own footage — chosen by
// looking at twenty-four evenly spaced frames from each — so that wherever
// a film is listed it shows a picture from itself rather than a title on
// black. They live in public/media/stills.
//
// `src` points at web-compressed copies (H.264, CRF 24, ≤2.5 Mbps, 1080p,
// faststart; 2026-10-24). The full-size exports are kept locally in
// media-originals/ at the same relative paths, outside git and the deploy.
export const films: Film[] = [
  {
    slug: "gustav",
    title: "GUSTAV",
    type: "Campaign Film",
    year: "",
    src: "/media/backstage/GUSTAV_30SN_VERS.mp4",
    ratio: "16:9",
    poster: "/media/stills/gustav-0.jpg",
  },
  {
    slug: "royal-canin-igneada",
    title: "ROYAL CANIN — İĞNEADA",
    type: "Event Coverage",
    year: "",
    src: "/media/backstage/ROYALCANIN_IGNEADA_ETKINLIK_V2.mp4",
    ratio: "16:9",
    poster: "/media/stills/royal-canin-igneada-0.jpg",
  },
  {
    slug: "trendyol-eurovision",
    title: "TRENDYOL — EUROVISION",
    type: "Behind the Scenes",
    role: "Editing",
    year: "",
    src: "/media/backstage/TRENDYOL_EUROV_BTS_4.mp4",
    ratio: "16:9",
    poster: "/media/stills/trendyol-eurovision-1.jpg",
  },
  {
    slug: "flormar",
    title: "FLORMAR — HANDE ERÇEL",
    type: "Behind the Scenes",
    role: "Editing",
    year: "",
    src: "/media/backstage/FLORMAR_BTS_V4.mp4",
    // Measured 2046x1080 — a touch wider than 16:9; the frame crops a few
    // pixels off each side.
    ratio: "16:9",
    poster: "/media/stills/flormar-0.jpg",
  },
  {
    slug: "disney-ansizin",
    title: "DISNEY — ANSIZIN",
    type: "Behind the Scenes",
    role: "Editing",
    year: "",
    src: "/media/backstage/DISNEY_ANSIZIN_BTS_V4.mp4",
    ratio: "16:9",
    poster: "/media/stills/disney-ansizin-0.jpg",
  },
  {
    slug: "neova",
    title: "NEOVA",
    type: "Behind the Scenes",
    role: "Editing",
    year: "",
    src: "/media/backstage/NEOVA_BTS_V1_YUKSEK.mp4",
    ratio: "16:9",
    poster: "/media/stills/neova-0.jpg",
  },
  {
    slug: "ipana",
    title: "İPANA",
    type: "Behind the Scenes",
    role: "Editing",
    year: "",
    src: "/media/backstage/IPANA_BTS_V1.mp4",
    ratio: "16:9",
    poster: "/media/stills/ipana-0.jpg",
  },
  {
    slug: "got2be",
    title: "GOT2BE",
    type: "Behind the Scenes",
    role: "Editing",
    year: "",
    src: "/media/backstage/GOT2BE_BTS_V3.mp4",
    // Vertical, measured 1080x1920.
    ratio: "9:16",
    poster: "/media/stills/got2be-0.jpg",
  },
  {
    slug: "felipe-massa-goturkiye",
    // Stored already uppercase, like every other title here. It has to be:
    // CSS `text-transform: uppercase` on a page whose lang is "en" turns
    // the i of GoTürkiye into a dotless I, not İ.
    title: "FELIPE MASSA — GOTÜRKİYE",
    type: "Behind the Scenes",
    role: "Editing",
    year: "",
    src: "/media/backstage/Felipe_Massa_GoTurkiye_BTS_V1.mp4",
    // The only vertical film here — measured 1080x1920, not the 16:9 the
    // rest of this list is. Tagging it 16:9 would have cropped the frame
    // to a letterbox slot and thrown most of the picture away.
    ratio: "9:16",
    poster: "/media/stills/felipe-massa-goturkiye-1.jpg",
  },
  {
    slug: "arkadas-basim",
    title: "ARKADAŞ BASIM",
    type: "Company Film",
    year: "2026",
    src: "/media/arkadas_bas%C4%B1m/Arkada%C5%9FBas%C4%B1m%20Genel%20Tan%C4%B1t%C4%B1m%20Son.mp4",
    ratio: "16:9",
    poster: "/media/stills/arkadas-basim-film-1.jpg",
  },
];

/** The one line a film is listed under: its type, and the studio's part
 * when that was only the edit ("Behind the Scenes / Editing"). */
export function filmSub(f: Film): string {
  return [f.type, f.role].filter(Boolean).join(" / ");
}

export function getFilmBySlug(slug: string): Film | undefined {
  return films.find((f) => f.slug === slug);
}
