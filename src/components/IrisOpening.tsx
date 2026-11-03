"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { LightCurtain } from "@/components/LightCurtain";
import { BONE, INK } from "@/data/palette";

// The Work page's opening: a lens's iris, in steel that catches the light.
// Nine blades close almost to a point with light behind them — the
// homepage's curtain of light (LightCurtain), so the two pages are lit the
// same way — and the edge each blade turns to the hole picks that light up
// as a fine bright rim, the way a cinematographer rims an object against a
// dark ground; the word WORK across the lens, the count of films and
// photographs either side, the f-stops round the barrel. Scroll and the blades turn
// and open, the shafts of light show through the widening hole and spill
// past the barrel, the reading below goes from f/16 to f/1.4 — and at full
// aperture the lens comes towards the viewer and the light fills the
// screen, which is where the work begins.
//
// It has depth: the blades sit in front of the barrel's plate and scale,
// and the whole lens tilts towards the pointer, so the two layers move
// against each other the way the parts of a real lens would — and the
// light swings with the tilt, so different blades catch it as the lens
// turns. The iris breathes a little at rest. Everything per frame is
// written straight onto the SVG.

const BLADES = 9;
/** Barrel radius in the SVG's own units (the view box is ±120). */
const R = 92;
const STOPS = ["1.4", "2", "2.8", "4", "5.6", "8", "11", "16"];
/** How far the blades' bodies sit behind their outlines, px. */
const DEPTH = 22;

/** How much of the light shows: a soft circle round the lens, inside the
 * barrel (so only the hole lets it through) while the iris is shut, past
 * the barrel as it opens, and the whole screen as the lens comes forward.
 * In the lens's own width (--lens). */
const SPILL =
  "radial-gradient(circle at 50% 50%, #000 calc(var(--lens) * (0.12 + var(--hole) * 0.5) + var(--out) * 110vmax), transparent calc(var(--lens) * (0.3 + var(--hole) * 0.85) + var(--out) * 160vmax))";

function ramp(x: number, a: number, b: number) {
  return Math.max(0, Math.min(1, (x - a) / (b - a)));
}

interface Blade {
  d: string;
  /** The blade's side of the hole, the edge the light catches: from its
   * far corner to its near one. */
  rim: [[number, number], [number, number]];
  /** Where that straight edge, carried on past the hole, meets the barrel:
   * the light runs on along it, fading. */
  tail: [number, number];
  /** Which way that edge faces, radians. */
  facing: number;
}

/** The blades for a hole of inradius r, turned by twist: each one the
 * curved triangle between its own straight edge, the next blade's edge and
 * the barrel, drawn a little inside itself so a gap shows between blades.
 * Null once the hole is wider than the barrel. */
