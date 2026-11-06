"use client";

import { useEffect, useRef } from "react";
import { irisBlades } from "@/lib/iris";

// The pointer as a lens's iris.
//
// At rest it is a small iris, stopped down: six solid blades overlapping
// around a hexagonal hole, a hairline gap between each, a thin barrel
// round them, still. Over anything that can be pressed (a frame, a word,
// a field) the iris opens, the blades turning as they draw back the way a
// lens's do, with a little give at the end; four corner marks lock onto
// the thing itself, framing it edge to edge, and follow it if it moves or
// changes shape. Press and it snaps shut like a shutter and springs open
// again. Drawn in difference mode, so it reads on the black pages and the
// bone ones alike; the gaps between blades are drawn in black, which
// difference leaves untouched, so they cut clean through.
//
// Only where there is a mouse. On a touch screen nothing here runs and the
// page is left exactly as it was.

const TARGET = "a, button, input, textarea, select, label, [role='tab'], [data-cursor]";
const REST = 22; // the size of the frame at rest, px
const PAD = 6; // how far outside a target the frame sits, px
const BOX = 26; // the iris's box, px
const IRIS_R = 10.6; // where the blades end, in the box's units
const BARREL_R = 12.2; // the thin ring round them
const HOLE = { rest: 3.4, open: 7.4, down: 1.1 }; // the hole's corner radius
/** How far the blades turn as the hole opens, radians per unit of radius. */
const TURN = 0.16;

/** The six blades (see lib/iris). */
const blades = (hole: number, spin: number) => irisBlades(hole, spin, IRIS_R);

export function Cursor() {
  const frame = useRef<HTMLDivElement>(null);
  const iris = useRef<HTMLDivElement>(null);
  const edges = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    let mx = -100;
    let my = -100;
    let x = -100;
    let y = -100;
    let w = REST;
    let h = REST;
    let target: Element | null = null;
    let down = false;
    let shown = false;
    let raf = 0;
    let hole = HOLE.rest;
    let vel = 0; // the hole's speed, for the spring
    let drawn = -1; // the hole last drawn, so a still iris is not redrawn
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      target = e.target instanceof Element ? e.target.closest(TARGET) : null;
      if (!shown) {
        shown = true;
        x = mx - REST / 2;
        y = my - REST / 2;
        root.style.setProperty("--cursor-on", "1");
      }
    };
    const onDown = () => (down = true);
    const onUp = () => (down = false);
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      shown = false;
      root.style.setProperty("--cursor-on", "0");
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let tx: number;
      let ty: number;
      let tw: number;
      let th: number;
      if (target && target.isConnected) {
        const r = target.getBoundingClientRect();
        tx = r.left - PAD;
        ty = r.top - PAD;
        tw = r.width + PAD * 2;
        th = r.height + PAD * 2;
      } else {
        target = null;
        tx = mx - REST / 2;
        ty = my - REST / 2;
        tw = REST;
        th = REST;
      }
      if (down) {
        tx += tw * 0.06;
        ty += th * 0.06;
        tw *= 0.88;
        th *= 0.88;
      }
      const k = still ? 1 : 0.28;
      x += (tx - x) * k;
      y += (ty - y) * k;
      w += (tw - w) * k;
      h += (th - h) * k;

      // The iris does not turn on its own: it is still until it opens over
      // a target or shuts under a press, and then it moves on a spring —
      // quick, with a little give at the end — the blades turning with
      // the opening as a lens's do. Shutting under a press is quicker
      // still, like a shutter.
      const goal = down ? HOLE.down : target ? HOLE.open : HOLE.rest;
      if (still) {
        hole = goal;
        vel = 0;
      } else {
        const stiff = down ? 900 : 320;
        const damp = down ? 48 : 24;
        vel += ((goal - hole) * stiff - vel * damp) * dt;
        hole += vel * dt;
        if (Math.abs(goal - hole) < 0.005 && Math.abs(vel) < 0.01) {
          hole = goal;
          vel = 0;
        }
      }
      const open = Math.max(0.4, hole);

      const f = frame.current;
      const ir = iris.current;
      if (f) {
        f.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
        f.style.width = `${Math.round(w)}px`;
        f.style.height = `${Math.round(h)}px`;
        f.style.opacity = target ? "1" : "0";
      }
      // On whole pixels, so the hairlines do not shimmer as it moves.
      if (ir) ir.style.transform = `translate3d(${Math.round(mx)}px, ${Math.round(my)}px, 0)`;
      if (open !== drawn) {
        drawn = open;
        edges.current?.setAttribute("d", blades(open, (open - HOLE.rest) * TURN));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerout", onOut);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerout", onOut);
      root.classList.remove("has-custom-cursor");
      root.style.removeProperty("--cursor-on");
    };
  }, []);

  return (
    <div aria-hidden className="viewfinder">
      <div ref={frame} className="viewfinder-frame">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div ref={iris} className="viewfinder-iris">
        <svg viewBox={`${-BOX / 2} ${-BOX / 2} ${BOX} ${BOX}`} width={BOX} height={BOX} shapeRendering="geometricPrecision">
          <circle r={BARREL_R} fill="none" stroke="#fff" strokeWidth="0.8" />
          <path
            ref={edges}
            d={blades(HOLE.rest, 0)}
            fill="#fff"
            fillOpacity="0.92"
            stroke="#000"
            strokeWidth="0.85"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
