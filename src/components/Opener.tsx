"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Amp } from "@/components/Corners";
import type { ReelFrame } from "@/data/opener";
import { BONE } from "@/data/palette";

// The first screen. One large frame in the middle of the dark, cutting
// hard through the reel (data/opener.ts) — no fade, the way an edit
// moves — with the studio's name straight across it in difference, so it
// turns negative where it crosses the picture. The frame is the way into
// whichever project is up; a hand on it holds the cut.

const HOLD_MS = 1400;
const CUT_MS = 600;
/** How many frames are put on the page ahead of the one showing. */
const AHEAD = 3;

export function Opener({ reel }: { reel: ReelFrame[] }) {
  const n = reel.length;
  const [s, setS] = useState({ i: 0, upto: Math.min(n, AHEAD + 1) });
  const loaded = useRef(new Set<number>());
  const held = useRef(false);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    if (n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    if (section.current) io.observe(section.current);
    let t = 0;
    const tick = () => {
      if (visible && !held.current && !document.hidden) {
        // A frame that has not arrived yet is waited for, never shown blank.
        setS((x) => {
          const i = (x.i + 1) % n;
          if (!loaded.current.has(i)) return x;
          return { i, upto: Math.max(x.upto, Math.min(n, i + AHEAD + 1)) };
        });
      }
      t = window.setTimeout(tick, CUT_MS);
    };
    t = window.setTimeout(tick, HOLD_MS);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [n]);

  if (!n) return null;
  const f = reel[s.i];

  return (
    <section ref={section} className="relative isolate h-svh min-h-[34rem] overflow-hidden">
      <h1 className="sr-only">Dilan &amp; Batuhan</h1>

      <Link
        href={f.href}
        aria-label={`${f.title} — ${f.sub}`}
        className="reel-frame absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{ background: "#1a1a18" }}
        onMouseEnter={() => (held.current = true)}
        onMouseLeave={() => (held.current = false)}
      >
        {reel.slice(0, s.upto).map((m, k) => (
          <Image
            key={m.src}
            src={m.src}
            alt={k === s.i ? m.title : ""}
            fill
            sizes="(max-width: 768px) 92vw, 75vw"
            loading="eager"
            fetchPriority={k === 0 ? "high" : "auto"}
            className="object-cover"
            style={{ opacity: k === s.i ? 1 : 0, objectPosition: m.pos ?? "50% 50%" }}
            onLoad={() => loaded.current.add(k)}
          />
        ))}
      </Link>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center mix-blend-difference"
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

      {/* What is up, and where it sits in the reel. */}
      <div
        className="mono pointer-events-none absolute inset-x-5 bottom-16 flex items-end justify-between gap-6 md:inset-x-10 md:bottom-20"
        style={{ color: BONE }}
      >
        <p className="leading-relaxed">
          {f.title}
          <br />
          <span className="opacity-55">{f.sub}</span>
        </p>
        <p className="tabular-nums opacity-55">
          {String(s.i + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}
