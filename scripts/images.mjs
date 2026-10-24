// Builds the responsive derivatives every photograph on the site is served
// from, and the manifest that tells the image loader which ones exist.
//
// Why this exists. The homepage was measured at 11.5 MB on first load: the
// band's covers went out as the original exports — one PNG alone was
// 2.7 MB — because they were plain <img> tags pointing at /media. On
// localhost that is invisible. On a phone it is fifteen to twenty-five
// seconds before the first impression, and an impression that arrives
// after twenty seconds is not one.
//
// Why prebuilt files rather than Next's on-demand optimizer. Prebuilt
// derivatives are plain static files: they work on any host, they cost
// nothing at request time, and the first visitor does not pay for the
// resize. The optimizer needs a running Next server and makes whoever
// arrives first wait while a 2.7 MB PNG is decoded.
//
// It is incremental — a derivative that already exists is not rebuilt —
// and it runs before `dev` and `build`, so dropping a new photograph into
// public/media is still all anyone has to do.
//
// Derivatives are named by the hash of the SOURCE FILE'S CONTENT. Replace a
// photograph under the same filename and its derivatives get new names, so
// a browser that cached the old ones cannot go on showing them.

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "public", "media");
const OUT_DIR = path.join(ROOT, "public", "_img");
const MANIFEST = path.join(ROOT, "src", "data", "image-manifest.json");

// Must match `deviceSizes` + `imageSizes` in next.config.ts exactly. Those
// two lists are the widths next/image asks the loader for; if a width is
// requested that was never built, the loader has to answer with a
// different file than the one the srcset claims.
const WIDTHS = [160, 320, 480, 640, 1024, 1600, 2400];

// Two places draw photographs in monochrome and neither does it with a CSS
// filter: the wall behind the homepage band, and the strips on the Work
// index (grey at rest, colour laid over the top when a row is in focus).
// Baking the grey in means no filter running across dozens of moving
// images, a colour change that is a plain opacity fade, and roughly a
// quarter fewer bytes than the colour file at the same size.
const GREY_WIDTHS = [160, 320, 480, 640, 1024];

// Tiles used as CSS backgrounds, not photographs.
const SKIP_DIRS = new Set(["texture"]);
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  // A host without sharp must not fail the build over it: the manifest and
  // the derivatives from the last run are still valid.
  if (existsSync(MANIFEST)) {
    console.warn("[images] sharp is not available — keeping the existing derivatives.");
    process.exit(0);
  }
  console.error("[images] sharp is not available and there is no manifest to fall back on.");
  process.exit(1);
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) out.push(...(await walk(path.join(dir, e.name))));
    } else if (EXT.has(path.extname(e.name).toLowerCase())) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

await mkdir(OUT_DIR, { recursive: true });

const files = (await walk(SRC_DIR)).sort();
const manifest = {};
const wanted = new Set();
let built = 0;
let srcBytes = 0;

for (const file of files) {
  const buf = await readFile(file);
  srcBytes += buf.length;
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 12);

  const meta = await sharp(buf).metadata();
  // EXIF orientations 5–8 are the sideways ones: the stored pixels are
  // rotated, so the true width is the stored height.
  const turned = (meta.orientation ?? 1) >= 5;
  const w = turned ? meta.height : meta.width;
  const h = turned ? meta.width : meta.height;
  if (!w || !h) {
    console.warn(`[images] unreadable, skipped: ${path.relative(ROOT, file)}`);
    continue;
  }

  // Never upscale. The top of the ladder is the photograph's own width (or
  // 2400, whichever is smaller), so a source that falls between two rungs
  // is not thrown away down to the rung beneath it.
  const top = Math.min(w, WIDTHS[WIDTHS.length - 1]);
  const sizes = [...new Set([...WIDTHS.filter((x) => x < top), top])];
  const grey = GREY_WIDTHS.filter((x) => x <= top);

  const jobs = [
    ...sizes.map((x) => ({ x, grey: false, name: `${hash}-${x}.webp` })),
    ...grey.map((x) => ({ x, grey: true, name: `${hash}-g${x}.webp` })),
  ];

  for (const job of jobs) {
    wanted.add(job.name);
    const dest = path.join(OUT_DIR, job.name);
    if (existsSync(dest)) continue;

    // .rotate() with no argument applies the EXIF orientation and then
    // drops the tag, so the derivative is upright on its own.
    let img = sharp(buf).rotate().resize({ width: job.x, withoutEnlargement: true });
    if (job.grey) img = img.greyscale();
    await img
      .webp({
        // Small frames sit behind other things or pass quickly; the large
        // ones are what someone actually looks at.
        quality: job.grey ? 62 : job.x >= 1024 ? 80 : 76,
        effort: 5,
        smartSubsample: true,
      })
      .toFile(dest);
    built++;
  }

  // Keyed by the URL path as a browser would decode it. The data files
  // write some of these percent-encoded (a Turkish ı, a space), and the
  // loader decodes before it looks anything up.
  const key = "/" + path.relative(path.join(ROOT, "public"), file).split(path.sep).join("/");
  manifest[key] = { h: hash, w, ht: h, s: sizes, g: grey };
}

// Anything left over belongs to a photograph that was removed or replaced.
let removed = 0;
for (const name of await readdir(OUT_DIR)) {
  if (!wanted.has(name)) {
    await rm(path.join(OUT_DIR, name));
    removed++;
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 1) + "\n", "utf8");

let outBytes = 0;
for (const name of wanted) outBytes += (await stat(path.join(OUT_DIR, name))).size;

const mb = (n) => (n / 1048576).toFixed(1);
console.log(
  `[images] ${files.length} sources (${mb(srcBytes)} MB) -> ${wanted.size} derivatives (${mb(outBytes)} MB)` +
    `  built ${built}, removed ${removed}`,
);
