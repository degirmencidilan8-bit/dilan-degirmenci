"use client";

import { useEffect, useRef } from "react";

// The pointer as a viewfinder.
//
// At rest it is four small corner marks around a point — the focus frame
// of a camera. Over anything that can be pressed (a frame, a word, a
// field) the marks leave the point and lock onto the thing itself, framing
// it edge to edge, and follow it if it moves or changes shape; press and
// they close in a little, like a shutter. Drawn in difference mode, so it
// reads on the black pages and the bone ones alike.
//
// Only where there is a mouse. On a touch screen nothing here runs and the
// page is left exactly as it was.

const TARGET = "a, button, input, textarea, select, label, [role='tab'], [data-cursor]";
const REST = 22; // the size of the frame at rest, px
const PAD = 6; // how far outside a target the frame sits, px

export function Cursor() {
  const frame = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

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

    const tick = () => {
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

      const f = frame.current;
      const d = dot.current;
      if (f) {
        f.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        f.style.width = `${w}px`;
        f.style.height = `${h}px`;
      }
      if (d) {
        d.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
        d.style.opacity = target ? "0" : "1";
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
      <div ref={dot} className="viewfinder-dot" />
    </div>
  );
}
