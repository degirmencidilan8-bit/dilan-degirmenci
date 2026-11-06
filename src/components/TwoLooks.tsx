"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Amp } from "@/components/Corners";
import imageLoader from "@/lib/image-loader";
import { endIntro, markHydrated, pageHydrated } from "@/lib/intro";
import { BONE } from "@/data/palette";

// The first screen: "two looks, one frame" (Batu, 2026-11-05).
//
// DILAN on the left, BATUHAN on the right, a thin gap between. Two frames —
// four hairline corners each, nothing more of a camera — look for their
// picture on their own, small independent moves like two people framing
// the same scene. In about three seconds they meet in the middle and are
// one frame; the ampersand comes up between the names; for a moment the
// two of them, the cut-out from the About page, show in the frame as the
// faintest silhouette. Then the frame's lines open out to the edges of the
// screen and stay there, and the page is at rest: the names, the
// ampersand, a great deal of dark, the way into the work.
//
// Once a session. Skipped at once under reduced motion, or with the button.
// Nothing here stops the corners from being used while it plays.
//
// How it holds still before any script runs: the resting page is the
// default in CSS (.two-looks in globals.css). A one-line script, run as
// the page is parsed, marks <html> data-intro="play" if this is the first
// visit of the session, and the start of the sequence is drawn from that
// — so a second visit never shows the start for a frame, and without
// JavaScript the page is simply at rest. While it plays the values are
// written here, frame by frame, as custom properties on the section.
//
// The opening it replaced, the reel with the name across it, is Opener;
// page.tsx chooses between the two.

const KEY = "db-intro-seen";
const SRC = "/media/about/duo-alt.webp";

/** A frame, in % of the screen: left, top, width, height. */
type Rect = { x: number; y: number; w: number; h: number };

const DESK = {
  a: { x: 5, y: 30, w: 42, h: 38 },
  b: { x: 53, y: 32, w: 42, h: 36 },
  meet: { x: 39, y: 17, w: 22, h: 66 },
  rest: { x: 4, y: 13, w: 92, h: 72 },
};
const PHONE = {
  a: { x: 4, y: 25, w: 70, h: 22 },
  b: { x: 26, y: 53, w: 70, h: 22 },
  meet: { x: 20, y: 24, w: 60, h: 52 },
  rest: { x: 5, y: 14, w: 90, h: 70 },
};

/** The timeline, ms. */
const MEET = 2400; // the two frames are one
const OPEN = 2850; // the frame starts to open out
const OPENED = 3600; // and is at rest
const END = 3800;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

/** The start of the sequence, as CSS: put on the page by DECIDE when the
 * sequence is to play, taken off again when it ends. */
const START = `.two-looks{--ax:5;--ay:30;--aw:42;--ah:38;--bx:53;--by:32;--bw:42;--bh:36;--s:1;--amp:0;--fa:0;--ui:0}.two-looks-skip{display:block}@media (max-width:767px){.two-looks{--ax:4;--ay:25;--aw:70;--ah:22;--bx:26;--by:53;--bw:70;--bh:22}}`;
const STYLE_ID = "two-looks-start";

/** Run as the page is parsed, before it is shown: first visit of the
 * session, and motion allowed, means the sequence plays — its start is
 * put on the page as a stylesheet of its own. (Not a mark on <html>:
 * React would see that as the server's page not matching.) */
