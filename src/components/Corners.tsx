"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FEATURE_SLUGS } from "@/data/features";
import { profile } from "@/data/profile";
import { BONE, INK, RED } from "@/data/palette";

// The site's whole navigation: four words in the four corners of the
// screen, and on every page but the opening one the studio's name, small,
// top centre. Fixed — pages move underneath it, it does not move.
//
// Taken from Pulse Films, whose structure this site now follows: nothing
// is more confident than a frame with almost nothing on it. The words are
// in the technical face, never a serif, and the only colour is the
// safelight red under the page you are on.
//
// Films are not a corner of their own. They live inside Work as one of its
// filters, because to anyone hiring the studio films and photographs are
// one body of work. The Archive had a corner until it was taken out: it
// showed the same photographs as Work, a second way into one body of work.
// Its place goes to the studio's Instagram, the one link out.

const LINKS = [
  { href: "/work", label: "Work", corner: "left-5 top-4 md:left-8 md:top-6" },
  { href: "/about", label: "About", corner: "right-5 top-4 md:right-8 md:top-6" },
  { href: profile.instagram.url, label: "Instagram", corner: "bottom-4 left-5 md:bottom-6 md:left-8", external: true },
  { href: "/contact", label: "Contact", corner: "bottom-4 right-5 md:bottom-6 md:right-8" },
];

/** Pages set on the light ground: the index of work, and the projects
 * written up as features — photography is set on paper. */
export function isLightPage(pathname: string) {
  if (pathname === "/work") return true;
  const m = pathname.match(/^\/work\/([^/]+)$/);
  return Boolean(m && FEATURE_SLUGS.has(decodeURIComponent(m[1])));
}

function isActive(pathname: string, href: string) {
  if (href === "/work") return pathname.startsWith("/work") || pathname.startsWith("/films");
  return pathname.startsWith(href);
}

export function Corners() {
  const pathname = usePathname();
  const light = isLightPage(pathname);
  const fg = light ? INK : BONE;
  const home = pathname === "/";

  // A band of the page's own ground behind the words, top and bottom, so
  // nothing that scrolls underneath is ever read through them — measured on
  // a project page, its own sentence ran straight under the name.
  const ground = light ? "235,230,218" : "12,12,11";

  return (
    <nav aria-label="Main">
      {(
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 z-40 h-16 md:h-20"
            style={{ background: `linear-gradient(180deg, rgba(${ground},0.94) 0%, rgba(${ground},0.7) 55%, rgba(${ground},0) 100%)` }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-14 md:h-16"
            style={{ background: `linear-gradient(0deg, rgba(${ground},0.94) 0%, rgba(${ground},0.6) 55%, rgba(${ground},0) 100%)` }}
          />
        </>
      )}
      {LINKS.map((l) => {
        if (l.external) {
          return (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`corner-word fixed z-50 ${l.corner}`}
              style={{ color: fg }}
            >
              {l.label}
            </a>
          );
        }
        const on = isActive(pathname, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? "page" : undefined}
            className={`corner-word fixed z-50 ${l.corner}`}
            style={{
              color: fg,
              borderBottomColor: on ? RED : "transparent",
            }}
          >
            {l.label}
          </Link>
        );
      })}
      {home ? null : (
        <Link
          href="/"
          aria-label="Dilan & Batuhan — home"
          className="display fixed left-1/2 top-3 z-50 -translate-x-1/2 whitespace-nowrap text-[1.25rem] leading-none md:top-5 md:text-[1.6rem]"
          style={{
            color: fg,
            ["--dw" as string]: "62",
            ["--dg" as string]: "900",
            ["--dt" as string]: "-0.01em",
          }}
        >
          DILAN<Amp />BATUHAN
        </Link>
      )}
    </nav>
  );
}

/** The ampersand in the studio's name, drawn from the light wide end of the
 * family. In the narrow heavy cut either side of it the glyph closes up
 * into something that reads as an 8; set like this it reads as what it
 * is, at any size. */
export function Amp() {
  return (
    <span
      className="inline-block"
      style={{ fontVariationSettings: '"wdth" 125, "wght" 200', margin: "0 0.04em" }}
    >
      &amp;
    </span>
  );
}
