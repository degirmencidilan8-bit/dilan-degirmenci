export const profile = {
  studioName: "Dilan&Batuhan",
  // Real names, for the rare place a full byline is warranted (see
  // AGENTS.md-level project notes) — everywhere else the site speaks as
  // the studio.
  names: ["Dilan Degirmenci", "Batuhan Konak"],

  // The About copy, supplied by the studio. Split by the slot it is set
  // in, not by paragraph order: `statement` is the one line the page
  // says loudly, `who` and `how` are the body. The two list sentences
  // from the original text are not repeated here — they live in
  // `disciplines` and `services` below, where they are already set once.
  statement:
    "Their approach changes with each project. Rather than applying one fixed aesthetic, they focus on finding the right visual rhythm, tone and level of intervention for the work at hand.",
  /** The one phrase in `statement` the hand circles. Must appear in it
   * verbatim; if it does not, the line renders unmarked rather than
   * breaking. */
  statementMark: "level of intervention",
  who: "DILAN&BATUHAN is an independent creative duo based in Ankara, working together since 2025 while continuing their individual practices.",
  how: "They collaborate with brands, agencies and creative teams across hospitality, food, wellness, sport, travel, lifestyle and culture. Sometimes they are involved from the first visual idea; in other projects, they contribute within an existing creative direction through production, post-production or digital communication.",

  // The craft.
  disciplines: [
    "Photography",
    "Direction",
    "Cinematography",
    "Video",
    "Editing",
    "Motion Design",
    "Art Direction",
  ],
  // The sectors named in `how`, in the order that sentence names them.
  // Pulled out so the Record section can count them without parsing prose
  // — not a new taxonomy, the studio's own words split on the commas. If
  // `how` changes, change this with it.
  sectors: [
    "Hospitality",
    "Food",
    "Wellness",
    "Sport",
    "Travel",
    "Lifestyle",
    "Culture",
  ],

  // What the work extends into on some projects — the studio's own
  // distinction, kept as one.
  services: [
    "Content Production",
    "Social Media Management",
    "Content Strategy",
    "Meta Ads",
  ],
  // Real project names — not a separate client list. Kept in the order
  // they appear in data/projects.ts.
  clients: [
    "Glass App",
    "Soulhaus",
    "Freya Gurme",
    "Kham Apothecary",
    "Happy Pilates",
    "Atiye",
    "Efsense Travel",
    "Naya",
    "Turta Home Cafe",
    "Arkadaş Basım",
    "Sargus",
    "Hop Scooter",
    "Sushico",
  ],
  location: "Based in Ankara — working worldwide",
  // No booking line for now (2026-10-24): the studio asked for it to go.
  email: "dilanfarahwork@gmail.com",
  instagram: { handle: "@dilanfarah", url: "https://instagram.com/dilanfarah" },
};