function bladeShapes(r: number, twist: number): Blade[] | null {
  const rv = r / Math.cos(Math.PI / BLADES);
  if (rv >= R * 0.985) return null;
  const v: [number, number][] = [];
  for (let i = 0; i < BLADES; i++) {
    const a = twist + (i * 2 * Math.PI) / BLADES;
    v.push([rv * Math.cos(a), rv * Math.sin(a)]);
  }
  // Where each blade's edge, carried on past its corner of the hole, meets
  // the barrel.
  const hit = v.map((p, i) => {
    const w = v[(i + 1) % BLADES];
    let dx = p[0] - w[0];
    let dy = p[1] - w[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const b = p[0] * dx + p[1] * dy;
    const c = p[0] * p[0] + p[1] * p[1] - R * R;
    const s = -b + Math.sqrt(Math.max(0, b * b - c));
    return [p[0] + dx * s, p[1] + dy * s] as [number, number];
  });

  return v.map((_, i) => {
    const j = (i + 1) % BLADES;
    const pts: [number, number][] = [hit[i], v[j], hit[j]];
    // The barrel from the next blade's edge back round to this one's.
    const a1 = Math.atan2(hit[j][1], hit[j][0]);
    let d = Math.atan2(hit[i][1], hit[i][0]) - a1;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    for (let k = 1; k < 8; k++) {
      const a = a1 + (d * k) / 8;
      pts.push([R * Math.cos(a), R * Math.sin(a)]);
    }
    // Drawn a little in from its own outline: the gap between blades.
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const k = 0.96;
    const inset = ([x, y]: [number, number]): [number, number] => [cx + (x - cx) * k, cy + (y - cy) * k];
    const near = inset(v[j]);
    const far = inset(v[i]);
    return {
      d: `M${pts.map((p) => inset(p).map((n) => n.toFixed(2)).join(",")).join("L")}Z`,
      rim: [near, far],
      tail: inset(hit[i]),
      facing: Math.atan2((v[i][1] + v[j][1]) / 2, (v[i][0] + v[j][0]) / 2),
    };
  });
}

export function IrisOpening({ films, photos }: { films: number; photos: number }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const bodies = useRef<(SVGPathElement | null)[]>([]);
  const sheens = useRef<(SVGPathElement | null)[]>([]);
  const sheenGrads = useRef<(SVGLinearGradientElement | null)[]>([]);
  const rims = useRef<(SVGLineElement | null)[]>([]);
  const rimGrads = useRef<(SVGLinearGradientElement | null)[]>([]);
  const fstop = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sec = section.current;
    const st = stage.current;
    const ln = lens.current;
    if (!sec || !st || !ln) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;
    let shown = 0;
    // The tilt towards the pointer, eased.
    let rx = 0;
    let ry = 0;
    let toX = 0;
    let toY = 0;
    const born = performance.now();

    const progress = () => {
      const b = sec.getBoundingClientRect();
      const run = b.height - window.innerHeight;
      return run > 0 ? Math.min(1, Math.max(0, -b.top / run)) : 0;
    };

    const frame = (now: number) => {
      const p = progress();
      shown += (p - shown) * 0.12;
      const t = (now - born) / 1000;

      // Opening: almost shut at rest, wide by not quite half way — the rest
      // of the run is the light filling the screen as the work comes up.
      const open = 1 - Math.pow(1 - ramp(shown, 0, 0.45), 2);
      const breathe = still ? 0 : Math.sin(t * 1.3) * 1.2 * (1 - open);
      // Never quite shut: with a hole this size the blades' edges run off
      // round it in a spiral, which is what makes them read as an iris and
      // not a wheel of spokes.
      const r = 17 + open * 78 + breathe;
      // The blades turn as they open.
      const twist = ((1 - open) * 38 * Math.PI) / 180;

      // A resting tilt, and the pointer's on top of it.
      rx += (toX - rx) * 0.06;
      ry += (toY - ry) * 0.06;

      // Where the light comes from: above, as the curtain falls, swinging
      // with the tilt so different blades catch it as the lens turns.
      const sun = -Math.PI / 2 + ((ry * 2.2 - rx * 1.2) * Math.PI) / 180;

      const shapes = bladeShapes(r, twist);
      for (let i = 0; i < BLADES; i++) {
        const s = shapes?.[i];
        const d = s ? s.d : "";
        bodies.current[i]?.setAttribute("d", d);
        sheens.current[i]?.setAttribute("d", d);
        const line = rims.current[i];
        const grad = rimGrads.current[i];
        if (!s || !line || !grad) {
          line?.setAttribute("opacity", "0");
          continue;
        }
        // How squarely this blade's edge faces the light.
        const lit = 0.2 + 0.8 * Math.pow(Math.max(0, Math.cos(s.facing - sun)), 1.4);
        const [near, far] = s.rim;
        line.setAttribute("x1", near[0].toFixed(2));
        line.setAttribute("y1", near[1].toFixed(2));
        line.setAttribute("x2", s.tail[0].toFixed(2));
        line.setAttribute("y2", s.tail[1].toFixed(2));
        line.setAttribute("opacity", (0.35 + 0.65 * lit).toFixed(3));
        grad.setAttribute("x1", near[0].toFixed(2));
        grad.setAttribute("y1", near[1].toFixed(2));
        grad.setAttribute("x2", far[0].toFixed(2));
        grad.setAttribute("y2", far[1].toFixed(2));
        sheens.current[i]?.setAttribute("opacity", (lit * 0.9).toFixed(3));
        sheenGrads.current[i]?.setAttribute("x1", near[0].toFixed(2));
        sheenGrads.current[i]?.setAttribute("y1", near[1].toFixed(2));
        sheenGrads.current[i]?.setAttribute("x2", s.tail[0].toFixed(2));
        sheenGrads.current[i]?.setAttribute("y2", s.tail[1].toFixed(2));
      }
      ln.style.setProperty("--rx", `${(8 + rx).toFixed(2)}deg`);
      ln.style.setProperty("--ry", `${(-6 + ry).toFixed(2)}deg`);

      // The last stretch: the lens comes at the viewer and the light takes
      // the screen.
      const out = ramp(shown, 0.38, 0.9);
      st.style.setProperty("--open", open.toFixed(4));
      st.style.setProperty("--out", out.toFixed(4));
      st.style.setProperty("--hole", (r / R).toFixed(4));

      if (fstop.current) {
        const k = Math.min(STOPS.length - 1, Math.round((1 - open) * (STOPS.length - 1)));
        fstop.current.textContent = `f/${STOPS[k]}`;
      }

      if (running) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (still || e.pointerType !== "mouse") return;
      toX = (e.clientY / window.innerHeight - 0.5) * -16;
      toY = (e.clientX / window.innerWidth - 0.5) * 22;
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    frame(performance.now());
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(sec);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const side: CSSProperties = { opacity: "calc(1 - var(--open) * 1.4)" };

  return (
    // Taller than it looks: the wall of work (WorkIndex) is pulled up over
    // its last half screen, so the cards rise into the light.
    <section ref={section} aria-label="Work" className="relative h-[200svh]">
      <div
        ref={stage}
        className="sticky top-0 h-svh overflow-hidden"
        style={{
          background: INK,
          ["--open" as string]: "0",
          ["--out" as string]: "0",
          ["--hole" as string]: "0.08",
          ["--lens" as string]: "min(76svh, 92vw)",
        }}
      >
        {/* The light behind the lens: the same curtain of light the
            homepage's brands stand in (LightCurtain), seen only through the
            hole at first, then spilling past the barrel as it opens, then
            everywhere. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            maskImage: SPILL,
            WebkitMaskImage: SPILL,
          }}
        >
          <LightCurtain className="absolute inset-0" />
        </div>

        {/* The lens, in two layers a little apart in depth, tilted. */}
        <div
          ref={lens}
          className="absolute left-1/2 top-1/2"
          style={{
            width: "var(--lens)",
            height: "var(--lens)",
            transform:
              "translate(-50%, -50%) perspective(1400px) rotateX(var(--rx, 8deg)) rotateY(var(--ry, -6deg)) scale(calc(1 + var(--out) * var(--out) * 3.2))",
            transformStyle: "preserve-3d",
            opacity: "calc(1 - var(--out) * var(--out))",
          }}
        >
          {/* Behind: the barrel's plate and its scale (and the steel the
              blades in front are filled with). */}
          <svg
            viewBox="-120 -120 240 240"
            className="absolute inset-0 h-full w-full overflow-visible"
            style={{ transform: `translateZ(${-DEPTH}px)` }}
            aria-hidden
          >
            <defs>
              {/* Blued steel: a sheen towards the hole, dark at the rim. */}
              <radialGradient id="iris-steel" cx="38%" cy="32%" r="80%">
                <stop offset="0%" stopColor="#2c2c33" />
                <stop offset="45%" stopColor="#16161a" />
                <stop offset="100%" stopColor="#09090a" />
              </radialGradient>
              <radialGradient id="iris-plate">
                <stop offset="80%" stopColor="#0d0d0f" />
                <stop offset="100%" stopColor="#1b1b20" />
              </radialGradient>
            </defs>
            <circle r={R + 9} fill="url(#iris-plate)" fillOpacity="0.85" />
            {Array.from({ length: 72 }, (_, i) => {
              const a = (i / 72) * Math.PI * 2;
              const long = i % 9 === 0;
              const r1 = R + 3;
              const r2 = R + (long ? 7 : 5);
              return (
                <line
                  key={i}
                  x1={(r1 * Math.cos(a)).toFixed(2)}
                  y1={(r1 * Math.sin(a)).toFixed(2)}
                  x2={(r2 * Math.cos(a)).toFixed(2)}
                  y2={(r2 * Math.sin(a)).toFixed(2)}
                  stroke={BONE}
                  strokeOpacity={long ? 0.45 : 0.18}
                  strokeWidth="0.35"
                />
              );
            })}
            {STOPS.map((s, i) => {
              // Round the top of the barrel, f/1.4 at the left to f/16 at the right.
              const a = Math.PI + ((i + 0.5) / STOPS.length) * Math.PI;
              const rr = R + 15;
              return (
                <text
                  key={s}
                  x={(rr * Math.cos(a)).toFixed(2)}
                  y={(rr * Math.sin(a)).toFixed(2)}
                  fill={BONE}
                  fillOpacity="0.5"
                  fontSize="4.2"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
                >
                  {s}
                </text>
              );
            })}
          </svg>

          {/* In front: the blades — blued steel, each with a sheen where
              the light falls across it and a bright rim along the edge it
              turns to the hole, running on along that edge as it fades —
              and the barrel's edge. */}
          <svg viewBox="-120 -120 240 240" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <defs>
              {Array.from({ length: BLADES }, (_, i) => (
                <linearGradient
                  key={`r${i}`}
                  id={`iris-rim-${i}`}
                  gradientUnits="userSpaceOnUse"
                  ref={(el) => {
                    rimGrads.current[i] = el;
                  }}
                >
                  <stop offset="0%" stopColor="#f4f5ff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#b9bde6" stopOpacity="0.12" />
                </linearGradient>
              ))}
              {Array.from({ length: BLADES }, (_, i) => (
                <linearGradient
                  key={`s${i}`}
                  id={`iris-sheen-${i}`}
                  gradientUnits="userSpaceOnUse"
                  ref={(el) => {
                    sheenGrads.current[i] = el;
                  }}
                >
                  <stop offset="0%" stopColor="#c9cdf2" stopOpacity="0.22" />
                  <stop offset="35%" stopColor="#8b90bd" stopOpacity="0.07" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            {Array.from({ length: BLADES }, (_, i) => (
              <path
                key={`b${i}`}
                ref={(el) => {
                  bodies.current[i] = el;
                }}
                fill="url(#iris-steel)"
                stroke="#000"
                strokeOpacity="0.7"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: BLADES }, (_, i) => (
              <path
                key={`h${i}`}
                ref={(el) => {
                  sheens.current[i] = el;
                }}
                fill={`url(#iris-sheen-${i})`}
              />
            ))}
            {Array.from({ length: BLADES }, (_, i) => (
              <line
                key={`l${i}`}
                ref={(el) => {
                  rims.current[i] = el;
                }}
                stroke={`url(#iris-rim-${i})`}
                strokeWidth="0.7"
                strokeLinecap="round"
              />
            ))}
            <circle r={R} fill="none" stroke={BONE} strokeOpacity="0.4" strokeWidth="0.6" />
            <circle r={R - 1.2} fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="1.2" />
          </svg>
        </div>

        {/* The light through the hole, spilling past the blades. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
          style={{
            width: "calc(min(76svh, 92vw) * (0.25 + var(--hole) * 1.6) + var(--out) * 220vmax)",
            height: "calc(min(76svh, 92vw) * (0.25 + var(--hole) * 1.6) + var(--out) * 220vmax)",
            // The curtain's own cool lavender, a little brighter where the
            // hole is: the source the shafts fall from.
            background: "radial-gradient(closest-side, rgba(226,228,246,0.28), rgba(150,156,205,0.12) 45%, transparent)",
            // No blur filter: the gradient is soft already, and blurring an
            // element that grows past the screen is the costliest thing
            // a page can ask of a phone.
            opacity: "calc(0.6 + var(--open) * 0.4 - var(--out) * var(--out) * 0.8)",
          }}
        />

        {/* The core: while the iris is shut, a bright point of the same
            light burning in the hole and bleeding over the blades' edges —
            something is in there. It breathes with the iris and gives way
            to the shafts as the hole widens. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
          style={{
            // Wide enough to backlight the word across it, so the light
            // shows round the letters rather than hiding behind them.
            width: "calc(var(--lens) * (0.55 + var(--hole) * 0.9))",
            height: "calc(var(--lens) * (0.55 + var(--hole) * 0.9))",
            background:
              "radial-gradient(closest-side, rgba(250,250,255,0.9), rgba(220,223,252,0.55) 14%, rgba(165,170,225,0.25) 38%, rgba(120,126,190,0.08) 65%, transparent)",
            opacity: "calc(1 - var(--open) * 0.85)",
          }}
        />

        <h1
          className="display pointer-events-none absolute inset-x-0 top-1/2 text-center leading-none"
          style={{
            color: BONE,
            fontSize: "clamp(3.5rem, 11vw, 10rem)",
            transform: "translateY(-50%) scale(calc(1 + var(--open) * 0.25))",
            opacity: "calc(1 - var(--out) * 1.4)",
            ["--dw" as string]: "62",
            ["--dg" as string]: "900",
            ["--dt" as string]: "-0.02em",
          }}
        >
          WORK
        </h1>

        {/* The count either side, parting as the iris opens. */}
        <div
          className="pointer-events-none absolute inset-x-0 flex justify-between px-4 max-md:bottom-28 md:top-1/2 md:-translate-y-1/2 md:px-10"
          style={{ color: BONE }}
        >
          <Count n={films} label="Films" style={{ ...side, transform: "translateX(calc(var(--open) * -10vw))" }} />
          <Count n={photos} label="Photography" align="right" style={{ ...side, transform: "translateX(calc(var(--open) * 10vw))" }} />
        </div>

        {/* The reading. */}
        <div
          className="mono pointer-events-none absolute inset-x-0 bottom-16 flex justify-center gap-3 max-md:hidden"
          style={{ color: BONE, fontSize: "0.6875rem", opacity: "calc(1 - var(--out) * 1.5)" }}
        >
          <span className="opacity-50">Aperture</span>
          <span ref={fstop}>f/16</span>
        </div>

        {/* The light lowers — not out — once it has filled the screen, so
            the cards rising into it read against it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: INK, opacity: "calc(max(0, var(--out) - 0.6) * 1.2)" }}
        />
      </div>
    </section>
  );
}

function Count({ n, label, align = "left", style }: { n: number; label: string; align?: "left" | "right"; style: CSSProperties }) {
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"}`} style={style}>
      <span
        className="display leading-none"
        style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", ["--dw" as string]: "62", ["--dg" as string]: "900" }}
      >
        {String(n).padStart(2, "0")}
      </span>
      <span className="mono mt-1 opacity-60" style={{ fontSize: "0.625rem" }}>
        {label}
      </span>
    </div>
  );
}
