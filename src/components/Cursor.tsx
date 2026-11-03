"use client";

import { useEffect, useRef } from "react";

// The pointer as a lens's iris.
//
// At rest it is a small iris — six blades in a ring around a hexagonal
// hole — turning slowly on itself, a little faster while the pointer moves. Over
// anything that can be pressed (a frame, a word, a field) the iris opens
// and four corner marks lock onto the thing itself, framing it edge to
// edge, and follow it if it moves or changes shape; press and the iris
// stops down and the marks close in a little, like a shutter. Drawn in
// difference mode, so it reads on the black pages and the bone ones alike.
//
// Only where there is a mouse. On a touch screen nothing here runs and the
// page is left exactly as it was.

const TARGET = "a, button, input, textarea, select, label, [role='tab'], [data-cursor]";
const REST = 22; // the size of the frame at rest, px
const PAD = 6; // how far outside a target the frame sits, px
const IRIS_R = 12.5; // the iris's ring, in its 32px box
const HOLE = { rest: 4.6, open: 8.6, down: 1.8 }; // the hole's inner radius

/** Six blade edges, each tangent to the hole and running out to the ring,
 * turned by `spin` radians. */
function blades(hole: number, spin: number) {
  const t = Math.sqrt(IRIS_R * IRIS_R - hole * hole);
  let d = "";
  for (let i = 0; i < 6; i++) {
    const a = spin + (i * Math.PI) / 3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const x0 = hole * c;
    const y0 = hole * s;
    d += `M${x0.toFixed(2)} ${y0.toFixed(2)}L${(x0 - t * s).toFixed(2)} ${(y0 + t * c).toFixed(2)}`;
  }
  return d;
}

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
    let spin = 0;
    let rate = 0.45;
    let last = performance.now();
    let px = mx;
    let py = my;

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

      // The iris turns on itself, slowly — a turn in about fourteen
      // seconds — and a little quicker while the pointer moves, the change
      // eased so it never jerks; it opens over a target and stops down
      // while pressed.
      const moved = Math.hypot(mx - px, my - py);
      px = mx;
      py = my;
      rate += (0.45 + Math.min(3, moved * 0.06) - rate) * 0.06;
      if (!still) spin += dt * rate;
      const goal = down ? HOLE.down : target ? HOLE.open : HOLE.rest;
      hole += (goal - hole) * (still ? 1 : 0.18);

      const f = frame.current;
      const ir = iris.current;
      if (f) {
        f.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        f.style.width = `${w}px`;
        f.style.height = `${h}px`;
        f.style.opacity = target ? "1" : "0";
      }
      if (ir) ir.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      edges.current?.setAttribute("d", blades(hole, spin));
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
        <svg viewBox="-16 -16 32 32" width="32" height="32">
          <circle r={IRIS_R} fill="none" stroke="#fff" strokeWidth="1.3" />
          <path ref={edges} d={blades(HOLE.rest, 0)} fill="none" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
