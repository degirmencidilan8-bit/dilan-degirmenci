"use client";

import { useEffect, useRef, useState } from "react";
import { Amp } from "@/components/Corners";
import imageLoader from "@/lib/image-loader";
import { EXPLORE, endIntro, markHydrated, pageHydrated } from "@/lib/intro";
import { irisBlades } from "@/lib/iris";
import { BONE } from "@/data/palette";

// The first screen, as two cards (Batu, 2026-11-05).
//
// Two cards come up face down, a large iris on their backs, and turn over
// — a few times, each in its own time — showing the card the studio
// designed for each of them, under a holographic foil: a rainbow that
// slides as the card turns, and a band of light across it the way it
// crosses them on the About page. Then the two cards come towards each
// other, fading as they do, and are gone before they touch; light comes
// up in the gap between them, and each name comes in from where its card
// was: DILAN & BATUHAN, a great deal of dark, and under them "Explore Work"
// and an arrow down into the tunnel. No frame lines.
//
// Once a session; skipped at once under reduced motion, or with the
// button. Nothing here stops the corners from being used while it plays.
//
// The page at rest is the default in CSS (.cards-intro in globals.css), so
// a second visit, reduced motion or no JavaScript shows it straight away.
// A one-line script run as the page is parsed puts the start of the
// sequence on the page as a stylesheet of its own if this is the first
// visit of the session; while it plays the values are written inline,
// frame by frame, as custom properties on the section.

const KEY = "db-intro-cards";
const CARDS = {
  dilan: "/media/about/card-dilan.webp",
  batuhan: "/media/about/card-batuhan.webp",
};

/** The timeline, ms. */
const IN = 350; // the cards are up
const FLIP = [
  { from: 300, to: 2250 },
  { from: 480, to: 2420 },
];
const TURNS = 540; // degrees: face down, up, down, up
// The two come together and are gone before they touch: they never cross
// over each other (Batu, 2026-11-06). Light comes up in the gap as it
// closes, and the names come up out of it.
const MEET = { from: 2350, to: 3000 }; // the gap between them closes
const GONE = { from: 2450, to: 2980 }; // and they fade as it does
const FLASH = 2920;
const NAMES = { from: 2880, to: 3550 };
// The ampersand comes into focus after the names have (Batu, 2026-11-06).
const AMP_FOCUS = { from: 3300, to: 3950 };
const END = 4050;
/** How much of the names shows from the first moment: a trace. */
const TRACE = 0.07;

const START = `.cards-intro{--co:0;--rise:1;--ra:0;--rb:0;--cx:1;--flash:0;--names:${TRACE};--s:1;--amp:${TRACE};--ampblur:1;--ui:0}.cards-intro-skip{display:block}`;
const STYLE_ID = "cards-intro-start";

/** Run as the page is parsed, before it is shown: first visit of the
 * session, and motion allowed, means the sequence plays. */
