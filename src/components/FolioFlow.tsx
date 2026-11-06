"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Chapter } from "@/components/BrandTunnel";
import { LightCurtain } from "@/components/LightCurtain";
import { BONE, INK } from "@/data/palette";

// The work after the opening as a folio (Batu, 2026-11-06, from the
// "Folio depth" study ChatGPT drew for them): the brands' pictures as
// prints laid in shallow depth, one behind the other. As the page scrolls
// the print in front grows a little and slips away to the lower right, out
// of the screen, and the next comes forward from the upper left to take
// its place. Nothing turns; the camera does not move. The brand's name
// stands large on the right and changes as one print gives way to the next.
//
// Smaller than the study drew them — a quarter of the screen, not half —
// and in the site's own blacks, not ivory: each print a dark sheet with a
// hairline edge, its number and name small along the bottom.
//
// Plain page elements moved by transform, no 3D scene: nothing to build,
// nothing sent to the graphics card but the pictures themselves. The same
// brands, order and films as the tunnel (page.tsx's TUNNEL); BrandTunnel
// is kept, and page.tsx chooses between the two.

/** Scroll per brand, in screen heights. */
const PER = 0.8;
/** How many prints behind the front one are shown. */
const AHEAD = 3;

type Look = { x: number; y: number; scale: number; alpha: number };

/** Where a print sits, r brands from the front (negative: already past),
 * in % of the stage and a scale. After the study's own figures, the depth
 * a little shallower. */
function place(r: number, phone: boolean): Look {
  // The prints wait up and to the left and leave down and to the right
  // (Batu, 2026-11-06: the study had it the other way round).
  if (phone) {
    if (r >= 0) return { x: 50 - r * 9, y: 57 - r * 7, scale: 1 / (1 + r * 0.3), alpha: Math.max(0, 1 - r * 0.35) };
    return { x: 50 - r * 70, y: 57 - r * 22, scale: 1 - r * 0.35, alpha: Math.max(0, 1 + r * 0.9) };
  }
  if (r >= 0) return { x: 38 - r * 15, y: 50 - r * 11, scale: 1 / (1 + r * 0.3), alpha: Math.max(0, Math.min(1, 1 - r * 0.26)) };
  // On its way out it drops more than it slides, and is gone by the time
  // it would reach the name on the right.
  return { x: 38 - r * 42, y: 50 - r * 58, scale: 1 - r * 0.35, alpha: Math.max(0, Math.min(1, 1 + r * 1.5)) };
}

