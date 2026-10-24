import { projects } from "./projects";
import { NO_PHOTOS_YET } from "./home";
import { RATIO_VALUE } from "./ratio";
import type { ArchiveItem, ArchiveSize, Ratio } from "./types";

// Every Archive entry is a real photograph, pulled straight from a real
// project's own cover + gallery — nothing here is invented. This is why
// there is no separate "BTS / Stills / Experimental" taxonomy: we don't
// have material that is genuinely distinct from what's curated into each
// project's own page, so pretending otherwise would be a second layer of
// fiction on top of the first. The filter is simply the project itself.

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed seed so the shuffle is identical on server and client (no
// hydration mismatch) and stable between builds.
function shuffle<T>(list: T[], seed: number): T[] {
  const out = list.slice();
  const rnd = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Deterministic (same on server and client) so the grid doesn't jump on
// hydration — size mostly follows the photo's own proportions, with a
// small hashed jitter so the grid reads as an irregular mosaic rather than
// three repeating tile shapes.
function sizeFor(id: string, ratio: Ratio): ArchiveSize {
  const v = RATIO_VALUE[ratio];
  const jitter = hashCode(id) % 5;
  if (v <= 0.72) return jitter === 0 ? "lg" : jitter === 1 ? "tall" : "sm";
  if (v >= 1.4) return jitter < 2 ? "wide" : jitter === 2 ? "lg" : "md";
  return jitter === 0 ? "lg" : jitter < 3 ? "md" : "sm";
}

// The Archive is edited, not exhaustive.
//
// Every photograph across every project came to eighty-three frames, and
// most of them were doing a job rather than being a photograph: catalogue
// packshots, room records, smiling lifestyle, flat plates of food, and a
// handful of social-media collages that are graphic design and not
// photography at all. Shown together they averaged the good work down.
//
// These twenty-eight were chosen by looking at all eighty-three: stage
// light and movement, dark rooms lit by one candle, the print house as
// craft, and the few food frames with real graphic strength. If a frame is
// here it is because it would survive on its own, away from the project
// that paid for it.
// Re-edited for black and white. Three of the earlier picks were carried
// by their colour — a crimson plate shot from above, a red tool against
// teal machinery — and in monochrome they have nothing left to say. What
// stays is what survives the loss of colour: one light source and a lot of
// shadow, texture, a gesture, a face.
const SELECTED = new Set([
  // Stage. The widest tonal range in the whole body of work.
  "/media/atiye_konser/5.png",
  "/media/atiye_konser/2.png",
  "/media/atiye_konser/1.png",
  "/media/atiye_konser/3.png",
  // One candle, one room.
  "/media/soulhaus/1.png",
  "/media/soulhaus/4 (2).png",
  "/media/soulhaus/DSC00879.jpg",
  "/media/soulhaus/DSC07837-web.jpg",
  "/media/soulhaus/DSC01563.jpg",
  // The print house: hands, machines, a loupe on a sheet. Nothing here
  // needed colour in the first place.
  "/media/arkadas_basım/DSC01102.jpg",
  "/media/arkadas_basım/DSC00954.jpg",
  "/media/arkadas_basım/DSC01272.jpg",
  "/media/arkadas_basım/DSC01060.jpg",
  "/media/arkadas_basım/DSC01040.jpg",
  // A pour, in the dark.
  "/media/naya/naya-03-service.jpg",
  // Architectural, still.
  "/media/sargus/sargus-02-mirror-detail.jpg",
  // Ritual.
  "/media/kham/cover.jpg",
  // Backlit, close to abstract.
  "/media/happypilates/3.png",
]);

export function getArchiveItems(): ArchiveItem[] {
  const items: ArchiveItem[] = [];
  for (const project of projects) {
    // A project whose image paths are still placeholders contributes
    // nothing to a sheet of real frames.
    if (NO_PHOTOS_YET.has(project.slug)) continue;
    const media = [project.coverImage, ...project.gallery].filter(
      (m) => m.kind === "image" && SELECTED.has(decodeURIComponent(m.src)),
    );
    media.forEach((m, i) => {
      const id = `${project.slug}-${i}`;
      items.push({
        id,
        title: m.caption ?? project.title,
        year: project.year,
        category: project.title,
        src: m.src,
        ratio: m.ratio,
        size: sizeFor(id, m.ratio),
      });
    });
  }
  // Mixed, not grouped by project — a field to browse, not a set of stacks.
  return shuffle(items, 20260919);
}

export const archiveItems: ArchiveItem[] = getArchiveItems();
