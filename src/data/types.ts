export type Ratio = "16:9" | "21:9" | "4:5" | "3:4" | "4:3" | "5:8" | "1:1" | "3:2" | "2:3" | "9:16";

/** A single piece of media. `src` is a temporary path — swap it for the real
 * file once delivered; nothing else about the project needs to change. */
export interface MediaRef {
  src: string;
  ratio: Ratio;
  kind: "image" | "video";
  caption?: string;
  /** Video only: a still to show until the first frame has decoded. */
  poster?: string;
}

export interface Credit {
  role: string;
  name: string;
}

/** A curated gallery entry — `size` is the editorial decision for how much
 * weight this image gets, not a layout default:
 *  - "full"   full-bleed, edge-to-edge
 *  - "wide"   large, but contained with margin
 *  - "half"   paired two-up with the next "half" item
 *  - "detail" small, a quiet beat between bigger moments */
export interface GalleryItem extends MediaRef {
  size: "full" | "wide" | "half" | "detail";
}

/** Hand art-directed spread layout — deliberately richer than `GalleryItem`.
 * Each block is one editorial "moment"; the sequence *is* the composition,
 * not a generic grid. Widths/spacing are semantic tokens (not raw
 * percentages) so the same vocabulary reads consistently across projects
 * once more of them adopt this. */
export type SpreadWidth = "xl" | "lg" | "md" | "sm" | "xs";
export type SpreadAlign = "left" | "right" | "center";
export type SpreadSpacing = "none" | "tight" | "normal" | "loose" | "xloose";

export interface SpreadImage {
  src: string;
  ratio: Ratio;
  kind: "image" | "video";
  caption?: string;
}

export type SpreadBlock =
  /** Full-bleed, edge to edge, height-bound (crops sides, not top/bottom) —
   * the one or two moments per project that should dominate the screen. */
  | { type: "bleed"; image: SpreadImage; spacing: SpreadSpacing }
  /** A single image, inset and pushed to one side; the negative space
   * beside it is the point. */
  | {
      type: "solo";
      image: SpreadImage;
      width: SpreadWidth;
      align: SpreadAlign;
      spacing: SpreadSpacing;
    }
  /** A small, isolated beat — a quiet detail with a lot of room around it. */
  | {
      type: "detail";
      image: SpreadImage;
      width: SpreadWidth;
      align: SpreadAlign;
      spacing: SpreadSpacing;
    }
  /** Two images together, asymmetric in width, one pulled up to break the
   * grid alignment between them. */
  | {
      type: "pair";
      a: SpreadImage;
      b: SpreadImage;
      widthA: SpreadWidth;
      widthB: SpreadWidth;
      raised: "a" | "b" | "none";
      spacing: SpreadSpacing;
    };

export interface Project {
  title: string;
  /** What the work was, beside the name (e.g. "Live in Concert"). Kept
   * out of `title` so the display type stays the name alone. */
  subtitle?: string;
  slug: string;
  /** Year, or a range exactly as given (e.g. "2025–2026"). Empty string
   * means the year is still to be confirmed. */
  year: string;
  disciplines: string[];
  /** Agency credit — only set when the project came through one. */
  agency?: string;
  /** Short description — left empty until one is provided. Do not invent
   * copy here; render conditionally wherever this is used. */
  description: string;
  coverImage: MediaRef;
  coverVideo?: MediaRef;
  gallery: GalleryItem[];
  /** Optional hand-composed spread. When present, the project page renders
   * this instead of the generic `gallery` sequence. `gallery` stays intact
   * either way, as the plain source list. */
  editorial?: SpreadBlock[];
  /** Frames grabbed from the project's own films, for a project delivered
   * as video only. Used where the project is shown as pictures (the home
   * field, the Work index) — never added to its gallery. */
  stills?: string[];
  credits: Credit[];
  featured: boolean;
}

export type ArchiveSize = "sm" | "md" | "lg" | "wide" | "tall";

/** Every entry is a real photograph pulled from a real project's own
 * cover/gallery — `category` is the project it came from, not an invented
 * editorial taxonomy. See data/archive.ts. */
export interface ArchiveItem {
  id: string;
  title: string;
  year: string;
  category: string;
  src: string;
  ratio: Ratio;
  size: ArchiveSize;
}

/** Long-form video work — national-brand campaign films and event/stage
 * coverage. A different scale and register from the photography-led Work
 * section, so it gets its own section rather than being folded in. See
 * data/films.ts. */
export interface Film {
  slug: string;
  title: string;
  /** A short label for what kind of film this is — not a fixed taxonomy. */
  type: string;
  /** What the studio did on it, when that was only part of the job (the
   * behind-the-scenes films: the edit, not the shoot). Shown wherever the
   * film is listed, so no one reads it as wholly ours. */
  role?: string;
  /** Empty until confirmed — do not invent. */
  year: string;
  src: string;
  ratio: Ratio;
  /** A frame grabbed from the film itself (public/media/stills), shown
   * wherever the film is listed before anyone presses play. */
  poster?: string;
}

