"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { FieldSlot } from "@/data/field";
import { BONE } from "@/data/palette";

// The work as a globe. Every project's lead picture is set on the surface of
// one sphere that turns as the page is scrolled, can be dragged round by
// hand, and drifts on its own when left alone. The word WORK and the count
// stand either side of it and part as the section opens.
//
// Plain CSS 3D, no WebGL: the sphere is one element with preserve-3d and
// every picture is a child placed on it once; per frame only the sphere's
// own rotation and each picture's opacity change. Pictures on the far side
// fall back to almost nothing and cannot be clicked.
//
// Look at a picture and it cuts through its own set, the way the field
// below the opener used to (see Field); its name comes up under the globe.

const CUT_MS = 700;
/** Degrees turned over the whole scroll of the section. */
const SCROLL_TURN = 420;
/** Idle drift, degrees per second. */
const DRIFT = 5;
/** Degrees per pixel dragged. */
const DRAG = 0.28;
const TILT = -14;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

type Placed = FieldSlot & { lon: number; lat: number; x: number; y: number; z: number };

// Spread evenly over the sphere (a Fibonacci lattice), so no two pictures
// crowd and no pole is bare.
function placeAll(slots: FieldSlot[]): Placed[] {
  const n = slots.length;
  return slots.map((s, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const lat = Math.asin(y);
    const lon = (i * GOLDEN) % (Math.PI * 2);
    // The same point the CSS below puts the picture at: rotateY(lon)
    // rotateX(lat) translateZ(R), on a unit sphere, y pointing down.
    return {
      ...s,
      lon,
      lat,
      x: Math.cos(lat) * Math.sin(lon),
      y: -Math.sin(lat),
      z: Math.cos(lat) * Math.cos(lon),
    };
  });
}

