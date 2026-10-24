// Each project page, art-directed.
//
// Every project used to get the same page: the lead, the name under it,
// then the rest in pairs. That treats a concert, a print house and a
// feed of travel posts as the same kind of work. Here each one is set
// the way its own pictures ask to be.
//
// Four ways to open a page:
//   cross — the picture in the middle of the dark, the name run straight
//           across it in difference, so it turns negative where it
//           crosses the picture. For a single strong figure on black
//           (Atiye, the dancer, the hourglass).
//   split — the picture fills one half of the screen; the other half
//           carries the name in hollow type and what the studio did,
//           numbered. For a project with something to say.
//   bleed — the picture fills the screen and the name sits on it. For a
//           landscape that can hold type (a festival, a print house).
//   type  — the name alone, as wide as the page, and the pictures after
//           it. For work that already has type in it (the designed posts)
//           or that is all film.
//
// Then a sequence of blocks, written by hand for each project: which frame
// goes edge to edge, which two face each other, which one stands small
// and off-centre, where the films run as a strip. Each block says how far
// it stands from the one before (`gap`), so a page has runs and pauses
// instead of one even step.
//
// Every picture here is one already in the project (projects.ts), named by
// its path; nothing is added, and the captions shown are the project's own.

export type Gap = "none" | "md" | "lg";

export type Hero =
  | { kind: "cross"; src: string; /** Where the name crosses, % from the top. */ titleY?: number }
  | { kind: "split"; src: string; side: "left" | "right"; tone: "ink" | "paper"; pos?: string }
  | { kind: "bleed"; src: string; pos?: string; titleAt: "top" | "bottom" }
  | { kind: "type" };

export type Block = { gap?: Gap } & (
  /** Edge to edge, a screen tall. */
  | { t: "bleed"; src: string; pos?: string }
  /** The column's full width, at the picture's own shape. */
  | { t: "full"; src: string }
  /** Two side by side, sharing one shape. */
  | { t: "pair"; a: string; b: string }
  /** Three in a row. */
  | { t: "trio"; srcs: [string, string, string] }
  /** One large, one small and lifted, with its caption. */
  | { t: "offset"; big: string; small: string; flip?: boolean }
  /** One alone, at a chosen width and place. */
  | { t: "solo"; src: string; width: "sm" | "md" | "lg"; align: "left" | "center" | "right" }
  /** Vertical films as a strip. */
  | { t: "reels"; srcs: string[] }
  /** A picture beside what the studio was asked and did, numbered; or,
   * with no picture, the words alone. */
  | { t: "notes"; src?: string; side?: "left" | "right" }
  /** The name again, hollow, running off both edges. */
  | { t: "word" }
);

export interface Layout {
  hero: Hero;
  blocks: Block[];
}

const at = (dir: string) => (f: string) => `/media/${dir}/${f}`;

const kham = at("kham");
const atiye = at("atiye_konser");
const hp = at("happypilates");
const sff = at("sarajevo");
const naya = at("naya");
const sh = at("soulhaus");
const freya = at("freya");
const turta = at("turta");
const sargus = at("sargus");
const hi = at("holiday_inn");
const ab = at("arkadas_bas%C4%B1m");
const sushi = at("sushico");
const glass = at("glass");
const efs = at("efsense-travel");
const hop = at("hop_scooter");
const koz = at("koz");
const goat = at("goat_villas");
const hedo = at("hedonutopia");
const kd = at("kerala-dust");
const vm = at("villa-meze");