const DECIDE = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!sessionStorage.getItem("${KEY}")&&!document.getElementById("${STYLE_ID}")){var s=document.createElement("style");s.id="${STYLE_ID}";s.dataset.intro="1";s.textContent=${JSON.stringify(START)};document.head.appendChild(s)}}catch(e){}`;

/** A frame's search: it settles on a new small offset every half second
 * or so and eases there, so it moves in looks, not in a wobble. */
function searcher(seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s / 2147483647) * 2 - 1;
  };
  const o = { x: 0, y: 0, w: 0, h: 0 };
  const t = { x: 0, y: 0, w: 0, h: 0 };
  let next = 0;
  return (now: number, dt: number) => {
    if (now >= next) {
      next = now + 380 + Math.abs(rand()) * 320;
      t.x = rand() * 2.6;
      t.y = rand() * 2.2;
      t.w = rand() * 2;
      t.h = rand() * 1.8;
    }
    const k = 1 - Math.exp(-dt * 7);
    o.x += (t.x - o.x) * k;
    o.y += (t.y - o.y) * k;
    o.w += (t.w - o.w) * k;
    o.h += (t.h - o.h) * k;
    return o;
  };
}

function Frame({ name }: { name: "a" | "b" }) {
  return (
    <div className={`two-looks-frame two-looks-frame-${name}`}>
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

export function TwoLooks() {
  const section = useRef<HTMLElement>(null);
  // The page as the server sent it (and its first render in the browser),
  // not the homepage put together again on coming back to it.
  const [served] = useState(() => !pageHydrated());
  useEffect(() => markHydrated(), []);
  const frames = useRef<HTMLDivElement>(null);
  const finish = useRef<() => void>(() => {});
  const mask = imageLoader({ src: SRC, width: 768 });

  // The sequence, if this visit plays it.
  useEffect(() => {
    const el = section.current;
    const start = document.getElementById(STYLE_ID);
    if (!el || !start) return;
    // When it began this session. Begun more than a moment ago (the page
    // was left mid-sequence and come back to) it is not played again;
    // begun a moment ago is React mounting the page twice in development.
    let begun = 0;
    try {
      begun = Number(sessionStorage.getItem(KEY)) || 0;
      if (!begun) sessionStorage.setItem(KEY, String(Date.now()));
    } catch {}
    if (begun && Date.now() - begun > 1000) {
      endIntro(start);
      return;
    }

    const L = window.innerWidth < 768 ? PHONE : DESK;
    const look = { a: searcher(7), b: searcher(131) };
    const t0 = performance.now();
    let last = t0;
    let raf = 0;
    let done = false;

    const set = (k: string, v: number) => el.style.setProperty(k, v.toFixed(3));
    const put = (p: string, r: Rect) => {
      set(`--${p}x`, r.x);
      set(`--${p}y`, r.y);
      set(`--${p}w`, r.w);
      set(`--${p}h`, r.h);
    };

    const stop = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      // Hand the page to the resting state in CSS.
      el.removeAttribute("style");
      endIntro(start);
    };
    finish.current = stop;

    const tick = (now: number) => {
      const e = now - t0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Converging: from each name's own frame to the meeting frame, the
      // search dying away as they arrive.
      const p = ease(clamp(e / MEET));
      const calm = 1 - p;
      const ja = look.a(now, dt);
      const jb = look.b(now, dt);
      const shake = (base: Rect, j: { x: number; y: number; w: number; h: number }): Rect => ({
        x: base.x + j.x * calm - (j.w * calm) / 2,
        y: base.y + j.y * calm - (j.h * calm) / 2,
        w: base.w + j.w * calm,
        h: base.h + j.h * calm,
      });
      let a = shake(mix(L.a, L.meet, p), ja);
      let b = shake(mix(L.b, L.meet, p), jb);

      // Opening out, both together now, to rest at the edges.
      const q = ease(clamp((e - OPEN) / (OPENED - OPEN)));
      if (q > 0) {
        a = mix(a, L.rest, q);
        b = mix(b, L.rest, q);
      }
      put("a", a);
      put("b", b);

      set("--s", 1 - ease(clamp((e - 500) / (MEET - 500))));
      set("--amp", ease(clamp((e - (MEET - 150)) / 450)));
      // The two of them: up as the frames meet, gone as the frame opens.
      const up = clamp((e - MEET) / 400);
      const down = clamp((e - (MEET + 450)) / 650);
      set("--sil", 0.1 *Math.sin((Math.PI / 2) * up) * (1 - down));
      set("--fa", lerp(Math.min(0.85, (e / 300) * 0.85), 0.42, q));
      set("--ui", clamp((e - 3000) / 600));

      if (e >= END) {
        stop();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // At rest, with a mouse: the frame leans a few pixels away from the
  // pointer, so the page is not quite still under the hand.
  useEffect(() => {
    const el = frames.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.02 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (document.getElementById(STYLE_ID)) return;
      tx = -((e.clientX / window.innerWidth) * 2 - 1) * 9;
      ty = -((e.clientY / window.innerHeight) * 2 - 1) * 6;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Rendered once on the server, run as the page is parsed; on the
          client it is never rendered again (see DECIDE). */}
      {served ? <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: typeof window === "undefined" ? DECIDE : "" }} /> : null}
      <section ref={section} className="two-looks relative isolate h-svh min-h-[34rem] overflow-hidden">
        {/* The two of them, the faintest silhouette, while the frames are one. */}
        <div
          aria-hidden
          className="two-looks-sil pointer-events-none absolute left-1/2 top-1/2"
          style={{
            background: BONE,
            maskImage: `url(${mask})`,
            WebkitMaskImage: `url(${mask})`,
          }}
        />

        <div ref={frames} aria-hidden className="pointer-events-none absolute inset-0">
          <Frame name="a" />
          <Frame name="b" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: BONE }}>
          <h1
            aria-label="Dilan & Batuhan"
            className="two-looks-names display"
            style={{ ["--dw" as string]: "62", ["--dg" as string]: "900", ["--dt" as string]: "-0.02em" }}
          >
            <span aria-hidden className="two-looks-dilan">
              DILAN
            </span>
            <span aria-hidden className="two-looks-amp">
              <Amp />
            </span>
            <span aria-hidden className="two-looks-batuhan">
              BATUHAN
            </span>
          </h1>
          <Link href="/work" className="two-looks-ui mono mt-8 border-b pb-0.5 md:mt-10" style={{ borderColor: BONE }}>
            Explore work ↗
          </Link>
        </div>

        <button
          type="button"
          onClick={() => finish.current()}
          className="two-looks-skip mono absolute bottom-16 left-1/2 -translate-x-1/2 md:bottom-20"
          style={{ color: BONE, fontSize: "0.6875rem" }}
        >
          Skip intro
        </button>
      </section>
    </>
  );
}