export function FolioFlow({ chapters }: { chapters: Chapter[] }) {
  const n = chapters.length;
  const section = useRef<HTMLElement>(null);
  const sheets = useRef<(HTMLAnchorElement | null)[]>([]);
  const films = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const html = document.documentElement;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = 0;
    let at = 0;
    let raf = 0;
    let shown = -1;

    const measure = () => {
      const box = el.getBoundingClientRect();
      const run = box.height - window.innerHeight;
      target = run > 0 ? Math.min(1, Math.max(0, -box.top / run)) * (n - 1) : 0;
      // The corner words come forward while the folio holds the screen.
      html.classList.toggle("in-tunnel", box.top <= 1 && box.bottom >= window.innerHeight * 0.5);
    };

    const draw = () => {
      const phone = window.innerWidth < 768;
      sheets.current.forEach((s, i) => {
        if (!s) return;
        const r = i - at;
        const seen = r > -1.4 && r < AHEAD + 0.6;
        s.style.visibility = seen ? "visible" : "hidden";
        if (!seen) return;
        const p = place(r, phone);
        s.style.transform = `translate3d(${p.x}vw, ${p.y}svh, 0) translate(-50%, -50%) scale(${p.scale.toFixed(4)})`;
        s.style.opacity = p.alpha.toFixed(3);
        s.style.zIndex = String(100 - i);
        // Only the print in front can be pressed.
        s.style.pointerEvents = Math.abs(r) < 0.35 ? "auto" : "none";
        // Its film, if it has one: fetched as it comes near, playing while
        // it is in front.
        const v = films.current[i];
        if (v) {
          if (Math.abs(r) < 1.5 && !v.src) v.src = v.dataset.src ?? "";
          if (Math.abs(r) < 0.5) {
            if (v.paused && !still) v.play().catch(() => {});
          } else if (!v.paused) v.pause();
        }
      });
      const k = Math.max(0, Math.min(n - 1, Math.round(at)));
      if (k !== shown) {
        shown = k;
        setActive(k);
      }
    };

    const tick = () => {
      const d = target - at;
      at = still || Math.abs(d) < 0.0005 ? target : at + d * 0.12;
      draw();
      raf = Math.abs(target - at) > 0.0005 ? requestAnimationFrame(tick) : 0;
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    measure();
    at = target;
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      html.classList.remove("in-tunnel");
    };
  }, [n]);

  const c = chapters[active];
  const pad = (k: number) => String(k).padStart(2, "0");

  return (
    <section
      ref={section}
      aria-label="Work"
      data-explore-target
      className="relative"
      style={{ height: `${(n - 1) * PER * 100 + 100}svh`, background: INK }}
    >
      <div className="sticky top-0 h-svh overflow-hidden" style={{ color: BONE }}>
        <LightCurtain tint={undefined} className="pointer-events-none absolute inset-0 opacity-60" />
        <div aria-hidden className="tunnel-grain pointer-events-none absolute inset-0" />

        {/* The prints. */}
        <div className="absolute inset-0">
          {chapters.map((ch, i) => (
            <Link
              key={ch.href}
              href={ch.href}
              ref={(a) => {
                sheets.current[i] = a;
              }}
              aria-label={`${ch.title} — ${ch.sub}`}
              tabIndex={i === active ? 0 : -1}
              className="folio-sheet"
              style={{ visibility: i < AHEAD + 1 ? "visible" : "hidden" }}
            >
              <span className="folio-picture">
                <Image src={ch.hero} alt="" fill sizes="(max-width: 768px) 60vw, 26vw" className="object-cover" />
                {ch.video ? (
                  <video
                    ref={(v) => {
                      films.current[i] = v;
                    }}
                    data-src={ch.video}
                    muted
                    loop
                    playsInline
                    preload="none"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
              </span>
              <span className="folio-caption mono">
                <span>
                  {pad(i + 1)} / {ch.title}
                </span>
              </span>
            </Link>
          ))}
        </div>

        {/* The brand in front: its name large, what was done, the way in. */}
        <div className="folio-title pointer-events-none absolute z-[200]">
          <p className="mono opacity-55" style={{ fontSize: "0.6875rem" }}>
            {pad(active + 1)} / {pad(n)}
          </p>
          <h2
            key={c.href}
            className="folio-name display mt-4 leading-[0.86]"
            style={{ ["--dw" as string]: "62", ["--dg" as string]: "900", ["--dt" as string]: "-0.02em" }}
          >
            {c.title}
          </h2>
          <p className="mono mt-4 opacity-70" style={{ fontSize: "0.6875rem" }}>
            {c.sub}
          </p>
          <Link href={c.href} className="mono pointer-events-auto mt-6 inline-block border-b pb-0.5" style={{ fontSize: "0.75rem", borderColor: BONE }}>
            View project →
          </Link>
          {active === n - 1 ? (
            <Link href="/work" className="mono pointer-events-auto ml-6 mt-6 inline-block border-b pb-0.5" style={{ fontSize: "0.75rem", borderColor: BONE }}>
              Explore Work ↗
            </Link>
          ) : null}
        </div>

        {/* Where in the folio: a hairline, the brands' numbers, the one in
            front marked. */}
        <div className="folio-progress mono pointer-events-none absolute z-[200]" aria-hidden>
          {chapters.map((ch, i) => (
            <span key={ch.href} className={i === active ? "is-on" : ""}>
              {pad(i + 1)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
