"use client";

import { useEffect, useRef } from "react";
import imageLoader from "@/lib/image-loader";

// The two of them, cut out, standing in the dark — and turning to follow
// the pointer, the way a hologram does when you walk round it.
//
// It is one flat cut-out made to read as a body in space by four layers at
// different depths: a halo of its own shape far behind, the figure itself
// in front, a band of light that slides across the figure as it turns
// (masked to the figure, so it lights only them), and a reflection on the
// floor. Turning the stack in perspective moves the layers against each
// other, and that parallax is the depth.
//
// The pointer anywhere on the page steers it. With no pointer (a phone) it
// sways on its own, slowly; under reduced motion it stands still.

const SRC = "/media/about/duo-alt.webp";
const RATIO = 768 / 1379;
const TILT_Y = 16; // degrees, left–right
const TILT_X = 7; // degrees, up–down

export function DuoFigure() {
  const stage = useRef<HTMLDivElement>(null);
  const url = imageLoader({ src: SRC, width: 768 });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const t0 = performance.now();

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = (now: number) => {
      if (!fine) {
        const s = (now - t0) / 1000;
        tx = Math.sin(s * 0.45) * 0.7;
        ty = Math.sin(s * 0.3) * 0.25;
      }
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      el.style.setProperty("--ry", `${(x * TILT_Y).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * TILT_X).toFixed(2)}deg`);
      // Where the band of light falls across the figure, 0–100%.
      el.style.setProperty("--sheen", `${(50 + x * 60).toFixed(1)}%`);
      raf = requestAnimationFrame(tick);
    };

    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const mask = {
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  } as const;

  return (
    <div
      className="relative mx-auto w-full"
      style={{
        aspectRatio: RATIO,
        maxWidth: `calc((100svh - 11rem) * ${RATIO})`,
        perspective: "1100px",
      }}
      aria-hidden
    >
      <div
        ref={stage}
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          willChange: "transform",
        }}
      >
        {/* Far behind: the figure's own shape as a soft halo. */}
        <div
          className="absolute inset-0"
          style={{
            ...mask,
            background: "rgba(236, 231, 222, 0.5)",
            filter: "blur(46px)",
            opacity: 0.14,
            transform: "translateZ(-120px) scale(1.04)",
          }}
        />

        {/* The floor: the figure again, upside down, fading out. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- already the prebuilt derivative from the loader; next/image cannot sit inside a 3D-transformed, masked stack */}
        <img
          src={url}
          alt=""
          draggable={false}
          className="absolute left-0 top-full w-full select-none"
          style={{
            transform: "translateZ(0px) scaleY(-1)",
            opacity: 0.16,
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 22%)",
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 22%)",
          }}
        />

        {/* The figure. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- already the prebuilt derivative from the loader; next/image cannot sit inside a 3D-transformed, masked stack */}
        <img
          src={url}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none"
          style={{
            transform: "translateZ(40px)",
            filter: "drop-shadow(0 0 14px rgba(236, 231, 222, 0.16))",
          }}
        />

        {/* The light: a band that crosses the figure as it turns, laid
            only where the figure is. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            ...mask,
            transform: "translateZ(41px)",
            mixBlendMode: "screen",
            background:
              "linear-gradient(105deg, transparent calc(var(--sheen, 50%) - 14%), rgba(255,255,255,0.32) var(--sheen, 50%), transparent calc(var(--sheen, 50%) + 14%))",
          }}
        />
      </div>
    </div>
  );
}
