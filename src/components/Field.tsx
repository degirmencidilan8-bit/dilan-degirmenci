"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Amp } from "@/components/Corners";
import type { FieldSlot } from "@/data/field";
import { BONE } from "@/data/palette";

// The opening page. Every project as one small picture, loose across a
// dark field two to a row, and the studio's name huge across the middle
// of the screen, over them.
//
// Look at a picture and everything else falls back to almost nothing, the
// name steps aside, and that picture starts cutting through its own set —
// a hard cut every 0.7s, no fade, the way an edit moves — with its count
// above and its name below. Scroll and the name goes; the field goes on.
//
// All pictures share one height and keep their own width, so a row of a
// portrait and a landscape reads as a contact strip, not a grid.

/** Where each of a row's two pictures sits, as a share of the page width:
 * from the left edge (l) or from the right (r). Measured off Webber's own
 * opening, and repeated down the page. */
const ROWS: [Anchor, Anchor][] = [
  [{ l: 1.25 }, { l: 64.9 }],
  [{ l: 25.1 }, { r: 6.7 }],
  [{ l: 1.25 }, { l: 59.1 }],
  [{ l: 25.1 }, { r: 6.7 }],
  [{ l: 1.25 }, { r: 1.25 }],
  [{ l: 31.3 }, { r: 1.25 }],
  [{ l: 6.7 }, { l: 66.4 }],
  [{ l: 31.3 }, { r: 1.25 }],
  [{ l: 6.7 }, { l: 65 }],
  [{ l: 19 }, { r: 6.7 }],
];

type Anchor = { l: number } | { r: number };

const CUT_MS = 700;

// Left alone, the field plays itself. After a few seconds with no hand on
// it, one picture on screen comes up and cuts through its set while the
// rest fall back; then another, somewhere else on the page. The moment the
// visitor moves, it stops and the field is theirs again. A showreel cut
// live on the editing table, instead of a page waiting to be used.
const IDLE_MS = 3000;
const AUTO_CUTS = 5;

type Lit = { key: string; by: "hand" | "auto" } | null;

function place(a: Anchor, ratio: number): CSSProperties {
  // A picture anchored from the left never runs off the right edge: on a
  // narrow screen a landscape is pulled back in until it fits.
  if ("l" in a) return { left: `min(${a.l}%, calc(98.75% - var(--h) * ${ratio.toFixed(4)}))` };
  return { right: `${a.r}%` };
}

/** `named`: the field carries the studio's name over its first screen.
 * Off when the opening reel (Opener) comes before it and carries it. */
