import { NO_PHOTOS_YET } from "./projects";

// Projects that still only have placeholder paths — no photographs yet.
// Defined in projects.ts and re-exported here for the Archive and the
// Ledger, which count frames and must not count files that do not exist.
export { NO_PHOTOS_YET };

// THE OPENING. The homepage is a frame of moving image with the studio's
// name over it. The studio is making an AI-generated opening film for it;
// when it is ready, put the file at public/media/intro/opening.mp4 (H.264,
// muted, short, a few megabytes — it plays on every visit) and set the path
// here. Until then the frame hard-cuts between the stills below.
export const OPENING_VIDEO: string | null = null;

/** Cut between in the opening frame while there is no film. An edit, not a
 * sample: one light source and shadow, a gesture, a strong graphic shape —
 * no design boards, nothing with copy on it, no catalogue shots. Frames
 * from the films sit alongside the photographs. Strongest first. */
export const OPENING_STILLS = [
  "/media/stills/trendyol-eurovision-0.jpg",
  "/media/atiye_konser/3.png",
  "/media/stills/gustav-0.jpg",
  "/media/arkadas_basım/DSC01060.jpg",
  "/media/stills/trendyol-eurovision-2.jpg",
  "/media/soulhaus/DSC01563.jpg",
  "/media/stills/felipe-massa-goturkiye-0.jpg",
  "/media/kham/orman-ritual.jpg",
  "/media/stills/gustav-1.jpg",
  "/media/happypilates/3.png",
  "/media/stills/trendyol-eurovision-4.jpg",
  "/media/soulhaus/4 (2).png",
];
