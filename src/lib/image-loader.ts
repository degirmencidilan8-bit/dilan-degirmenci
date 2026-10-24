"use client";

import manifest from "@/data/image-manifest.json";

// Every next/image on the site resolves through here (see `loaderFile` in
// next.config.ts). It answers a (src, width) request with one of the files
// scripts/images.mjs built ahead of time, rather than asking a server to
// resize the original on demand.

interface Entry {
  /** Content hash of the source file — the derivative's filename stem. */
  h: string;
  w: number;
  ht: number;
  /** Colour widths that exist, ascending. */
  s: number[];
  /** Greyscale widths that exist, ascending. */
  g: number[];
}

const ENTRIES = manifest as Record<string, Entry>;

// The data files write some paths percent-encoded (a Turkish ı, a space)
// and the manifest is keyed by the decoded path, so both spellings of the
// same file land on the same entry.
function lookup(src: string): Entry | undefined {
  const path = src.split("?")[0];
  try {
    return ENTRIES[decodeURIComponent(path)];
  } catch {
    // A malformed escape is not a reason to throw during render.
    return ENTRIES[path];
  }
}

// The smallest file that is at least as wide as what was asked for. When
// the photograph itself is narrower than the request, its largest — never
// an upscale, there is nothing to gain from one.
function pick(widths: number[], width: number) {
  return widths.find((w) => w >= width) ?? widths[widths.length - 1];
}

// A file that is not in the manifest — a placeholder path whose photograph
// has not been delivered yet, or something added without rerunning the
// script — is served as it is. The width goes on as a query so next/image
// can tell the loader took it into account; without that it warns on every
// render.
function passthrough(src: string, width: number) {
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}

export default function imageLoader({ src, width }: { src: string; width: number }) {
  const e = lookup(src);
  if (!e || e.s.length === 0) return passthrough(src, width);
  return `/_img/${e.h}-${pick(e.s, width)}.webp`;
}

/** The monochrome set, for the wall that stands behind the homepage band.
 * Passed as the `loader` prop on those images only. */
export function greyLoader({ src, width }: { src: string; width: number }) {
  const e = lookup(src);
  if (!e || e.g.length === 0) return imageLoader({ src, width });
  return `/_img/${e.h}-g${pick(e.g, width)}.webp`;
}

/** Whether a real, measured photograph stands behind this path. */
export function hasImage(src: string) {
  return Boolean(lookup(src));
}