const LAYOUTS: Record<string, Layout> = {
  // Dark, slow, tactile. The candle being lit holds one half of the
  // screen; the other half says what the brand asked for. Then the desk
  // edge to edge, the boxes large and small, the films as a strip, the
  // name again, and it closes small: the seal and a tealight.
  kham: {
    hero: { kind: "split", src: kham("cover.jpg"), side: "left", tone: "ink" },
    blocks: [
      { t: "bleed", src: kham("studio-desk.jpg"), pos: "50% 62%", gap: "lg" },
      { t: "offset", big: kham("nese-box.jpg"), small: kham("huzur-box.jpg"), gap: "lg" },
      { t: "reels", srcs: [kham("kham_video_2.mp4"), kham("kham_video1.mp4"), kham("kham_konusma_4.mp4")], gap: "lg" },
      { t: "word", gap: "lg" },
      { t: "trio", srcs: [kham("orman-ritual.jpg"), kham("4.png"), kham("DSC08020.jpg")], gap: "md" },
      { t: "pair", a: kham("huzur-seal-detail.jpg"), b: kham("tealight-closing.jpg"), gap: "lg" },
    ],
  },

  // A concert: loud. The black-and-white frame in the middle of the dark
  // with the name straight through it, the way the reference did it. Then
  // blue light large against a small figure pointing out, the drum in
  // smoke edge to edge, and two to close.
  "atiye-konser": {
    hero: { kind: "cross", src: atiye("1.png"), titleY: 60 },
    blocks: [
      { t: "offset", big: atiye("3.png"), small: atiye("5.png"), gap: "lg" },
      { t: "bleed", src: atiye("4.png"), pos: "50% 62%", gap: "lg" },
      { t: "pair", a: atiye("2.png"), b: atiye("6.png"), gap: "md" },
    ],
  },

  // A band on stage, the closest thing on the site to the reference's own
  // subject, down to the pose: the guitarist in profile, head back, in the
  // middle of the dark with the name run through his chest. Then the stage
  // edge to edge through the smoke, the low angle large against the keys
  // small, and the singer at the mic beside the brief.
  hedonutopia: {
    hero: { kind: "cross", src: hedo("hedo-04-looking-up.jpg"), titleY: 58 },
    blocks: [
      { t: "bleed", src: hedo("hedo-03-stage.jpg"), pos: "60% 50%", gap: "lg" },
      { t: "offset", big: hedo("hedo-02-low-angle.jpg"), small: hedo("hedo-05-keys.jpg"), gap: "lg" },
      { t: "notes", src: hedo("hedo-01-mic.jpg"), side: "right", gap: "lg" },
    ],
  },

  // A rooftop show with a neon staircase behind the band and the city
  // below. The blue frame fills the screen and the name sits in its smoke.
  // Then magenta large against the one frame with the colour gone; the
  // keys in a flood of light edge to edge; two from the floor; the name
  // again; and the pink haze, with the crowd small beside it.
  "kerala-dust": {
    hero: { kind: "bleed", src: kd("kd-07-blue.jpg"), pos: "50% 30%", titleAt: "top" },
    blocks: [
      { t: "offset", big: kd("kd-02-fists.jpg"), small: kd("kd-06-mono.jpg"), gap: "lg" },
      { t: "bleed", src: kd("kd-03-keys.jpg"), pos: "60% 45%", gap: "lg" },
      { t: "pair", a: kd("kd-05-smoke.jpg"), b: kd("kd-04-wave.jpg"), gap: "md" },
      { t: "word", gap: "lg" },
      { t: "offset", big: kd("kd-08-haze.jpg"), small: kd("kd-01-crowd.jpg"), flip: true, gap: "lg" },
    ],
  },

  // The dancer on the dark ground is the one frame in the set that can
  // carry the name through it. After it, the studio and what was done;
  // the films; three of the class; the trophies against the black-and-white.
  "happy-pilates": {
    hero: { kind: "cross", src: hp("3.png"), titleY: 52 },
    blocks: [
      { t: "notes", src: hp("DSC07748.jpg"), side: "left", gap: "lg" },
      {
        t: "reels",
        srcs: [hp("Happy_Ak%C4%B1m3.mp4"), hp("training1.mp4"), hp("happypilates_sorucevap_1.mp4")],
        gap: "lg",
      },
      { t: "trio", srcs: [hp("4.png"), hp("6.png"), hp("10.png")], gap: "lg" },
      { t: "offset", big: hp("12.png"), small: hp("2.png"), flip: true, gap: "lg" },
      { t: "solo", src: hp("hp-reformer-split.webp"), width: "md", align: "right", gap: "lg" },
    ],
  },

  // A festival is wide: the red carpet fills the screen and the name sits
  // on its red. Then the city, the posters and the band; the name again;
  // the carpet edge to edge; arrivals in a run of three; and the evening.
  "sarajevo-film-festival": {
    hero: { kind: "bleed", src: sff("sff-08-white-dress.jpg"), pos: "50% 35%", titleAt: "bottom" },
    blocks: [
      { t: "pair", a: sff("sff-01-street.jpg"), b: sff("sff-02-box-office.jpg"), gap: "lg" },
      { t: "pair", a: sff("sff-04-posters.jpg"), b: sff("sff-06-band.jpg"), gap: "none" },
      { t: "notes", gap: "lg" },
      { t: "word", gap: "lg" },
      { t: "bleed", src: sff("sff-07-couple.jpg"), pos: "50% 40%", gap: "lg" },
      { t: "trio", srcs: [sff("sff-09-sunglasses.jpg"), sff("sff-10-trio.jpg"), sff("sff-11-arrivals.jpg")], gap: "md" },
      { t: "offset", big: sff("sff-03-interview.jpg"), small: sff("sff-05-reception.jpg"), gap: "lg" },
    ],
  },

  // The crimson soup is the loudest square in the set; it takes half the
  // screen. Then the film edge to edge, the dusk large against the tall
  // bar frame, three plates in a row and two to close.
  naya: {
    hero: { kind: "split", src: naya("naya-02-crimson.jpg"), side: "right", tone: "ink" },
    blocks: [
      { t: "bleed", src: naya("NAYA_VIDEO.mp4"), gap: "lg" },
      { t: "offset", big: naya("naya-06-dusk.jpg"), small: naya("naya-08-afterglow.jpg"), gap: "lg" },
      { t: "trio", srcs: [naya("naya-03-service.jpg"), naya("naya-07-signature.jpg"), naya("naya-05-golden.jpg")], gap: "lg" },
      { t: "pair", a: naya("naya-04-daylight.jpg"), b: naya("naya-01-arrival.jpg"), gap: "none" },
    ],
  },

  // Day into night. The pearls on red open it, on a paper half, the
  // sharpest contrast in the set. The afternoon (cocktails, the parasol,
  // matcha), then the pour edge to edge as the light goes, the night in
  // three, and the mat being rolled up last.
  soulhaus: {
    hero: { kind: "split", src: sh("DSC07837-web.jpg"), side: "left", tone: "paper" },
    blocks: [
      { t: "pair", a: sh("DSC01972.jpg"), b: sh("DSC02010.jpg"), gap: "lg" },
      { t: "solo", src: sh("soulhaus-smoke-hand.webp"), width: "sm", align: "left", gap: "md" },
      { t: "offset", big: sh("2.png"), small: sh("DSC06814.jpg"), flip: true, gap: "lg" },
      { t: "bleed", src: sh("4%20(2).png"), pos: "50% 38%", gap: "lg" },
      { t: "trio", srcs: [sh("1.png"), sh("DSC01563.jpg"), sh("DSC00879.jpg")], gap: "md" },
      { t: "solo", src: sh("DSC06805.jpg"), width: "sm", align: "right", gap: "lg" },
    ],
  },

  // The granola from above, edge to edge, hard shadow and all. Then the
  // chili oil beside the brief, the four films as a strip, three plates,
  // and the omelette to close.
  "freya-gurme": {
    hero: { kind: "bleed", src: freya("DSC02467.jpg"), pos: "50% 50%", titleAt: "bottom" },
    blocks: [
      { t: "notes", src: freya("13.png"), side: "right", gap: "lg" },
      {
        t: "reels",
        srcs: [
          freya("OMLET_VRS2.mp4"),
          freya("FREYA_SORUCEVAP_V2.mp4"),
          freya("freya_thelog_sonversiyon.mp4"),
          freya("freya_log_burger_2.mp4"),
        ],
        gap: "lg",
      },
      { t: "trio", srcs: [freya("1.png"), freya("17.png"), freya("5.png")], gap: "lg" },
      { t: "bleed", src: freya("DSC04685.jpg"), gap: "lg" },
    ],
  },

  // The tart alone on black: the name above it in the dark. The house and
  // what was done; breakfast large with the oven small; the cheesecake
  // under the bougainvillea edge to edge, the garden's colour at full
  // size; the lattice tarts beside the chocolate cake; the savoury tart
  // small to close.
  "turta-home-cafe": {
    hero: { kind: "bleed", src: turta("turta-01-signature.jpg"), pos: "50% 55%", titleAt: "top" },
    blocks: [
      { t: "notes", src: turta("turta-06-facade.jpg"), side: "left", gap: "lg" },
      { t: "offset", big: turta("turta-02-morning.jpg"), small: turta("turta-03-oven.jpg"), gap: "lg" },
      { t: "bleed", src: turta("turta-07-cheesecake.webp"), pos: "50% 58%", gap: "lg" },
      { t: "pair", a: turta("turta-08-lattice.webp"), b: turta("turta-05-chocolate.jpg"), gap: "md" },
      { t: "solo", src: turta("turta-04-table.jpg"), width: "sm", align: "right", gap: "md" },
    ],
  },

  // Gold letters on white marble: the paper half. Then the counter in a
  // row of three, the meze bowl large with the two to go small, the name,
  // and the drip beside the picnic bag to close.
  "villa-meze": {
    hero: { kind: "split", src: vm("vm-01-sign.jpg"), side: "left", tone: "paper" },
    blocks: [
      { t: "trio", srcs: [vm("vm-02-cigkofte.jpg"), vm("vm-03-potatoes.jpg"), vm("vm-05-tray.jpg")], gap: "lg" },
      { t: "offset", big: vm("vm-07-meze-bowl.jpg"), small: vm("vm-04-bowls.jpg"), gap: "lg" },
      { t: "word", gap: "lg" },
      { t: "pair", a: vm("vm-06-drip.jpg"), b: vm("vm-08-bag.jpg"), gap: "lg" },
    ],
  },

  // White tablecloths: the paper half belongs here. Mid-bite on the right,
  // the room edge to edge, then two offset pairs, one each way.
  sargus: {
    hero: { kind: "split", src: sargus("sargus-05-dining-moment.jpg"), side: "right", tone: "paper" },
    blocks: [
      { t: "bleed", src: sargus("sargus-01-interior.jpg"), pos: "50% 55%", gap: "lg" },
      { t: "offset", big: sargus("sargus-04-serving.jpg"), small: sargus("sargus-06-afterimage.jpg"), gap: "lg" },
      { t: "offset", big: sargus("sargus-03-table-setting.jpg"), small: sargus("sargus-02-mirror-detail.jpg"), flip: true, gap: "md" },
    ],
  },

  // One photograph and four reels: the tray takes half the screen beside
  // the name and the agency, and the reels run as one strip.
  "holiday-inn-kavaklidere": {
    hero: { kind: "split", src: hi("breakfast-tray.jpg"), side: "left", tone: "ink" },
    blocks: [
      {
        t: "reels",
        srcs: [
          hi("MIRENO_HOLIDAY_INN_REEL_6.mp4"),
          hi("HOLIDAY_HAZIRAN_REEL2.mp4"),
          hi("HOLIDAY_HAZIRAN_REEL6.mp4"),
          hi("HOLIDAY_HAZIRAN_REEL10.mp4"),
        ],
        gap: "lg",
      },
    ],
  },

  // A print house, and red ink being mixed: the accent of the whole site,
  // found in their own shop. The press beside the brief, two at work, the
  // magazines edge to edge, three of the line, one more to close.
  "arkadas-basim": {
    hero: { kind: "bleed", src: ab("DSC01232.jpg"), pos: "50% 45%", titleAt: "bottom" },
    blocks: [
      { t: "notes", src: ab("DSC00929.jpg"), side: "left", gap: "lg" },
      { t: "pair", a: ab("DSC01102.jpg"), b: ab("DSC00945.jpg"), gap: "lg" },
      { t: "bleed", src: ab("DSC01269.jpg"), gap: "lg" },
      { t: "trio", srcs: [ab("DSC01060.jpg"), ab("DSC01040.jpg"), ab("DSC01272.jpg")], gap: "md" },
      { t: "solo", src: ab("DSC00954.jpg"), width: "lg", align: "left", gap: "lg" },
    ],
  },

  // Three frames. The koi mural edge to edge; the room beside the brief;
  // the corner small, off to the right.
  sushico: {
    hero: { kind: "bleed", src: sushi("sushico-02-rhythm.jpg"), pos: "50% 50%", titleAt: "bottom" },
    blocks: [
      { t: "notes", src: sushi("sushico-01-room.jpg"), side: "right", gap: "lg" },
      { t: "solo", src: sushi("sushico-03-facade.jpg"), width: "md", align: "left", gap: "lg" },
    ],
  },

  // Collages with their own type on them: nothing goes over them. The name
  // first, then the sunset at full width, the poster beside the brief, two
  // collages side by side, and the last one with the film.
  glass: {
    hero: { kind: "type" },
    blocks: [
      { t: "full", src: glass("glass-rhythm.jpg"), gap: "md" },
      { t: "notes", src: glass("glass-hero.jpg"), side: "left", gap: "lg" },
      { t: "pair", a: glass("glass-cliff.jpg"), b: glass("glass-bodrum.jpg"), gap: "lg" },
      { t: "offset", big: glass("glass-padel.jpg"), small: glass("glass_bosphorus_etkinlik_v1.mp4"), gap: "md" },
    ],
  },

  // Designed posts for a feed: set as a feed. The name, the two widest
  // scenes large, then the rest three to a row, and the closing question
  // beside the brief.
  "efsense-travel": {
    hero: { kind: "type" },
    blocks: [
      { t: "pair", a: efs("efs-01-journey.webp"), b: efs("efs-03-window.webp"), gap: "md" },
      { t: "trio", srcs: [efs("efs-02-who-we-are.webp"), efs("efs-04-boutique-tours.webp"), efs("efs-05-tuscany.webp")], gap: "none" },
      { t: "trio", srcs: [efs("efs-06-mice.webp"), efs("efs-07-impact.webp"), efs("efs-08-this-moment.webp")], gap: "none" },
      { t: "notes", src: efs("efs-09-next-story.webp"), side: "right", gap: "lg" },
    ],
  },

  // Sunny, quick, all portrait: the name and straight into a run of
  // three, then two.
  "hop-scooter": {
    hero: { kind: "type" },
    blocks: [
      { t: "trio", srcs: [hop("hop-03-solo.jpg"), hop("hop-07-pair.jpg"), hop("hop-04-peace.jpg")], gap: "md" },
      { t: "pair", a: hop("hop-06-coffee.jpg"), b: hop("hop-hero.jpg"), gap: "none" },
      { t: "notes", gap: "lg" },
    ],
  },

  // Three letters as wide as the page, then the two films side by side,
  // and what the teaser was for, in words alone.
  koz: {
    hero: { kind: "type" },
    blocks: [
      { t: "reels", srcs: [koz("KOZ_COMINGSOON_V1.mp4"), koz("KOZ_COMINGSOON_V2.mp4")], gap: "md" },
      { t: "notes", gap: "lg" },
    ],
  },

  // G9 opens on an hourglass in the dark — the reference's circle, found
  // in the film itself. The name crosses at its neck; the other two films
  // follow.
  "goat-villas": {
    hero: { kind: "cross", src: goat("G9.mp4"), titleY: 52 },
    blocks: [
      { t: "reels", srcs: [goat("G7.mp4"), goat("G3.mp4")], gap: "lg" },
      { t: "notes", gap: "lg" },
    ],
  },
};

export function getLayout(slug: string): Layout | undefined {
  return LAYOUTS[slug];
}

/** Every path a layout names, for checking against the project data. */
export function layoutSources(l: Layout): string[] {
  const out: string[] = [];
  if (l.hero.kind !== "type") out.push(l.hero.src);
  for (const b of l.blocks) {
    if (b.t === "bleed" || b.t === "full" || b.t === "solo") out.push(b.src);
    else if (b.t === "notes" && b.src) out.push(b.src);
    else if (b.t === "pair") out.push(b.a, b.b);
    else if (b.t === "trio" || b.t === "reels") out.push(...b.srcs);
    else if (b.t === "offset") out.push(b.big, b.small);
  }
  return out;
}
