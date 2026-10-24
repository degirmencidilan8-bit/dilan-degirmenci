import type { Project } from "./types";

// Single source of truth for every project. Add new work by appending an
// entry here — no page code needs to change.
//
// Fields left blank on purpose (description, credits, agency, gallery
// captions, ARKADAŞ BASIM's year) are not invented — fill them in as the
// real information comes in. Every `src` below is a temporary path; drop
// the real file in at the same path (or update `src`) once it exists —
// `Media` renders it automatically and only falls back to a placeholder
// while the file is still missing.
export const projects: Project[] = [
  {
    title: "GLASS APP",
    slug: "glass",
    year: "2026",
    disciplines: ["Motion Design", "Editing"],
    description: "",
    // Real GLASS set (8 files). The three 720p clips (community, connect,
    // support — 0.5–1.5MB each) are left out: well below the 1080p of every
    // other film on the site. The cover is the sunset.
    coverImage: { src: "/media/glass/glass-rhythm.jpg", ratio: "4:3", kind: "image", caption: "A different rhythm of life" },
    gallery: [
      { src: "/media/glass/glass-hero.jpg", ratio: "4:5", kind: "image", size: "wide", caption: "Glass × Bodrum — Summer starts here" },
      { src: "/media/glass/glass-cliff.jpg", ratio: "4:3", kind: "image", size: "wide", caption: "Padel in Bodrum is just getting started" },
      { src: "/media/glass/glass-bodrum.jpg", ratio: "4:3", kind: "image", size: "wide", caption: "White houses, turquoise water, endless sunsets" },
      { src: "/media/glass/glass-padel.jpg", ratio: "4:3", kind: "image", size: "wide", caption: "This summer, padel joins the story" },
      { src: "/media/glass/glass_bosphorus_etkinlik_v1.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Bosphorus Padel Cup" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "SOULHAUS",
    slug: "soulhaus",
    year: "2026",
    disciplines: ["Photography", "Content"],
    description: "",
    // Curated from the real SOULHAUS set (12 files): 10 used, 21.png and
    // DSC06925.jpg left out — see the exhibition wall config in walls.ts.
    // The cover is what the homepage and /work preview show — deliberately
    // the quietest frame in the set, so it does not out-shout the work.
    coverImage: {
      src: "/media/soulhaus/DSC06805.jpg",
      ratio: "2:3",
      kind: "image",
      caption: "Rolling the mat",
    },
    gallery: [
      { src: "/media/soulhaus/DSC06814.jpg", ratio: "3:4", kind: "image", size: "wide", caption: "Matcha, close" },
      { src: "/media/soulhaus/2.png", ratio: "4:5", kind: "image", size: "wide", caption: "Straw parasol on the terrace" },
      { src: "/media/soulhaus/DSC01972.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Four cocktails in the sun" },
      { src: "/media/soulhaus/DSC02010.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Smoked, on the terrace table" },
      // Added 2026-10-24, sent for the opening reel.
      { src: "/media/soulhaus/soulhaus-smoke-hand.webp", ratio: "4:5", kind: "image", size: "wide", caption: "Smoke off the glass, in hand" },
      { src: "/media/soulhaus/4%20(2).png", ratio: "4:5", kind: "image", size: "wide", caption: "The pour" },
      { src: "/media/soulhaus/1.png", ratio: "4:5", kind: "image", size: "wide", caption: "The table from above, after dark" },
      { src: "/media/soulhaus/DSC01563.jpg", ratio: "3:4", kind: "image", size: "wide", caption: "Long table, candlelight" },
      { src: "/media/soulhaus/DSC00879.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "A wish" },
      { src: "/media/soulhaus/DSC07837.JPG", ratio: "2:3", kind: "image", size: "wide", caption: "Champagne and pearls" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "FREYA GURME",
    slug: "freya-gurme",
    year: "2026",
    disciplines: ["Photography", "Video", "Content"],
    description: "",
    // Real FREYA set (8 files, all used). The cover is the palest, calmest
    // frame — it is what the homepage band shows, so it stays quiet.
    coverImage: {
      src: "/media/freya/1.png",
      ratio: "4:5",
      kind: "image",
      caption: "Pavlova, berries, a hand at the table",
    },
    gallery: [
      { src: "/media/freya/13.png", ratio: "4:5", kind: "image", size: "wide", caption: "Chili olive oil in the morning light" },
      { src: "/media/freya/17.png", ratio: "4:5", kind: "image", size: "wide", caption: "Radish and chive, finishing the plate" },
      { src: "/media/freya/5.png", ratio: "4:5", kind: "image", size: "wide", caption: "Ginger & chili pear spread, in the sun" },
      { src: "/media/freya/DSC02467.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Purple granola, from above" },
      { src: "/media/freya/DSC04685.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "The omelette, nigella and thyme" },
      { src: "/media/freya/OMLET_VRS2.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Omelette, start to plate" },
      { src: "/media/freya/FREYA_SORUCEVAP_V2.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Restaurant quality at home" },
      { src: "/media/freya/freya_thelog_sonversiyon.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Freya × The Log, in the kitchen" },
      { src: "/media/freya/freya_log_burger_2.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Freya × The Log, the burger" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "KHAM APOTHECARY",
    slug: "kham",
    year: "2026",
    disciplines: ["Photography", "Video", "Art Direction"],
    description: "",
    // Curated from the KhaM Apothecary asset set — see creative-direction
    // notes in chat. One asset (a second "opening the box with a card"
    // shot, NO.19 NEFES) was left out as repetitive with the wax-seal
    // pairing below, which already covers that beat more distinctively.
    coverImage: {
      src: "/media/kham/cover.jpg",
      ratio: "4:5",
      kind: "image",
      caption: "Lighting NO.18 MASAL — \"Her ritüel bir başlangıçtır.\"",
    },
    gallery: [
      {
        src: "/media/kham/orman-ritual.jpg",
        ratio: "4:5",
        kind: "image",
        size: "wide",
        caption: "NO.10 ORMAN, held — moss, pine, fern",
      },
      {
        src: "/media/kham/studio-desk.jpg",
        ratio: "4:5",
        kind: "image",
        size: "full",
        caption: "The studio desk — process, not just product",
      },
      {
        src: "/media/kham/nese-box.jpg",
        ratio: "4:5",
        kind: "image",
        size: "half",
        caption: "NO.21 NEŞE, against monstera",
      },
      {
        src: "/media/kham/huzur-box.jpg",
        ratio: "2:3",
        kind: "image",
        size: "half",
        caption: "NO.42 HUZUR, wax-sealed",
      },
      {
        src: "/media/kham/huzur-seal-detail.jpg",
        ratio: "2:3",
        kind: "image",
        size: "detail",
        caption: "The seal, close",
      },
      {
        src: "/media/kham/tealight-closing.jpg",
        ratio: "2:3",
        kind: "image",
        size: "detail",
        caption: "Closing frame — a smaller flame, the same ritual",
      },
      // Added later — used by the KhamWall exhibition composition.
      {
        src: "/media/kham/4.png",
        ratio: "4:5",
        kind: "image",
        size: "wide",
        caption: "NO.10 ORMAN diffuser on glass, daylight",
      },
      {
        src: "/media/kham/DSC08020.jpg",
        ratio: "2:3",
        kind: "image",
        size: "wide",
        caption: "Tin candle on a log, monstera and pine cone",
      },
      {
        src: "/media/kham/kham_video_2.mp4",
        ratio: "9:16",
        kind: "video",
        size: "wide",
        caption: "Candle and rising smoke",
      },
      {
        src: "/media/kham/kham_video1.mp4",
        ratio: "9:16",
        kind: "video",
        size: "wide",
        caption: "The range on a log",
      },
      {
        src: "/media/kham/kham_konusma_4.mp4",
        ratio: "9:16",
        kind: "video",
        size: "wide",
        caption: "In conversation",
      },
    ],
    // Hand-composed spread — the actual page layout. See EditorialSpread.
    // Rhythm: large inset open (L) → smaller, tucked close beneath it (R)
    // → one full-bleed, height-bound statement → an uneven pair, one
    // corner pulled up → a tiny isolated detail (L) → a small quiet close
    // (R) — echoing the opener's "lighting a flame" at a fraction of the
    // scale, deliberately, not repeated.
    editorial: [
      {
        type: "solo",
        image: {
          src: "/media/kham/cover.jpg",
          ratio: "4:5",
          kind: "image",
          caption: "Lighting NO.18 MASAL — \"Her ritüel bir başlangıçtır.\"",
        },
        width: "lg",
        align: "left",
        spacing: "none",
      },
      {
        type: "solo",
        image: {
          src: "/media/kham/orman-ritual.jpg",
          ratio: "4:5",
          kind: "image",
          caption: "NO.10 ORMAN, held — moss, pine, fern",
        },
        width: "md",
        align: "right",
        spacing: "tight",
      },
      {
        type: "bleed",
        image: {
          src: "/media/kham/studio-desk.jpg",
          ratio: "4:5",
          kind: "image",
          caption: "The studio desk — process, not just product",
        },
        spacing: "loose",
      },
      {
        type: "pair",
        a: {
          src: "/media/kham/nese-box.jpg",
          ratio: "4:5",
          kind: "image",
          caption: "NO.21 NEŞE, against monstera",
        },
        b: {
          src: "/media/kham/huzur-box.jpg",
          ratio: "2:3",
          kind: "image",
          caption: "NO.42 HUZUR, wax-sealed",
        },
        widthA: "lg",
        widthB: "md",
        raised: "b",
        spacing: "loose",
      },
      {
        type: "detail",
        image: {
          src: "/media/kham/huzur-seal-detail.jpg",
          ratio: "2:3",
          kind: "image",
          caption: "The seal, close",
        },
        width: "xs",
        align: "left",
        spacing: "xloose",
      },
      {
        type: "solo",
        image: {
          src: "/media/kham/tealight-closing.jpg",
          ratio: "2:3",
          kind: "image",
          caption: "Closing frame — a smaller flame, the same ritual",
        },
        width: "sm",
        align: "right",
        spacing: "xloose",
      },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "HAPPY PILATES",
    slug: "happy-pilates",
    year: "2026",
    disciplines: ["Photography", "Video", "Content"],
    description: "",
    // Real HAPPY PILATES set (11 files): 10 used, 8.png (golden-ratio
    // overlay) left out. The cover is the quietest frame, since the
    // homepage band shows it.
    coverImage: {
      src: "/media/happypilates/DSC07748.jpg",
      ratio: "2:3",
      kind: "image",
      caption: "Mid-movement on the reformer",
    },
    gallery: [
      { src: "/media/happypilates/3.png", ratio: "2:3", kind: "image", size: "wide", caption: "On the cadillac, in warm light" },
      { src: "/media/happypilates/4.png", ratio: "2:3", kind: "image", size: "wide", caption: "Class on the terrace" },
      { src: "/media/happypilates/12.png", ratio: "2:3", kind: "image", size: "wide", caption: "Trophies and medals" },
      { src: "/media/happypilates/2.png", ratio: "4:5", kind: "image", size: "wide", caption: "Joseph Pilates — black and white" },
      { src: "/media/happypilates/6.png", ratio: "4:5", kind: "image", size: "wide", caption: "Side lunge, rooftop mat" },
      { src: "/media/happypilates/10.png", ratio: "2:3", kind: "image", size: "wide", caption: "Reformer, arms overhead" },
      // Added 2026-10-24, sent for the opening reel.
      { src: "/media/happypilates/hp-reformer-split.webp", ratio: "2:3", kind: "image", size: "wide", caption: "One leg to the ceiling, on the reformer" },
      { src: "/media/happypilates/Happy_Ak%C4%B1m3.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Flow, with a flower opening" },
      { src: "/media/happypilates/training1.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Training" },
      { src: "/media/happypilates/happypilates_sorucevap_1.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Pilates, in conversation" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "ATIYE",
    subtitle: "Live in Concert",
    slug: "atiye-konser",
    year: "2026",
    disciplines: ["Concert Photography"],
    description: "",
    // Atiye concert set (6 files, all 4:5): all used. The cover is the
    // quietest frame — black and white, eyes closed, no stage noise.
    coverImage: {
      src: "/media/atiye_konser/1.png",
      ratio: "4:5",
      kind: "image",
      caption: "Eyes closed, mid-song",
    },
    gallery: [
      { src: "/media/atiye_konser/3.png", ratio: "4:5", kind: "image", size: "wide", caption: "Singing into a blue beam" },
      { src: "/media/atiye_konser/5.png", ratio: "4:5", kind: "image", size: "wide", caption: "Pointing out to the crowd" },
      { src: "/media/atiye_konser/4.png", ratio: "4:5", kind: "image", size: "wide", caption: "On the drum, in smoke" },
      { src: "/media/atiye_konser/2.png", ratio: "4:5", kind: "image", size: "wide", caption: "Reaching out under the stage lights" },
      { src: "/media/atiye_konser/6.png", ratio: "4:5", kind: "image", size: "wide", caption: "Arm raised, singing" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "SARAJEVO FILM FESTIVAL",
    slug: "sarajevo-film-festival",
    year: "2025",
    disciplines: ["Photography"],
    description: "",
    // Sarajevo Film Festival 2025 set (11 files, all 3:2): all used. The
    // lead is the white dress against the festival's red; the rest runs
    // from the city to the box office, the day, then the red carpet at
    // night. No one in these frames is named — the names are not ours to
    // guess.
    coverImage: { src: "/media/sarajevo/sff-08-white-dress.jpg", ratio: "3:2", kind: "image", caption: "White dress, red carpet" },
    gallery: [
      { src: "/media/sarajevo/sff-01-street.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Festival banners down the river road" },
      { src: "/media/sarajevo/sff-02-box-office.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Festival center, box office" },
      { src: "/media/sarajevo/sff-04-posters.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Official selection, on the square" },
      { src: "/media/sarajevo/sff-06-band.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "The brass band in the street" },
      { src: "/media/sarajevo/sff-03-interview.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "An interview under the lights" },
      { src: "/media/sarajevo/sff-07-couple.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Silver, on the red carpet" },
      { src: "/media/sarajevo/sff-09-sunglasses.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Walking the carpet" },
      { src: "/media/sarajevo/sff-10-trio.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Arm in arm" },
      { src: "/media/sarajevo/sff-11-arrivals.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Arrivals, after dark" },
      { src: "/media/sarajevo/sff-05-reception.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "The reception" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "HEDONUTOPIA",
    subtitle: "Live Performance",
    slug: "hedonutopia",
    year: "2025",
    disciplines: ["Photography"],
    description: "",
    // Hedonutopia concert set (5 files, all used). The lead is the low
    // angle under the stage lights; the band is not named beyond the act.
    coverImage: { src: "/media/hedonutopia/hedo-02-low-angle.jpg", ratio: "4:3", kind: "image", caption: "From below, under the stage lights" },
    gallery: [
      { src: "/media/hedonutopia/hedo-03-stage.jpg", ratio: "16:9", kind: "image", size: "wide", caption: "Through the smoke" },
      { src: "/media/hedonutopia/hedo-01-mic.jpg", ratio: "16:9", kind: "image", size: "wide", caption: "At the mic" },
      // Added 2026-10-24.
      { src: "/media/hedonutopia/hedo-04-looking-up.jpg", ratio: "3:4", kind: "image", size: "wide", caption: "Head back, guitar in hand" },
      { src: "/media/hedonutopia/hedo-05-keys.jpg", ratio: "3:4", kind: "image", size: "wide", caption: "On the keys, in green smoke" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "KERALA DUST",
    subtitle: "Live Performance",
    slug: "kerala-dust",
    year: "2025",
    disciplines: ["Photography"],
    description: "",
    // Kerala Dust concert set (8 frames, Untitled-269…284, downsized to
    // 2400px). The neon staircase behind the stage runs through all of them.
    coverImage: { src: "/media/kerala-dust/kd-07-blue.jpg", ratio: "3:2", kind: "image", caption: "Blue light, the neon stair behind" },
    gallery: [
      { src: "/media/kerala-dust/kd-01-crowd.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Leaning out over the crowd" },
      { src: "/media/kerala-dust/kd-02-fists.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Fists up, in magenta" },
      { src: "/media/kerala-dust/kd-03-keys.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "At the keys, into the light" },
      { src: "/media/kerala-dust/kd-04-wave.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "A hand across the frame" },
      { src: "/media/kerala-dust/kd-05-smoke.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Blue smoke over the city lights" },
      { src: "/media/kerala-dust/kd-06-mono.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "The colour drains out" },
      { src: "/media/kerala-dust/kd-08-haze.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Through a pink haze" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "VILLA MEZE",
    slug: "villa-meze",
    year: "2025",
    disciplines: ["Social Media Management", "Content Production"],
    description: "",
    // The 8 frames sent in chat (from villameze/, 1080x1350). The folder
    // holds 14 more, not used until confirmed.
    coverImage: { src: "/media/villa-meze/vm-01-sign.jpg", ratio: "4:5", kind: "image", caption: "The sign, in gold on marble" },
    gallery: [
      { src: "/media/villa-meze/vm-02-cigkofte.jpg", ratio: "4:5", kind: "image", size: "wide", caption: "Çiğ köfte, shaped by hand" },
      { src: "/media/villa-meze/vm-03-potatoes.jpg", ratio: "4:5", kind: "image", size: "wide", caption: "Potatoes, carrots and dill" },
      { src: "/media/villa-meze/vm-04-bowls.jpg", ratio: "4:5", kind: "image", size: "wide", caption: "Two bowls, to go" },
      { src: "/media/villa-meze/vm-05-tray.jpg", ratio: "4:5", kind: "image", size: "wide", caption: "Out of the counter" },
      { src: "/media/villa-meze/vm-06-drip.jpg", ratio: "4:5", kind: "image", size: "wide", caption: "Sauce, mid-drip" },
      { src: "/media/villa-meze/vm-07-meze-bowl.jpg", ratio: "4:5", kind: "image", size: "wide", caption: "A meze bowl on the grass" },
      { src: "/media/villa-meze/vm-08-bag.jpg", ratio: "4:5", kind: "image", size: "wide", caption: "Packed for a picnic" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "EFSENSE TRAVEL",
    slug: "efsense-travel",
    year: "2026",
    disciplines: ["Design", "AI Visuals"],
    description: "",
    // The delivered social set (9 files, all 1080x1350): all used, run as
    // the campaign reads — who they are, the journey, the tours, the
    // corporate side, and the closing question. The lead is the opener.
    coverImage: { src: "/media/efsense-travel/efs-01-journey.webp", ratio: "4:5", kind: "image", caption: "A route of light across the sea at night" },
    gallery: [
      { src: "/media/efsense-travel/efs-02-who-we-are.webp", ratio: "4:5", kind: "image", size: "wide", caption: "A desk at golden hour" },
      { src: "/media/efsense-travel/efs-03-window.webp", ratio: "4:5", kind: "image", size: "wide", caption: "Sunset through the aircraft window" },
      { src: "/media/efsense-travel/efs-04-boutique-tours.webp", ratio: "4:5", kind: "image", size: "wide", caption: "Boutique and themed tours" },
      { src: "/media/efsense-travel/efs-05-tuscany.webp", ratio: "4:5", kind: "image", size: "wide", caption: "A table above the vineyards" },
      { src: "/media/efsense-travel/efs-06-mice.webp", ratio: "4:5", kind: "image", size: "wide", caption: "An empty stage under the spots" },
      { src: "/media/efsense-travel/efs-07-impact.webp", ratio: "4:5", kind: "image", size: "wide", caption: "A table set for the summit" },
      { src: "/media/efsense-travel/efs-08-this-moment.webp", ratio: "4:5", kind: "image", size: "wide", caption: "A terrace over the sea at sunset" },
      { src: "/media/efsense-travel/efs-09-next-story.webp", ratio: "4:5", kind: "image", size: "wide", caption: "The next story" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "KÖZ",
    subtitle: "Coming Soon",
    slug: "koz",
    year: "2026",
    disciplines: ["Food & Beverage", "Motion & Teaser"],
    description: "",
    // Delivered as two vertical films and no photographs — a Turkish grill
    // in Canggu, Bali, announcing itself. The page opens on the first film
    // itself; the stills are frames from the two films, for the places the
    // project is shown as pictures.
    coverImage: { src: "/media/koz/KOZ_COMINGSOON_V1.mp4", ratio: "9:16", kind: "video", caption: "Coming soon, I", poster: "/media/koz/still-3.jpg" },
    gallery: [
      { src: "/media/koz/KOZ_COMINGSOON_V2.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Coming soon, II", poster: "/media/koz/still-0.jpg" },
    ],
    stills: [
      "/media/koz/still-0.jpg",
      "/media/koz/still-1.jpg",
      "/media/koz/still-2.jpg",
      "/media/koz/still-3.jpg",
      "/media/koz/still-4.jpg",
      "/media/koz/still-5.jpg",
    ],
    credits: [],
    featured: true,
  },
  {
    title: "GOAT VILLAS",
    subtitle: "Pre-Launch Teaser Campaign",
    slug: "goat-villas",
    year: "2024",
    disciplines: ["Luxury Hospitality", "Creative Editing", "Teaser Films"],
    agency: "Kreş Marka Bakımevi",
    description: "",
    // Delivered as three vertical films and no photographs. The page opens
    // on G7; the stills are frames from the three films, for the places the
    // project is shown as pictures.
    coverImage: { src: "/media/goat_villas/G7.mp4", ratio: "9:16", kind: "video", caption: "Chandelier, champagne, a figure at the window", poster: "/media/goat_villas/still-2.jpg" },
    gallery: [
      { src: "/media/goat_villas/G3.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Sunrise, colour, flight", poster: "/media/goat_villas/still-5.jpg" },
      { src: "/media/goat_villas/G9.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "The hourglass", poster: "/media/goat_villas/still-0.jpg" },
    ],
    stills: [
      "/media/goat_villas/still-0.jpg",
      "/media/goat_villas/still-1.jpg",
      "/media/goat_villas/still-2.jpg",
      "/media/goat_villas/still-3.jpg",
      "/media/goat_villas/still-4.jpg",
      "/media/goat_villas/still-5.jpg",
      "/media/goat_villas/still-6.jpg",
    ],
    credits: [],
    featured: true,
  },
  {
    title: "HOLIDAY INN KAVAKLIDERE",
    slug: "holiday-inn-kavaklidere",
    year: "2026",
    disciplines: ["Photography", "Video"],
    agency: "Mireno",
    description: "",
    // A hotel shoot through Mireno: one photograph delivered so far, and
    // four vertical reels from the kitchen and the bar. The stills are
    // frames from the reels, for the home field only.
    coverImage: { src: "/media/holiday_inn/breakfast-tray.jpg", ratio: "1:1", kind: "image", caption: "Breakfast in bed" },
    gallery: [
      { src: "/media/holiday_inn/MIRENO_HOLIDAY_INN_REEL_6.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "A martini at the bar" },
      { src: "/media/holiday_inn/HOLIDAY_HAZIRAN_REEL2.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Sauce over the steak" },
      { src: "/media/holiday_inn/HOLIDAY_HAZIRAN_REEL6.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Finishing the tart" },
      { src: "/media/holiday_inn/HOLIDAY_HAZIRAN_REEL10.mp4", ratio: "9:16", kind: "video", size: "wide", caption: "Tea poured over breakfast" },
    ],
    stills: [
      "/media/holiday_inn/still-0.jpg",
      "/media/holiday_inn/still-1.jpg",
      "/media/holiday_inn/still-2.jpg",
      "/media/holiday_inn/still-3.jpg",
    ],
    credits: [],
    featured: true,
  },
  {
    title: "NAYA",
    slug: "naya",
    year: "2024",
    disciplines: ["Photography", "Video", "Content"],
    agency: "Kreş Marka Bakımevi",
    description: "",
    // Real NAYA set (8 files): all used. The cover is the quietest frame
    // (a hand pouring oil, dark and muted), since the homepage band shows it.
    coverImage: { src: "/media/naya/naya-03-service.jpg", ratio: "1:1", kind: "image", caption: "Oil over the beetroot soup" },
    gallery: [
      { src: "/media/naya/naya-06-dusk.jpg", ratio: "1:1", kind: "image", size: "wide", caption: "Grilled beef salad, red wine" },
      { src: "/media/naya/naya-02-crimson.jpg", ratio: "1:1", kind: "image", size: "wide", caption: "Beetroot soup, close" },
      { src: "/media/naya/naya-08-afterglow.jpg", ratio: "9:16", kind: "image", size: "wide", caption: "Two spritzes at the bar" },
      { src: "/media/naya/naya-04-daylight.jpg", ratio: "1:1", kind: "image", size: "wide", caption: "Dessert in the afternoon sun" },
      { src: "/media/naya/naya-01-arrival.jpg", ratio: "1:1", kind: "image", size: "wide", caption: "Radish, wine and a folded napkin" },
      { src: "/media/naya/naya-07-signature.jpg", ratio: "1:1", kind: "image", size: "wide", caption: "The signature cocktail" },
      { src: "/media/naya/naya-05-golden.jpg", ratio: "1:1", kind: "image", size: "wide", caption: "Panna cotta at dusk" },
      { src: "/media/naya/NAYA_VIDEO.mp4", ratio: "16:9", kind: "video", size: "wide", caption: "An evening at Naya" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "SARGUS",
    slug: "sargus",
    year: "2026",
    disciplines: ["Photography"],
    description: "",
    // Real SARGUS set (6 files): all used. The cover is the quietest frame
    // (the mirror detail), since the homepage band shows it.
    coverImage: { src: "/media/sargus/sargus-02-mirror-detail.jpg", ratio: "3:2", kind: "image", caption: "The dining room in a round mirror" },
    gallery: [
      { src: "/media/sargus/sargus-04-serving.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Hummus, served" },
      { src: "/media/sargus/sargus-01-interior.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "The room, bar and wine wall" },
      { src: "/media/sargus/sargus-05-dining-moment.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Mezze, mid-bite" },
      { src: "/media/sargus/sargus-03-table-setting.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Table by the window" },
      { src: "/media/sargus/sargus-06-afterimage.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Mezze plate through a glass" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "HOP SCOOTER",
    slug: "hop-scooter",
    year: "2025",
    disciplines: ["Photography"],
    description: "",
    // Real HOP SCOOTER set (8 files, all portrait). Three of them —
    // hop-05-handoff, hop-01-trio, hop-02-wave — are 608x1080, half the
    // size of everything else on the site, and are left out until larger
    // copies arrive. The cover is the pair by the lake.
    coverImage: { src: "/media/hop_scooter/hop-07-pair.jpg", ratio: "2:3", kind: "image", caption: "Two riders by the lake" },
    gallery: [
      { src: "/media/hop_scooter/hop-03-solo.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Peace signs over two scooters" },
      { src: "/media/hop_scooter/hop-07-pair.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Two riders by the lake" },
      { src: "/media/hop_scooter/hop-04-peace.jpg", ratio: "5:8", kind: "image", size: "wide", caption: "Coffee on the boardwalk" },
      { src: "/media/hop_scooter/hop-06-coffee.jpg", ratio: "9:16", kind: "image", size: "wide", caption: "Between two scooters" },
      { src: "/media/hop_scooter/hop-hero.jpg", ratio: "9:16", kind: "image", size: "wide", caption: "Laughing at the scooter dock" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "TURTA HOME CAFE",
    slug: "turta-home-cafe",
    year: "2025–2026",
    disciplines: ["Photography", "Video", "Content"],
    description: "",
    // Real TURTA set (8 files, folder /media/turta/): all used. The cover is
    // the quietest frame (the strawberry tart from above, in low light).
    coverImage: { src: "/media/turta/turta-01-signature.jpg", ratio: "3:2", kind: "image", caption: "Strawberry tart, from above" },
    gallery: [
      { src: "/media/turta/turta-06-facade.jpg", ratio: "4:5", kind: "image", size: "wide", caption: "The house and its green awnings" },
      { src: "/media/turta/turta-03-oven.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Cookies out of the oven" },
      { src: "/media/turta/turta-05-chocolate.jpg", ratio: "4:5", kind: "image", size: "wide", caption: "Chocolate cake" },
      { src: "/media/turta/turta-02-morning.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Breakfast on the terrace" },
      { src: "/media/turta/turta-04-table.jpg", ratio: "2:3", kind: "image", size: "wide", caption: "Savoury tart and orange juice" },
      // Added 2026-10-24.
      { src: "/media/turta/turta-07-cheesecake.webp", ratio: "4:5", kind: "image", size: "wide", caption: "Cheesecake under the bougainvillea" },
      { src: "/media/turta/turta-08-lattice.webp", ratio: "4:5", kind: "image", size: "wide", caption: "Lattice tarts on the tray" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "SUSHICO",
    slug: "sushico",
    year: "2026",
    disciplines: ["Photography"],
    description: "",
    // Real SUSHICO set: 5 files but only 3 unique frames — sushico-01-ceiling
    // and sushico-01-room are byte-identical, and so are sushico-03-facade
    // and sushico-03-light. One of each pair is used. The cover is the
    // calmest frame (the glass corner).
    coverImage: { src: "/media/sushico/sushico-03-facade.jpg", ratio: "3:2", kind: "image", caption: "The glass corner, in daylight" },
    gallery: [
      { src: "/media/sushico/sushico-02-rhythm.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Koi mural and paper lanterns" },
      { src: "/media/sushico/sushico-01-room.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "The room, lattice ceiling and sushi bar" },
    ],
    credits: [],
    featured: true,
  },
  {
    title: "ARKADAŞ BASIM",
    slug: "arkadas-basim",
    year: "2026",
    disciplines: ["Promotional Film", "Photography"],
    description: "",
    // Real ARKADAŞ BASIM set (9 files, folder /media/arkadas_basım/ — a
    // print house): all used. The cover is the quietest frame — an
    // abstract press-mechanism macro, no people, no branding — since the
    // homepage band shows it.
    coverImage: {
      src: "/media/arkadas_bas%C4%B1m/DSC00929.jpg",
      ratio: "3:2",
      kind: "image",
      caption: "Inside the press",
    },
    gallery: [
      { src: "/media/arkadas_bas%C4%B1m/DSC01060.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "A finished run, off the line" },
      { src: "/media/arkadas_bas%C4%B1m/DSC01102.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Checking registration, up close" },
      { src: "/media/arkadas_bas%C4%B1m/DSC00945.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Reviewing a sheet on the light table" },
      { src: "/media/arkadas_bas%C4%B1m/DSC01232.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Red, mixed to match" },
      { src: "/media/arkadas_bas%C4%B1m/DSC00954.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "On the press bed" },
      { src: "/media/arkadas_bas%C4%B1m/DSC01040.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Sheets, stacked and squared" },
      { src: "/media/arkadas_bas%C4%B1m/DSC01269.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Magazines, straight off the line" },
      { src: "/media/arkadas_bas%C4%B1m/DSC01272.jpg", ratio: "3:2", kind: "image", size: "wide", caption: "Into the binder" },
    ],
    credits: [],
    featured: true,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

// Projects that still only have placeholder paths — no photographs yet.
// Lives here rather than in home.ts so the adjacency below can use it
// without a circular import; home.ts re-exports it. Empty since EFSENSE's
// set arrived (2026-10-24).
export const NO_PHOTOS_YET = new Set<string>();

export function getAdjacentProjects(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  // "Next project" never leads to a page of empty placeholders.
  const list = getFeaturedProjects().filter((p) => !NO_PHOTOS_YET.has(p.slug));
  const index = list.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: list[(index - 1 + list.length) % list.length],
    next: list[(index + 1) % list.length],
  };
}