const DECIDE = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!sessionStorage.getItem("${KEY}")&&!document.getElementById("${STYLE_ID}")){var s=document.createElement("style");s.id="${STYLE_ID}";s.dataset.intro="1";s.textContent=${JSON.stringify(START)};document.head.appendChild(s)}}catch(e){}`;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2);
const span = (e: number, r: { from: number; to: number }) => clamp((e - r.from) / (r.to - r.from));

/** The iris on the back of the cards, in a 100-unit box. */
const BACK_IRIS = irisBlades(17, 0.35, 40);

function Card({ side, src }: { side: "a" | "b"; src: string }) {
  return (
    <div className={`cards-intro-card cards-intro-card-${side}`}>
      {/* Face down: a large iris, a hairline border, a fine foil. */}
      <div className="cards-intro-face cards-intro-back">
        <span className="cards-intro-holo" />
        <svg className="cards-intro-iris" viewBox="-50 -50 100 100">
          <circle r="45.5" fill="none" stroke="#ebe6da" strokeWidth="1.1" />
          <path d={BACK_IRIS} fill="#ebe6da" fillOpacity="0.9" stroke="#121211" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Face up: the card the studio designed for each of them (Batu,
          2026-11-05), under the foil and a band of light. */}
      <div className="cards-intro-face cards-intro-front">
        {/* eslint-disable-next-line @next/next/no-img-element -- the prebuilt derivative from the loader, turned in 3D */}
        <img src={src} alt="" draggable={false} className="cards-intro-art" />
        <span className="cards-intro-holo" />
        <span className="cards-intro-glare" />
      </div>
    </div>
  );
}

export function CardOpening() {
  const section = useRef<HTMLElement>(null);
  // The page as the server sent it (and its first render in the browser),
  // not the homepage put together again on coming back to it.
  const [served] = useState(() => !pageHydrated());
  useEffect(() => markHydrated(), []);
  const finish = useRef<() => void>(() => {});
  const dilan = imageLoader({ src: CARDS.dilan, width: 1024 });
  const batuhan = imageLoader({ src: CARDS.batuhan, width: 1024 });

  useEffect(() => {
    const el = section.current;
    const start = document.getElementById(STYLE_ID);
    if (!el || !start) return;
    // Begun more than a moment ago this session (the page was left mid-
    // sequence and come back to): not again. Begun a moment ago: React
    // mounting the page twice in development.
    let begun = 0;
    try {
      begun = Number(sessionStorage.getItem(KEY)) || 0;
      if (!begun) sessionStorage.setItem(KEY, String(Date.now()));
    } catch {}
    if (begun && Date.now() - begun > 1000) {
      endIntro(start);
      return;
    }

    let t0 = 0;
    let raf = 0;
    let done = false;
    const set = (k: string, v: number) => el.style.setProperty(k, v.toFixed(3));

    const stop = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      el.removeAttribute("style");
      endIntro(start);
    };
    finish.current = stop;

    const tick = (now: number) => {
      if (!t0) t0 = now;
      const e = now - t0;
      const up = ease(clamp(e / IN));
      const gone = ease(span(e, GONE));
      set("--co", up * (1 - gone));
      set("--rise", 1 - up);
      set("--ra", TURNS * ease(span(e, FLIP[0])));
      set("--rb", TURNS * ease(span(e, FLIP[1])));
      set("--cx", 1 - ease(span(e, MEET)));
      // The flash as the two become one: up fast, down slower.
      const f = e < FLASH ? clamp(1 - (FLASH - e) / 120) : clamp(1 - (e - FLASH) / 450);
      set("--flash", f * f);
      const n = ease(span(e, NAMES));
      // From the first moment the names are there, a trace in the dark,
      // out of focus; they come up and sharpen as the cards go.
      set("--names", TRACE + (1 - TRACE) * n);
      set("--s", 1 - n);
      // The ampersand last: it is up with the names but the last thing to
      // come into focus, the two of them, then what joins them.
      set("--amp", TRACE + (1 - TRACE) * ease(clamp((e - NAMES.from - 250) / 450)));
      set("--ampblur", 1 - ease(span(e, AMP_FOCUS)));
      set("--ui", clamp((e - NAMES.to + 200) / 500));
      if (e >= END) {
        stop();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
  }, []);

  return (
    <>
      {/* Rendered on the server and run as the page is parsed; on the
          client it is never rendered again. */}
      {served ? <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: typeof window === "undefined" ? DECIDE : "" }} /> : null}
      <section ref={section} className="cards-intro relative isolate h-svh min-h-[34rem] overflow-hidden">
        <div aria-hidden className="cards-intro-table pointer-events-none absolute inset-0">
          <Card side="a" src={dilan} />
          <Card side="b" src={batuhan} />
          <span className="cards-intro-flash" />
        </div>

        <div className="cards-intro-rest absolute inset-0 flex flex-col items-center justify-center" style={{ color: BONE }}>
          <h1
            aria-label="Dilan & Batuhan"
            className="cards-intro-names display"
            style={{ ["--dw" as string]: "62", ["--dg" as string]: "900", ["--dt" as string]: "-0.02em" }}
          >
            {/* Without the dot: it matches the small name it becomes (Batu, 2026-11-07). */}
            <span aria-hidden className="cards-intro-dilan">
              DILAN
            </span>
            <span aria-hidden className="cards-intro-amp">
              <Amp />
            </span>
            <span aria-hidden className="cards-intro-batuhan">
              BATUHAN
            </span>
          </h1>
          {/* The way on: down into the tunnel, at a press or with the
              scroll, either (Batu, 2026-11-06, in place of the page going
              down by itself). Lands on the first brand at rest. */}
          <button
            type="button"
            onClick={() => {
              // The folio, if it follows, takes it from here (lib/intro EXPLORE).
              if (!window.dispatchEvent(new Event(EXPLORE, { cancelable: true }))) return;
              const stop = document.querySelector<HTMLElement>("[data-explore-target]");
              const top = stop ? stop.getBoundingClientRect().top + window.scrollY : window.innerHeight;
              const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              window.scrollTo({ top, behavior: still ? "auto" : "smooth" });
            }}
            className="cards-intro-ui cards-intro-more mono mt-10 flex flex-col items-center gap-3 md:mt-12"
          >
            <span>Explore Work</span>
            <svg aria-hidden className="cards-intro-arrow" width="14" height="22" viewBox="0 0 14 22">
              <path d="M7 0V20M1 14L7 20L13 14" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => finish.current()}
          className="cards-intro-skip mono absolute bottom-16 left-1/2 -translate-x-1/2 md:bottom-20"
          style={{ color: BONE, fontSize: "0.6875rem" }}
        >
          Skip intro
        </button>
      </section>
    </>
  );
}
