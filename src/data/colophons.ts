// The editorial note that closes each project: what was asked, what we
// did, what came out of it — plus where it was made. Supplied by the
// studio, stored verbatim; nothing here is written or embellished by the
// site. A project without an entry simply ends without a colophon.
export interface Colophon {
  /** Only when a specific place is part of the story. */
  location?: string;
  /** One line, for the project page itself — where there is only room
   * for a sentence beside the work. */
  short?: string;
  /** Only where someone else shares the credit. */
  credit?: string;
  /** The three parts. Any of them may be missing when the studio has not
   * supplied it; a missing part is left out, never filled in. */
  brief?: string;
  contribution?: string;
  output?: string;
}

/** The parts of a colophon that were supplied, in order. */
export function colophonNotes(c: Colophon): [string, string][] {
  const parts: [string, string | undefined][] = [
    ["Brief", c.brief],
    ["Contribution", c.contribution],
    ["Output", c.output],
  ];
  return parts.filter((p): p is [string, string] => Boolean(p[1]));
}

export const colophons: Record<string, Colophon> = {
  glass: {
    short: "Motion, cut to the rhythm of the game.",
    brief:
      "Bring motion to the ongoing digital communication of Glass, the padel app by Repute US.",
    contribution:
      "Working from existing footage and brand assets, we focused on editing, motion design and visual rhythm.",
    output:
      "A series of motion-led social content for launches, milestones and brand communication.",
  },
  soulhaus: {
    location: "Ankara",
    short: "From the first stretch to the last call.",
    brief:
      "Capture Soulhaus through the different moments of its day, from the space itself to its social atmosphere.",
    contribution:
      "We photographed the venue, drinks, people and in-between moments with a natural, editorial eye.",
    output:
      "A photo library covering the space, lifestyle and hospitality sides of Soulhaus.",
  },
  "freya-gurme": {
    location: "Ankara",
    short: "Good products, at home in every recipe.",
    brief: "Show Freya products naturally, within recipes and everyday use.",
    contribution:
      "Through photography, recipe videos and social content, we made the products part of the visual story.",
    output:
      "A body of photo and video content for recipes, products and social communication.",
  },
  kham: {
    short: "Nature, texture and the quiet rituals in between.",
    brief:
      "Translate KhaM Apothecary's nature-inspired, ritual-focused identity into photography and video.",
    contribution:
      "We handled art direction, photography and video, focusing on product, texture and everyday rituals.",
    output:
      "A visual series bringing together product imagery, lifestyle moments and close-up details.",
  },
  "happy-pilates": {
    location: "Ümitköy, Ankara",
    short: "Movement, framed with intention.",
    brief:
      "Tell the story of the studio, its instructors and the different areas of movement and training it offers.",
    contribution:
      "We produced photography, video and social content covering classes, movement, technique and the studio space.",
    output: "An ongoing content library for the studio's digital communication.",
  },
  "efsense-travel": {
    short: "Every destination, its own visual language.",
    brief:
      "Shape the visual communication for a range of destinations, campaigns and brand announcements.",
    contribution:
      "Through social media design and AI-assisted visual production, we adapted each piece to its destination and communication need.",
    output:
      "A series of digital visuals for the brand's ongoing social media and campaign communication.",
  },
  naya: {
    location: "Atakule, Ankara",
    short: "Food, drinks and a sense of place.",
    credit: "with Kreş Marka Bakımevi",
    brief: "Produce visual content for Naya's food, drinks and hospitality experience.",
    contribution:
      "In collaboration with Kreş Marka Bakımevi, we contributed photography, video and content production.",
    output: "Photo and video assets for the brand's digital communication.",
  },
  "turta-home-cafe": {
    location: "Ümitköy, Ankara",
    short: "Signature flavors, slow café moments.",
    brief: "Capture Turta's products and the atmosphere of the café.",
    contribution:
      "We photographed and filmed signature products, small details and moments around the space.",
    output: "Photo and video content for the café's ongoing social communication.",
  },
  "arkadas-basim": {
    location: "Ostim, Ankara",
    short: "The craft of print, stage by stage.",
    brief:
      "Document Arkadaş Basım's production process, materials and working environment.",
    contribution:
      "We shot photography and a promotional film covering each stage of the printing process.",
    output:
      "A promotional film and photo library for the company's digital and corporate communication.",
  },
  sargus: {
    location: "Çankaya, Ankara",
    short: "The sea on the plate, the evening around the table.",
    brief:
      "Portray Sargus through its seafood, its interiors and the atmosphere around the table.",
    contribution:
      "We photographed the restaurant, its dishes and details, following the space through different moments of service.",
    output: "A photo library for the restaurant's digital communication and social media.",
  },
  sushico: {
    short: "Precision on the plate, character in the space.",
    brief:
      "Portray SushiCo through its interior, its food and the atmosphere of dining there.",
    contribution:
      "We photographed the restaurant, its architectural details and dishes, and the different moments that shape the space.",
    output: "A photo library for the brand's digital communication and social media.",
  },
  // Supplied 2026-10-24.
  "atiye-konser": {
    location: "Bilkent Spring Festival, Ankara",
    short: "The energy of the stage, caught between light and motion.",
  },
  hedonutopia: {
    brief:
      "To translate Hedonutopia's distinctive stage presence and emotional atmosphere into a visual narrative.",
  },
  "kerala-dust": {
    short: "Rhythm in the dark. Moments in the light.",
  },
  "holiday-inn-kavaklidere": {
    contribution:
      "Cinematography within the Mireno production team, contributing to framing, lighting, camera movement, and on-set production.",
  },
  koz: {
    location: "Canggu, Bali",
    short: "A familiar fire. A new setting.",
    brief:
      "To introduce KÖZ's upcoming Canggu location through a short, engaging teaser rooted in fire, food, and the brand's distinct character.",
    contribution:
      "Concept development, storyboarding, footage selection, rhythmic editing direction, and motion design exploration.",
    output:
      'A visual concept and editing direction developed for a 17-second vertical "Coming Soon" teaser.',
  },
  "goat-villas": {
    short: "The feeling came before the reveal.",
    credit: "with Kreş Marka Bakımevi",
    brief:
      "To establish GOAT Villas' luxurious and elegant identity before the property was completed. The objective was to build anticipation and intrigue, introducing the brand through atmosphere and emotion rather than revealing the physical space.",
    contribution:
      "Creative editing and visual storytelling across a series of short-form teaser films. Carefully selected imagery, restrained typography, considered pacing, and a sophisticated visual palette were brought together to create a sense of mystery and exclusivity.",
    output:
      "Three cinematic, vertical teaser films designed to communicate the brand's identity and build anticipation ahead of its launch.",
  },
  "sarajevo-film-festival": {
    location: "Sarajevo, Bosnia and Herzegovina",
    contribution:
      "Served as an official photographer within the press team of the 31st Sarajevo Film Festival, producing high-quality visual content for the festival's communication and media coverage.",
  },
  "hop-scooter": {
    brief:
      "To bring Hop Scooter's urban mobility experience to life through energetic, contemporary visuals that reflect the brand's dynamic identity.",
  },
  "villa-meze": {
    brief:
      "To establish a consistent social media presence that reflects Villa Meze's intimate setting, culinary offerings, and welcoming atmosphere.",
  },
};

export function getColophon(slug: string): Colophon | undefined {
  return colophons[slug];
}