export function WorkSphere({ slots }: { slots: FieldSlot[] }) {
  const placed = useMemo(() => placeAll(slots), [slots]);
  const linked = placed.filter((p) => p.href);
  const [look, setLook] = useState<string | null>(null);

  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const globe = useRef<HTMLDivElement>(null);
  const tiles = useRef(new Map<string, HTMLElement>());
  const lookRef = useRef<string | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    lookRef.current = look;
  }, [look]);

  useEffect(() => {
    const sec = section.current;
    const stg = stage.current;
    const glb = globe.current;
    if (!sec || !stg || !glb) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = false;
    let last = performance.now();
    let drift = 0;
    let hand = 0;
    let velocity = 0;
    let spin = 0;
    let tilt = TILT;
    let tiltTo = TILT;
    let open = 0;
    let down: { x: number; at: number } | null = null;

    const size = () => {
      // On a phone the globe takes most of the width; the words sit over it.
      const share = window.innerWidth < 768 ? 0.44 : 0.36;
      const r = Math.min(window.innerWidth * share, window.innerHeight * 0.34);
      stg.style.setProperty("--r", `${r}px`);
      stg.style.setProperty("--t", `${r * 0.3}px`);
    };

    const progress = () => {
      const box = sec.getBoundingClientRect();
      const run = box.height - window.innerHeight;
      return run > 0 ? Math.min(1, Math.max(0, -box.top / run)) : 0;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const p = progress();
      if (!still && !down && !lookRef.current) drift += DRIFT * dt;
      if (!down) {
        hand += velocity;
        velocity *= 0.94;
        if (Math.abs(velocity) < 0.01) velocity = 0;
      }
      const target = p * SCROLL_TURN + drift + hand;
      spin += (target - spin) * 0.09;
      tilt += (tiltTo - tilt) * 0.06;
      // The section opens over its first fifth: the globe grows into place
      // and the two words part to either side of it.
      const o = Math.min(1, p / 0.2);
      open += (o - open) * 0.12;
      const ease = 1 - Math.pow(1 - open, 3);

      glb.style.transform = `scale(${0.55 + 0.45 * ease}) rotateX(${tilt}deg) rotateY(${spin}deg)`;
      stg.style.setProperty("--open", ease.toFixed(4));

      const s = (spin * Math.PI) / 180;
      const t = (tilt * Math.PI) / 180;
      const sinS = Math.sin(s);
      const cosS = Math.cos(s);
      const sinT = Math.sin(t);
      const cosT = Math.cos(t);
      for (const q of placed) {
        const el = tiles.current.get(q.key);
        if (!el) continue;
        // Depth after the globe's turn: 1 faces the viewer, -1 faces away.
        const z1 = -q.x * sinS + q.z * cosS;
        const d = q.y * sinT + z1 * cosT;
        const lit = lookRef.current;
        const front = d > 0 ? 0.35 + 0.65 * d : 0.06 + 0.29 * (d + 1);
        const dim = lit && lit !== q.key ? 0.25 : 1;
        el.style.opacity = (front * dim).toFixed(3);
        el.style.pointerEvents = d > 0.2 ? "auto" : "none";
      }

      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only turn while the section is on screen.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(sec);

    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, at: e.clientX };
      dragged.current = false;
      velocity = 0;
    };
    const onMove = (e: PointerEvent) => {
      // A little follow of the pointer's height, so the globe answers the
      // hand before it is touched.
      if (e.pointerType === "mouse") {
        const h = window.innerHeight;
        tiltTo = TILT + ((e.clientY - h / 2) / h) * -16;
      }
      if (!down) return;
      const dx = e.clientX - down.x;
      down.x = e.clientX;
      if (Math.abs(e.clientX - down.at) > 6) dragged.current = true;
      hand += dx * DRAG;
      velocity = dx * DRAG;
    };
    const onUp = () => {
      down = null;
    };

    size();
    window.addEventListener("resize", size);
    stg.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", size);
      stg.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [placed]);

  const lit = placed.find((p) => p.key === look && p.href);
  const litIndex = lit ? linked.indexOf(lit) : -1;

  return (
    <section ref={section} aria-label="Work" className="relative h-[260svh] md:h-[320svh]">
      <div
        ref={stage}
        className="sticky top-0 h-svh select-none overflow-hidden"
        style={{ touchAction: "pan-y", perspective: "1400px", ["--open" as string]: "0" }}
      >
        {/* The two words, close in over the globe as it arrives and parted
            to the edges once it is open. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between px-3 md:px-6"
          style={{ color: BONE }}
        >
          <span
            className="display leading-none"
            style={{
              fontSize: "clamp(2.5rem, 9vw, 9.5rem)",
              transform: "translateX(calc((1 - var(--open)) * 18vw))",
              ["--dw" as string]: "62",
              ["--dg" as string]: "900",
            }}
          >
            WORK
          </span>
          <span
            className="display leading-none"
            style={{
              fontSize: "clamp(2.5rem, 9vw, 9.5rem)",
              transform: "translateX(calc((1 - var(--open)) * -18vw))",
              ["--dw" as string]: "62",
              ["--dg" as string]: "900",
            }}
          >
            {String(linked.length).padStart(2, "0")}
          </span>
        </div>

        <div
          ref={globe}
          className="absolute left-1/2 top-1/2 z-10 h-0 w-0"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          {placed.map((p) => (
            <Tile
              key={p.key}
              slot={p}
              on={look === p.key}
              onLook={setLook}
              dragged={dragged}
              register={(el) => {
                if (el) tiles.current.set(p.key, el);
                else tiles.current.delete(p.key);
              }}
            />
          ))}
        </div>

        {/* The name of the picture being looked at. */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-20 z-20 flex flex-col items-center text-center md:bottom-16"
          style={{ color: BONE }}
        >
          {lit ? (
            <>
              <span className="mono opacity-55" style={{ fontSize: "0.6875rem" }}>
                {String(litIndex + 1).padStart(2, "0")}/{String(linked.length).padStart(2, "0")}
              </span>
              <span
                className="display mt-1 leading-none"
                style={{ fontSize: "clamp(1.75rem, 3.6vw, 3.25rem)", ["--dw" as string]: "70", ["--dg" as string]: "800" }}
              >
                {lit.title}
              </span>
              <span className="mono mt-2 opacity-55" style={{ fontSize: "0.625rem" }}>
                {lit.sub}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Tile({
  slot,
  on,
  onLook,
  dragged,
  register,
}: {
  slot: Placed;
  on: boolean;
  onLook: (key: string | null) => void;
  dragged: RefObject<boolean>;
  register: (el: HTMLElement | null) => void;
}) {
  const [cuts, setCuts] = useState(0);
  const [primed, setPrimed] = useState(false);
  const n = slot.frames.length;
  const i = on ? cuts % n : 0;
  const first = slot.frames[0];

  useEffect(() => {
    if (!on || n < 2) return;
    const t = setInterval(() => setCuts((x) => x + 1), CUT_MS);
    return () => clearInterval(t);
  }, [on, n]);

  const enter = () => {
    setPrimed(true);
    onLook(slot.key);
  };
  const leave = () => onLook(null);

  const box = {
    onMouseEnter: enter,
    onMouseLeave: leave,
    className: "absolute left-0 top-0 block",
    style: {
      height: "var(--t)",
      width: `calc(var(--t) * ${first.ratio.toFixed(4)})`,
      // Rounded, so the server's string and the browser's agree on hydration.
      transform: `translate(-50%, -50%) rotateY(${((slot.lon * 180) / Math.PI).toFixed(2)}deg) rotateX(${((slot.lat * 180) / Math.PI).toFixed(2)}deg) translateZ(var(--r))${on ? " scale(1.35)" : ""}`,
      transition: "transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1)",
      background: "#1a1a18",
      opacity: 0,
    },
  };

  const inner = (primed || on ? slot.frames : slot.frames.slice(0, 1)).map((f, k) => (
    <Image
      key={f.src}
      src={f.src}
      alt={k === 0 ? (slot.title ?? "") : ""}
      fill
      sizes="(max-width: 768px) 160px, 320px"
      loading="lazy"
      draggable={false}
      className="object-cover"
      style={{ opacity: k === i ? 1 : 0, objectPosition: f.pos ?? "50% 50%" }}
    />
  ));

  if (!slot.href) {
    // A loose frame: no link, no name. The viewfinder still frames it.
    return (
      <div ref={register} data-cursor aria-hidden {...box}>
        {inner}
      </div>
    );
  }
  return (
    <Link
      ref={register}
      href={slot.href}
      aria-label={`${slot.title} — ${slot.sub}`}
      onFocus={enter}
      onBlur={leave}
      draggable={false}
      // A drag that happens to end on a picture is a turn, not a click.
      onClickCapture={(e) => {
        if (dragged.current) e.preventDefault();
      }}
      {...box}
    >
      {inner}
    </Link>
  );
}
