"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LightCurtain } from "@/components/LightCurtain";
import { BONE, INK } from "@/data/palette";
import { EXPLORE, INTRO_DONE, introPlaying } from "@/lib/intro";

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
// nothing sent to the graphics card but the pictures themselves. The
// brands, their order and their films are page.tsx's TUNNEL list.

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

/** One brand in the folio: its name, what was done, its page, its
 * picture, a film to play in its place, and a few more pictures. */
export interface Chapter {
  title: string;
  sub: string;
  href: string;
  hero: string;
  /** A film to play in place of the hero picture. */
  video?: string;
  sats: string[];
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

  // On the way down, the large name over the opening becomes the small one
  // at the top centre of every page (Batu, 2026-11-07): it shrinks and
  // rises into that place as the page comes down into the folio, and the
  // real one (Corners, hidden on the homepage until then) takes over as it
  // arrives. The opening's frame clips what leaves it, so what moves is a
  // copy of the name, fixed to the screen; the name itself is hidden while
  // the copy is out. Moved by transform alone, from the scroll, so it costs
  // nothing between frames. On a phone the name, three lines tall, would
  // only distort into a one-line mark, so there it simply fades into it.
  useEffect(() => {
    const el = section.current;
    const name = document.querySelector<HTMLElement>(".cards-intro-names");
    const small = document.querySelector<HTMLElement>("[data-corner-name]");
    if (!el || !name || !small) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const smooth = (a: number, b: number, v: number) => {
      const t = clamp((v - a) / (b - a));
      return t * t * (3 - 2 * t);
    };

    // The copy: the name's own markup, fixed, off until the page moves.
    const holder = document.createElement("div");
    holder.setAttribute("aria-hidden", "true");
    Object.assign(holder.style, {
      position: "fixed",
      left: "0",
      top: "0",
      zIndex: "45",
      pointerEvents: "none",
      transformOrigin: "0 0",
      visibility: "hidden",
      color: getComputedStyle(name).color,
      willChange: "transform, opacity",
    });
    const copy = name.cloneNode(true) as HTMLElement;
    copy.removeAttribute("aria-label");
    holder.appendChild(copy);
    document.body.appendChild(holder);

    // Where the name sits on the page (not the screen), and where its
    // letters are within it — measured with nothing moved.
    let box = { left: 0, top: 0, width: 0, height: 0 };
    let ink = { x: 0, y: 0, width: 0 };
    const measure = () => {
      const r = name.getBoundingClientRect();
      const a = name.querySelector(".cards-intro-dilan")?.getBoundingClientRect() ?? r;
      const b = name.querySelector(".cards-intro-batuhan")?.getBoundingClientRect() ?? r;
      // Where it stands on the screen with the page at the top.
      box = { left: r.left, top: r.top + window.scrollY, width: r.width, height: r.height };
      ink = { x: (a.left + b.right) / 2 - r.left, y: r.height / 2, width: b.right - a.left };
      holder.style.width = `${r.width}px`;
      holder.style.height = `${r.height}px`;
    };

    const update = () => {
      if (introPlaying()) return;
      const p = clamp(window.scrollY / Math.max(1, el.offsetTop));
      const phone = window.innerWidth < 768;
      // The copy is in the small name's place and size by LAND of the way
      // down; there the real one takes over at once, the two the same, so
      // they are never seen as two. (Crossfading while the copy was still
      // larger showed a double name.)
      const LAND = 0.88;
      const handover = smooth(LAND, LAND + 0.05, p);
      small.style.opacity = p > 0 ? handover.toFixed(3) : "0";
      small.style.pointerEvents = handover > 0.5 ? "auto" : "none";
      small.tabIndex = handover > 0.5 ? 0 : -1;
      if (p <= 0 || phone || still) {
        holder.style.visibility = "hidden";
        name.style.opacity = phone && p > 0 ? (1 - smooth(0, 0.6, p)).toFixed(3) : "";
        return;
      }
      // From where the name stood on the screen to the small name's place
      // and size, straight, on the page's own descent. (Following the
      // name up with the page first carried it off the top of the screen
      // and back down.)
      // The scale moves by equal ratios, not equal steps, so the name
      // shrinks evenly to the eye rather than slowly and then all at once.
      const q = clamp(p / LAND);
      const t = small.getBoundingClientRect();
      const s = Math.pow(t.width / ink.width, q);
      const fromX = box.left + ink.x;
      const fromY = box.top + ink.y;
      const toX = t.left + t.width / 2;
      const toY = t.top + t.height / 2;
      const x = fromX + (toX - fromX) * q;
      const y = fromY + (toY - fromY) * q;
      holder.style.transform = `translate3d(${(x - s * ink.x).toFixed(2)}px, ${(y - s * ink.y).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
      holder.style.opacity = (1 - handover).toFixed(3);
      holder.style.visibility = "visible";
      name.style.opacity = "0";
    };

    measure();
    update();
    const onResize = () => {
      const was = name.style.opacity;
      name.style.opacity = "";
      measure();
      name.style.opacity = was;
      update();
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener(INTRO_DONE, onResize);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      window.removeEventListener(INTRO_DONE, onResize);
      holder.remove();
      name.style.opacity = "";
      small.style.opacity = "";
      small.style.pointerEvents = "";
    };
  }, []);

  // The run to the work (Batu, 2026-11-07). The folio cannot be scrolled:
  // the visitor's first move down from the opening — a wheel, a swipe, a
  // key, or Explore Work — sets it going, and from then on it plays by
  // itself. The page goes slowly down into the folio and comes in to land
  // on the first brand softly, the last stretch drawn out; a breath there;
  // then the work begins to pass, setting off gently, quickest in the
  // middle, easing to a stop on the last brand; and the page goes on to
  // Work. While it plays the page's own scrolling is held. Every time the
  // homepage is come to it starts again from the top.
  //
  // Next mounts the page's effects, takes them down and puts them up again
  // as it settles, so the run under way is kept in a ref and picks up in
  // step if that happens mid-way.
  const router = useRouter();
  const go = useRef(router);
  useEffect(() => {
    go.current = router;
  }, [router]);
  const running = useRef<{ from: number; top: number; end: number; t0: number; run: number } | null>(null);
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const DOWN_MS = 3200; // down from the opening into the folio
    // The first brand, at rest, before the work moves (Batu, 2026-11-07).
    // The landing's last slow stretch adds a little to it.
    const BREATH_MS = 100;
    const RUN_MS = 8500; // the work passing, first brand to last (Batu, 2026-11-07)
    const HOLD_MS = 450; // on the last brand, before Work
    // Smootherstep: no speed at either end, the most in the middle.
    const curve = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    // The way down: the same, with its time bent so the landing is drawn
    // out — most of the distance early, the last of it slow.
    const land = (t: number) => curve(1 - Math.pow(1 - t, 1.4));
    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    // Always from the top: the browser does not put the scroll back.
    const restore = history.scrollRestoration;
    history.scrollRestoration = "manual";
    if (!running.current && window.scrollY > 0) window.scrollTo({ top: 0, behavior: "instant" });

    let stopped = false;
    let raf = 0;
    let timer = 0;
    let queued = false;

    const step = (now: number) => {
      const p = running.current;
      if (stopped || !p) return;
      const e = now - p.t0;
      let y: number;
      if (e < DOWN_MS) y = p.from + (p.top - p.from) * land(clamp(e / DOWN_MS));
      else if (e < DOWN_MS + BREATH_MS) y = p.top;
      else y = p.top + (p.end - p.top) * curve(clamp((e - DOWN_MS - BREATH_MS) / p.run));
      // "instant": the page is smooth-scrolled in globals.css, and every
      // frame of this would otherwise start a smooth scroll of its own.
      window.scrollTo({ top: y, behavior: "instant" });
      if (e >= DOWN_MS + BREATH_MS + p.run) {
        timer = window.setTimeout(() => {
          running.current = null;
          go.current.push("/work");
        }, HOLD_MS);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (running.current || stopped) return;
      if (introPlaying()) {
        queued = true;
        return;
      }
      const top = el.offsetTop;
      const end = el.offsetTop + el.offsetHeight - window.innerHeight;
      const run = RUN_MS;
      running.current = { from: window.scrollY, top, end, t0: performance.now(), run };
      // Explore Work goes in a flash as the page sets off (globals.css).
      document.querySelector(".cards-intro-more")?.classList.add("is-flash");
      raf = requestAnimationFrame(step);
    };
    const onIntroDone = () => {
      if (queued) start();
    };

    // The page's own scrolling, held: a move down starts the run, and
    // nothing moves the page by hand while it plays.
    const hold = (e: Event) => {
      if (e.cancelable) e.preventDefault();
    };
    const onWheel = (e: WheelEvent) => {
      hold(e);
      if (e.deltaY > 0) start();
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      hold(e);
      if (touchY - (e.touches[0]?.clientY ?? touchY) > 8) start();
    };
    const KEYS = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "End", "Home"];
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (!KEYS.includes(e.key)) return;
      hold(e);
      if (["ArrowDown", "PageDown", " ", "End"].includes(e.key)) start();
    };
    // Explore Work, under the names, asks for the run (see CardOpening).
    const onExplore = (e: Event) => {
      e.preventDefault();
      start();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener(EXPLORE, onExplore);
    window.addEventListener(INTRO_DONE, onIntroDone);
    // Taken down mid-run (Next settling the page): carry on in step.
    if (running.current) raf = requestAnimationFrame(step);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EXPLORE, onExplore);
      window.removeEventListener(INTRO_DONE, onIntroDone);
      history.scrollRestoration = restore;
    };
  }, []);

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
