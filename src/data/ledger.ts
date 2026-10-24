import { films } from "./films";
import { NO_PHOTOS_YET } from "./home";
import { profile } from "./profile";
import { projects } from "./projects";

// The four numbers the studio can actually stand behind.
//
// Every one of them is counted out of the data at build time. None is
// typed in. This is not tidiness — the Archive already shipped a headline
// claiming 87 frames when the truth was 83, because the number was a
// string next to a list it had stopped matching. A portfolio's numbers are
// the one place a visitor can catch the site lying, so they are derived or
// they are not shown.
//
// They are also deliberately NOT inflated. Seventeen brands is a real
// seventeen; the register this section is set in — a drawer index, not a
// dashboard — is what makes a small precise number read as credible
// instead of thin. A "500+" here would be the first dishonest thing on
// the site.

export interface LedgerEntry {
  /** Index, shown small and mono above the number. */
  code: string;
  label: string;
  value: number;
}

// Brands are deduped by slug, because a brand can appear in both lists:
// ARKADAŞ BASIM is a photographed project AND a company film, and it is
// one client either way.
//
// This works only because that film carries the project's own slug. A
// future film for a brand already in projects.ts must do the same, or it
// will be counted twice — there is no name matching here on purpose,
// since "GUSTAV" and "Gustav Ankara" would defeat it anyway.
function countBrands(): number {
  const slugs = new Set<string>(projects.map((p) => p.slug));
  for (const f of films) slugs.add(f.slug);
  return slugs.size;
}

// Stills only, deduped by path, and skipping projects whose media is still
// placeholder paths — a frame that 404s is not a frame in the archive.
// Films are counted as case files below, not as frames; a film is not 2400
// frames in any sense a client means.
function countFrames(): number {
  const seen = new Set<string>();
  for (const p of projects) {
    if (NO_PHOTOS_YET.has(p.slug)) continue;
    for (const m of [p.coverImage, ...p.gallery]) {
      if (m.kind === "image") seen.add(m.src);
    }
  }
  return seen.size;
}

export const LEDGER: LedgerEntry[] = [
  { code: "01", label: "Brands on file", value: countBrands() },
  // Photographed projects plus films. ARKADAŞ BASIM is one brand (above)
  // but two case files, which is the honest reading: the print house was
  // shot and then filmed, and those were two jobs.
  { code: "02", label: "Case files", value: projects.length + films.length },
  { code: "03", label: "Frames archived", value: countFrames() },
  // Pulled from `profile.how`, where the studio already lists them in its
  // own words. Not an invented taxonomy — if that sentence changes, this
  // list is what has to change with it.
  { code: "04", label: "Sectors", value: profile.sectors.length },
];
