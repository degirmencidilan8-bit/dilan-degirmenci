import manifest from "./image-manifest.json";
import { filmSub, films } from "./films";
import { NO_PHOTOS_YET, getProjectBySlug } from "./projects";
import { ORDER, frameFor } from "./work-index";

// The opening page's field: every project as one small frame, set loose
// across the page in a pattern of two per row, and each frame holding the
// project's own set of pictures to cut through when it is looked at.
//
// Taken from Webber's opening (webberrepresents.com): a white field of
// small pictures at one common height and their own widths, the name huge
// across the middle. What is this studio's own: the name in Archivo at its
// narrowest and heaviest rather than a light grotesk, and the pictures cut
// hard from one to the next — the edit, not a slideshow.

export interface FieldFrame {
  src: string;
  /** Width over height, measured from the file. */
  ratio: number;
  pos?: string;
}

export interface FieldSlot {
  key: string;
  /** Absent for a loose frame: a picture that belongs to the opening page
   * only, not to any project, so it leads nowhere and carries no name. */
  href?: string;
  title?: string;
  sub?: string;
  frames: FieldFrame[];
}

// Pictures shown on the opening page only — the studio's own red set, not
// opened as a brand anywhere on the site. Each sits loose in the field on
// its own, and looked at, cuts through the whole red set starting from
// itself.
const LOOSE = [
  "/media/opening/red-03-bag.webp",
  "/media/opening/red-01-martini.jpg",
  "/media/opening/red-05-tulle.webp",
  "/media/opening/red-02-pour.webp",
  "/media/opening/red-04-silhouette.webp",
];
/** Where each loose frame goes in the run of project frames: before the
 * slot at this index. The first lands on the opening screen. */
const LOOSE_AT = [1, 4, 9, 14, 20];

const ENTRIES = manifest as Record<string, { w: number; ht: number }>;
const MAX_FRAMES = 9;

function measure(src: string, pos?: string): FieldFrame | null {
  let key = src;
  try {
    key = decodeURIComponent(src);
  } catch {}
  const e = ENTRIES[key];
  if (!e) return null;
  return { src, ratio: e.w / e.ht, pos };
}

/** A film's stills are the files that share its poster's name stem
 * (gustav-0.jpg, gustav-1.jpg …), poster first. */
function filmFrames(poster: string): FieldFrame[] {
  const stem = poster.replace(/-\d+\.jpg$/, "-");
  const rest = Object.keys(ENTRIES)
    .filter((k) => k.startsWith(stem) && k !== poster && /-\d+\.jpg$/.test(k))
    .sort();
  return [poster, ...rest].map((s) => measure(s)).filter((f): f is FieldFrame => f !== null);
}

export function getField(): FieldSlot[] {
  const slots = projectSlots();
  const red = LOOSE.map((s) => measure(s)).filter((f): f is FieldFrame => f !== null);
  // Insert from the back so the earlier indices stay where they were meant.
  red
    .map((_, k) => k)
    .reverse()
    .forEach((k) => {
      const frames = [...red.slice(k), ...red.slice(0, k)];
      slots.splice(Math.min(LOOSE_AT[k] ?? slots.length, slots.length), 0, { key: `loose-${k}`, frames });
    });
  return slots;
}

function projectSlots(): FieldSlot[] {
  return ORDER.flatMap(({ kind, slug }): FieldSlot[] => {
    if (kind === "film") {
      const f = films.find((x) => x.slug === slug);
      if (!f?.poster) return [];
      const frames = filmFrames(f.poster).slice(0, MAX_FRAMES);
      return frames.length ? [{ key: `film-${slug}`, href: `/films/${slug}`, title: f.title, sub: filmSub(f), frames }] : [];
    }
    const p = getProjectBySlug(slug);
    if (!p || NO_PHOTOS_YET.has(slug)) return [];
    const lead = frameFor(slug);
    const srcs = [
      ...(lead ? [{ src: lead.img, pos: lead.pos }] : []),
      ...(p.stills ?? []).map((src) => ({ src, pos: undefined })),
      ...p.gallery.filter((m) => m.kind === "image").map((m) => ({ src: m.src, pos: undefined })),
      { src: p.coverImage.src, pos: undefined },
    ];
    const frames = srcs
      .filter((s, k) => srcs.findIndex((x) => x.src === s.src) === k)
      .map((s) => measure(s.src, s.pos))
      .filter((f): f is FieldFrame => f !== null)
      .slice(0, MAX_FRAMES);
    return frames.length
      ? [{ key: `project-${slug}`, href: `/work/${slug}`, title: p.title, sub: p.disciplines.join(" / "), frames }]
      : [];
  });
}