export function Field({ slots, named = true }: { slots: FieldSlot[]; named?: boolean }) {
  const [hand, setHand] = useState<string | null>(null);
  const [auto, setAuto] = useState<string | null>(null);
  const lit: Lit = hand ? { key: hand, by: "hand" } : auto ? { key: auto, by: "auto" } : null;
  const name = useRef<HTMLDivElement>(null);
  const frames = useRef(new Map<string, HTMLElement>());

  // The autopilot.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let idle = 0;
    let step = 0;
    let lastX = -1;
    let lastY = -1;
    const recent: string[] = [];

    // A picture that is fully on screen, clear of the corner words, out
    // from under the name while the name is up (its count and caption would
    // be lost behind the letters), and not one of the last few shown.
    const pick = () => {
      const top = 64;
      const bottom = window.innerHeight - 56;
      const box = name.current?.firstElementChild?.getBoundingClientRect();
      // The line box is a full em tall; the capitals fill roughly the middle
      // seven tenths of it.
      const word = box && { top: box.top + box.height * 0.14, bottom: box.bottom - box.height * 0.16, left: box.left, right: box.right };
      const nameUp = window.scrollY < window.innerHeight * 0.2;
      const seen = [...frames.current.entries()].filter(([, el]) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.top < top || r.bottom > bottom) return false;
        if (!nameUp || !word) return true;
        // Room for the count above and the caption below.
        const hit = r.bottom + 36 > word.top && r.top - 18 < word.bottom && r.right > word.left && r.left < word.right;
        return !hit;
      });
      const fresh = seen.filter(([k]) => !recent.includes(k));
      const pool = fresh.length ? fresh : seen;
      if (!pool.length) return null;
      return pool[Math.floor(Math.random() * pool.length)][0];
    };

    const play = () => {
      const key = pick();
      setAuto(key);
      if (key) {
        recent.push(key);
        if (recent.length > 3) recent.shift();
      }
      step = window.setTimeout(play, CUT_MS * AUTO_CUTS + 500);
    };

    const wake = () => {
      clearTimeout(step);
      clearTimeout(idle);
      setAuto(null);
      idle = window.setTimeout(play, IDLE_MS);
    };
    // Some browsers send a pointer event when the page changes under a
    // pointer that has not moved; only a real move counts.
    const onMove = (e: PointerEvent) => {
      if (e.clientX === lastX && e.clientY === lastY) return;
      lastX = e.clientX;
      lastY = e.clientY;
      wake();
    };

    idle = window.setTimeout(play, IDLE_MS);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("keydown", wake);
    return () => {
      clearTimeout(step);
      clearTimeout(idle);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);

  // The name is the first screen's; it goes as the field is scrolled.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = name.current;
        if (!el) return;
        const t = Math.min(1, window.scrollY / (window.innerHeight * 0.35));
        el.style.setProperty("--scrolled", String(1 - t));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const rows: FieldSlot[][] = [];
  for (let i = 0; i < slots.length; i += 2) rows.push(slots.slice(i, i + 2));

  return (
    <>
      {named ? (
        <>
          <div
            ref={name}
            aria-hidden
            className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center"
            style={{
              // A hand on a picture sends the name away; the autopilot plays
              // under it, so the first screen keeps its title.
              opacity: lit?.by === "hand" ? 0 : "var(--scrolled, 1)",
              transition: "opacity 0.3s ease",
            }}
          >
            <p
              className="display whitespace-nowrap leading-none"
              style={{
                color: BONE,
                fontSize: "clamp(3rem, 13.4vw, 17rem)",
                ["--dw" as string]: "62",
                ["--dg" as string]: "900",
                ["--dt" as string]: "-0.02em",
              }}
            >
              DILAN<Amp />BATUHAN
            </p>
          </div>

          <h1 className="sr-only">Dilan &amp; Batuhan</h1>
        </>
      ) : null}

      <div
        className="relative z-10 flex flex-col pb-28 pt-24 md:pt-[6.25rem]"
        style={{ ["--h" as string]: "clamp(112px, 12.5vw, 230px)", gap: "calc(var(--h) * 0.2)" }}
      >
        {rows.map((row, r) => (
          <div
            key={r}
            className="flex flex-col md:relative md:block"
            style={{ gap: "calc(var(--h) * 0.2)", minHeight: "var(--h)" }}
          >
            {row.map((s, k) => (
              <Slot
                key={s.key}
                slot={s}
                anchor={ROWS[r % ROWS.length][k]}
                eager={r < 4}
                lit={lit}
                onLook={setHand}
                register={(el) => {
                  if (el) frames.current.set(s.key, el);
                  else frames.current.delete(s.key);
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function Slot({
  slot,
  anchor,
  eager,
  lit,
  onLook,
  register,
}: {
  slot: FieldSlot;
  anchor: Anchor;
  eager: boolean;
  lit: Lit;
  onLook: (key: string | null) => void;
  register: (el: HTMLElement | null) => void;
}) {
  // Cuts counted while this picture is lit; at rest it always shows its
  // first frame.
  const [cuts, setCuts] = useState(0);
  // Every picture of the set is put on the page the first time the frame
  // is looked at, so the cuts after that are instant.
  const [primed, setPrimed] = useState(false);
  const on = lit?.key === slot.key;
  const n = slot.frames.length;
  const i = on ? cuts % n : 0;

  useEffect(() => {
    if (!on || n < 2) return;
    const t = setInterval(() => setCuts((x) => x + 1), CUT_MS);
    return () => clearInterval(t);
  }, [on, n]);

  const look = () => {
    setPrimed(true);
    onLook(slot.key);
  };
  const leave = () => onLook(null);

  const frame = slot.frames[i];
  // Under a hand the rest of the field all but goes; under the autopilot
  // it holds back less, so the page still reads as a page.
  const dim = lit !== null && !on ? (lit.by === "hand" ? 0.1 : 0.22) : 1;
  // Labels hang from the side of the picture nearer the middle of the page,
  // so a picture at the right edge never pushes its name off screen.
  const side = "r" in anchor || anchor.l > 50 ? "right-0 text-right" : "left-0";

  const box = {
    onMouseEnter: look,
    onMouseLeave: leave,
    className: "pointer-events-auto absolute top-0 block h-full",
    style: {
      ...place(anchor, frame.ratio),
      width: `calc(var(--h) * ${frame.ratio.toFixed(4)})`,
      opacity: dim,
      transition: "opacity 0.35s ease",
      background: "#1a1a18",
    },
  };

  const inner = (
    <>
      {(primed || on ? slot.frames : slot.frames.slice(0, 1)).map((f, k) => (
        <Image
          key={f.src}
          src={f.src}
          alt={k === 0 ? (slot.title ?? "") : ""}
          fill
          // Tiles are up to 230px tall, so a 16:9 one is ~410px wide.
          sizes="(max-width: 768px) 220px, 420px"
          loading={eager && k === 0 ? "eager" : "lazy"}
          className="object-cover"
          style={{ opacity: k === i ? 1 : 0, objectPosition: f.pos ?? "50% 50%" }}
        />
      ))}

      {on ? (
        <>
          <span className={`mono absolute bottom-full mb-1.5 whitespace-nowrap ${side}`} style={{ color: BONE, fontSize: "0.6875rem" }}>
            {String(i + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}
          </span>
          {slot.title ? (
            <span className={`absolute top-full mt-1.5 whitespace-nowrap ${side}`} style={{ color: BONE }}>
              <span className="mono block" style={{ fontSize: "0.6875rem" }}>
                {slot.title}
              </span>
              <span className="mono block opacity-55" style={{ fontSize: "0.625rem" }}>
                {slot.sub}
              </span>
            </span>
          ) : null}
        </>
      ) : null}
    </>
  );

  return (
    <div className="pointer-events-none relative md:absolute md:inset-x-0 md:top-0" style={{ height: "var(--h)" }}>
      {slot.href ? (
        <Link ref={register} href={slot.href} aria-label={`${slot.title} — ${slot.sub}`} onFocus={look} onBlur={leave} {...box}>
          {inner}
        </Link>
      ) : (
        // A loose frame: no link, no name. The viewfinder still frames it.
        <div ref={register} data-cursor aria-hidden {...box}>
          {inner}
        </div>
      )}
    </div>
  );
}
