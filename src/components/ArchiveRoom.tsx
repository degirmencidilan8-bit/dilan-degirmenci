"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import type { ArchiveItem } from "@/data/types";
import { RATIO_VALUE } from "@/data/ratio";

// A darkroom, not a red web page.
//
// The version before this was lit like a neon bar: every wire glowed, every
// print was painted the same flat red, and four identical rows ran down a
// perfectly even grid. Three things were wrong with it and they are worth
// naming, because each one is a general mistake.
//
// 1. The prints were inverted to negatives AND the blacks came back white.
//    A room where the shadows are bright is not dark. Prints hang in a
//    darkroom, not negatives — the negative is in the enlarger. So these
//    are prints: grey, dark, with a red lamp falling on them, and multiply
//    keeps the blacks black because anything times zero is zero.
// 2. The wire glowed. A wire is a wire. What catches the light is the edge
//    of the paper, not the string.
// 3. The rows were even. Nothing in a room where someone is working is
//    even. Lines sit at different heights, hold different numbers of
//    prints, and start at different places.
//
// The light is one lamp, up and to the right. Prints near it are legible;
// prints away from it fall into the dark and have to be brought up to be
// read. That is the page's whole dramaturgy, and it is also why there are
// eighteen frames here and not eighty-three: a dark room with a lot of
// small things in it is a contact sheet, which this already tried to be.

// How many prints on each line, how big they are, and where the line
// starts. Written out rather than packed by an algorithm, because the
// point is that it is irregular — a solver would even it out again.
const LINES: { count: number; scale: number; start: number }[] = [
  { count: 4, scale: 1, start: 0.04 },
  { count: 5, scale: 0.82, start: -0.11 },
  { count: 3, scale: 1.28, start: 0.1 },
  { count: 4, scale: 0.92, start: -0.05 },
  { count: 2, scale: 1.4, start: 0.16 },
];

// The lamp, in fractions of the viewport. Up and to the right.
const LAMP_X = 0.8;

function rand(seed: number) {
  let a = seed + 0x6d2b79f5;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Print {
  item: ArchiveItem;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  /** 0 = deep in the dark, 1 = right under the lamp */
  lum: number;
  /** Its place in the hang — the cursor says it, nothing is printed on
   * the page itself. */
  n: number;
  /** A bordered fibre print, or a borderless RC one. */
  fibre: boolean;
  padT: number;
  padB: number;
}

function layOut(items: ArchiveItem[], W: number) {
  const next = rand(20260919);
  if (W <= 0) return { prints: [] as Print[], lines: [] as number[], height: 0 };

  const baseH = Math.max(210, Math.min(420, W * 0.235));
  const prints: Print[] = [];
  const lines: number[] = [];
  // You come into the dark before you find anything hanging in it — but
  // only just. Measured: at W * 0.2 the first wire landed at 46% of the
  // viewport once the page padding was added, which is a screen of nothing.
  let top = Math.max(84, W * 0.072);
  let n = 0;

  LINES.forEach((line) => {
    if (n >= items.length) return;
    const members = items.slice(n, n + line.count);
    n += line.count;
    lines.push(top);

    // Lay the line out, then push it sideways by its own offset. Gaps vary
    // inside a line too — two prints nearly touching, then a long reach.
    let x = line.start * W;
    const row: Print[] = [];
    members.forEach((item, k) => {
      const h = baseH * line.scale * (0.86 + next() * 0.3);
      const fibre = next() > 0.55;
      const padT = fibre ? Math.round(h * 0.035) + 5 : 0;
      const padB = fibre ? Math.round(h * 0.055) + 7 : 0;
      const w = h * RATIO_VALUE[item.ratio] + padT * 2;
      row.push({
        n: n - members.length + k + 1,
        item,
        x,
        // Some hang lower than their neighbours.
        y: top + 12 + next() * 46,
        w,
        h,
        rotate: (next() - 0.5) * 5.4,
        lum: 0,
        fibre,
        padT,
        padB,
      });
      const gap = k % 2 === 0 ? W * (0.012 + next() * 0.015) : W * (0.03 + next() * 0.05);
      x += w + gap;
    });

    // If a line runs past the right edge, pull the whole line back rather
    // than squeezing it — a line is as long as it is.
    const over = row.length ? row[row.length - 1].x + row[row.length - 1].w - W * 0.99 : 0;
    if (over > 0) row.forEach((p) => (p.x -= over));
    // A sheet at the edge of the room can run past the frame — that is
    // part of being in a room rather than looking at a layout — but one
    // that is 58% off screen, as the widest was, is simply a photograph
    // nobody will ever see.
    row.forEach((p) => {
      if (p.x < -p.w * 0.18) p.x = -p.w * 0.18;
    });

    row.forEach((p) => {
      // Falloff from the one lamp: distance across the room, plus a little
      // unevenness so it is a lamp and not a gradient.
      const cx = (p.x + p.w / 2) / W;
      const d = Math.min(1, Math.abs(cx - LAMP_X) / 0.95);
      p.lum = Math.max(0.1, 1 - d * d * 1.25) * (0.86 + next() * 0.28);
      prints.push(p);
    });

    const tallest = Math.max(...row.map((p) => p.y - top + p.h + p.padT + p.padB));
    top += tallest + baseH * 0.26;
  });

  return { prints, lines, height: top + 80 };
}

export function ArchiveRoom({ items }: { items: ArchiveItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [W, setW] = useState(0);
  // The room is dark when you walk into it; the lamp comes up after.
  const [lampOn, setLampOn] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Measured before the first paint, not after it. Measured after, the
  // room's first frame had no width and so no prints in it, and they could
  // only start arriving a frame late.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // The lamp comes up almost at once and quickly. It used to wait 620ms in
  // the dark and then take 1.9s to rise, which on top of everything else
  // read as the page hanging rather than as a room being lit.
  useEffect(() => {
    const t = setTimeout(() => setLampOn(true), 120);
    return () => clearTimeout(t);
  }, []);

  const { prints, lines, height } = useMemo(() => layOut(items, W), [items, W]);

  return (
    <div className="relative">
      <Room lampOn={lampOn} />

      <div ref={box} className="relative" style={{ height }}>
        {/* The wires. Matte, thin, almost not there. */}
        {lines.map((y, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute inset-x-0"
            style={{ top: y, height: 1, background: "rgba(214,188,186,0.13)" }}
          />
        ))}

        {prints.map((p, i) => (
          // The first two rows are on screen on arrival; all of them are
          // fetched outright. With only four eager, the rest of the first
          // screen waited for lazy loading and appeared one by one.
          <Sheet key={p.item.id} p={p} eager={i < 9} onOpen={() => setOpen(items.indexOf(p.item))} />
        ))}
      </div>

      {open !== null ? (
        <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      ) : null}
    </div>
  );
}

// Everything that is not a photograph: the walls, the lamp, the grain, and
// two things half in frame at the edges.
function Room({ lampOn }: { lampOn: boolean }) {
  return (
    <>
      {/* Plaster. Near black — a darkroom is a dark room. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background: "#07070a",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.5'/%3E%3C/svg%3E\")",
          backgroundSize: "300px 300px",
        }}
      />

      {/* The safelight itself: one lamp, up and to the right, reaching only
          so far. Everything else in the room stays black. */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: lampOn ? 1 : 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{
          background: `radial-gradient(44vw 42vw at ${LAMP_X * 100}% 4%, rgba(214,26,44,0.5) 0%, rgba(150,14,28,0.22) 32%, rgba(70,6,14,0.08) 58%, transparent 78%)`,
        }}
      />

      <Fixtures />
      <Grain />
    </>
  );
}

// Half in frame at the edges, never centred, never explained: the bottom
// of an enlarger column on the left, the lip of a developing tray bottom
// right. Nearly black, with the one lit edge the lamp would actually
// catch. Props, not decor — if they read as illustration they are wrong.
function Fixtures() {
  return (
    <>
      <svg
        aria-hidden
        className="pointer-events-none fixed -left-20 top-[16vh] -z-10 hidden h-[62vh] w-[26vw] lg:block"
        viewBox="0 0 200 500"
        fill="none"
      >
        <path d="M60 500V120h26v380z" fill="#101013" />
        <path d="M86 120h24v380H86z" fill="#0b0b0e" />
        <path d="M20 96h150v46H20z" fill="#101013" />
        <path d="M66 142h58l-14 52H80z" fill="#0b0b0e" />
        <path d="M86 120v380" stroke="rgba(226,54,70,0.26)" strokeWidth="1.5" />
        <path d="M170 96v46" stroke="rgba(226,54,70,0.3)" strokeWidth="1.5" />
        <path d="M124 142l-14 52" stroke="rgba(226,54,70,0.2)" strokeWidth="1.2" />
      </svg>

      <svg
        aria-hidden
        className="pointer-events-none fixed -bottom-16 -right-24 -z-10 hidden h-[34vh] w-[34vw] lg:block"
        viewBox="0 0 400 240"
        fill="none"
      >
        <path d="M30 60h360v150a30 30 0 01-30 30H60a30 30 0 01-30-30z" fill="#0d0d10" />
        <path d="M30 60h360" stroke="rgba(226,54,70,0.3)" strokeWidth="2" />
        <path d="M30 60v150" stroke="rgba(226,54,70,0.16)" strokeWidth="1.5" />
        {/* tongs */}
        <path d="M96 22l66 54M150 14l-42 66" stroke="#111114" strokeWidth="7" strokeLinecap="round" />
        <path d="M96 22l66 54" stroke="rgba(226,54,70,0.26)" strokeWidth="1.2" />
      </svg>
    </>
  );
}

// A little more than the site's own skin, and it moves — but in four
// steps a second, not every frame. Continuous noise repaints the whole
// viewport forever and reads cheap; stepped noise reads like film.
function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] opacity-[0.055] [animation:room-grain_0.9s_steps(4)_infinite]"
      style={{
        backgroundSize: "190px 190px",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='190' height='190'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

function Sheet({ p, eager, onOpen }: { p: Print; eager: boolean; onOpen: () => void }) {
  const [lit, setLit] = useState(false);

  // Under the lamp the print is grey and dark, and the red is multiplied
  // over it so the blacks stay black. Brought up, the safelight pulls off
  // and the photograph is itself.
  const base = 0.38 + p.lum * 0.6;

  return (
    <motion.div
      className="absolute"
      style={{ left: p.x, top: p.y, width: p.w, zIndex: lit ? 60 : 1 }}
      // Opacity and a small drift only. A blur animating on a dozen
      // photographs at once repaints every one of them on every frame, and
      // on an ordinary laptop that stutter was itself part of the sense of
      // delay. Shorter, too: 0.85s per print was a wait.
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setLit(true)}
      onHoverEnd={() => setLit(false)}
    >
      <motion.div animate={{ rotate: lit ? 0 : p.rotate, scale: lit ? 1.1 : 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
        {/* The peg: a short matte clip over the wire, not a glowing bar. */}
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: -13,
            width: 6,
            height: 20,
            background: "#1d1a1c",
            borderTop: "1px solid rgba(226,54,70,0.4)",
          }}
        />

        <button
          type="button"
          data-cursor="view"
          data-cursor-note={String(p.n).padStart(3, "0")}
          onClick={onOpen}
          onFocus={() => setLit(true)}
          onBlur={() => setLit(false)}
          className="block w-full text-left"
          style={{
            padding: p.fibre ? `${p.padT}px ${p.padT}px ${p.padB}px` : 0,
            // Fibre paper under a red lamp is not white. RC prints have no
            // border at all, so a third of the line reads as paper and the
            // rest as image straight to the edge.
            background: p.fibre
              ? `rgb(${Math.round(74 + p.lum * 74)}, ${Math.round(51 + p.lum * 42)}, ${Math.round(50 + p.lum * 41)})`
              : "transparent",
            // Two or three centimetres off the wall.
            boxShadow: lit
              ? "0 26px 54px -20px rgba(0,0,0,0.95)"
              : "0 10px 22px -12px rgba(0,0,0,0.8)",
            transition: "box-shadow 0.45s ease",
          }}
        >
          <span
            className="relative block w-full overflow-hidden"
            style={{ height: p.h, background: "#141013", isolation: "isolate" }}
          >
            <Image
              src={p.item.src}
              alt=""
              fill
              sizes="(max-width: 640px) 72vw, (max-width: 1280px) 36vw, 28vw"
              loading={eager ? "eager" : "lazy"}
              className="object-cover"
              style={{
                // Always monochrome. Bringing a sheet to the light takes
                // the safelight off it and shows the exposure properly —
                // it does not turn it into a colour photograph, because it
                // never was one. A black-and-white room with full-colour
                // frames popping out of it is a filter, not a place.
                filter: lit
                  ? "grayscale(1) brightness(1.04) contrast(1.06)"
                  : `grayscale(1) brightness(${base.toFixed(2)}) contrast(1.12)`,
                transition: "filter 0.45s ease",
              }}
            />
            {/* The safelight on this sheet. Multiply, so nothing that was
                black becomes anything else. */}
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background: "#d2202c",
                mixBlendMode: "multiply",
                opacity: lit ? 0 : 0.86,
                transition: "opacity 0.45s ease",
              }}
            />
            {/* The one edge the lamp catches. */}
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                boxShadow: `inset -1px 1px 0 0 rgba(236,96,104,${(0.1 + p.lum * 0.3).toFixed(2)})`,
              }}
            />
          </span>

          <motion.span
            className="label-sm mt-2 block"
            style={{ color: "rgba(214,188,186,0.75)" }}
            animate={{ opacity: lit ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {p.item.category}
            {p.item.year ? ` — ${p.item.year}` : ""}
          </motion.span>
        </button>
      </motion.div>
    </motion.div>
  );
}

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: ArchiveItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const step = useCallback(
    (d: 1 | -1) => onIndex((index + d + items.length) % items.length),
    [items.length, index, onIndex],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  return (
    <div role="dialog" aria-modal="true" aria-label={item.title} className="fixed inset-0 z-[90]">
      <motion.div
        className="absolute inset-0"
        style={{ background: "#07070a" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div
        key={item.id}
        className="absolute inset-0 flex items-center justify-center p-6 md:p-14"
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative h-full w-full">
          <Image
            src={item.src}
            alt={item.title}
            fill
            sizes="100vw"
            className="object-contain"
            style={{ filter: "grayscale(1) contrast(1.04)" }}
          />
        </div>
      </motion.div>

      <button
        type="button"
        aria-label="Previous"
        data-cursor="prev"
        onClick={() => step(-1)}
        className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-w-resize"
      />
      <button
        type="button"
        aria-label="Next"
        data-cursor="next"
        onClick={() => step(1)}
        className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-e-resize"
      />

      <span className="label-sm pointer-events-none absolute left-5 top-5 text-paper-dim md:left-10 md:top-7">
        {item.category}
        {item.year ? ` — ${item.year}` : ""}
      </span>
      <button
        type="button"
        data-cursor="close"
        onClick={onClose}
        className="label-sm absolute bottom-5 right-5 z-20 text-paper-dim transition-colors hover:text-paper md:bottom-7 md:right-10"
      >
        Close
      </button>
    </div>
  );
}
