"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { IrisOpening } from "@/components/IrisOpening";
import { WorkSphere } from "@/components/WorkSphere";
import type { FieldFrame, FieldSlot } from "@/data/field";
import { BONE, INK } from "@/data/palette";
import type { IndexItem, Kind } from "@/data/work-index";

// The index of work, on the dark ground.
//
// It opens on a lens's iris (IrisOpening) that the scroll opens, light
// spilling through it until it fills the screen and the work comes up
// under it.
//
// The work itself is a two-column wall of large dark cards, each picture
// hung in the middle of its card at its own proportions — matted, not
// cropped, so a portrait from a concert and a still from a film both read
// whole. Point at a card and the picture opens out to fill it and starts
// cutting through the rest of its set. On a touch screen the pictures are
// simply there, whole and in colour.
//
// GRID / SPHERE: the same work on a globe instead (WorkSphere).
//
// The structure is taken from bleibtgleich.dev/work (an aperture that
// opens onto a wall of cards, a view switch); the dark ground, the type,
// the cuts and the square labels are this studio's.

const FILTERS: { key: "all" | Kind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "film", label: "Films" },
  { key: "photography", label: "Photography" },
];

const CUT_MS = 700;

export interface WorkCard extends IndexItem {
  frames: FieldFrame[];
}

export function WorkIndex({ cards, slots }: { cards: WorkCard[]; slots: FieldSlot[] }) {
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [view, setView] = useState<"grid" | "sphere">("grid");

  // The filter lives in the address too (/work?filter=films), so a link to
  // "the films" — the old Films page included — lands on the films. Read
  // after mount: the page itself is static.
  useEffect(() => {
    const t = setTimeout(() => {
      const q = new URLSearchParams(window.location.search).get("filter");
      if (q === "films") setFilter("film");
      if (q === "photography") setFilter("photography");
    }, 0);
    return () => clearTimeout(t);
  }, []);

  function choose(key: "all" | Kind) {
    setFilter(key);
    const url = key === "all" ? "/work" : `/work?filter=${key === "film" ? "films" : "photography"}`;
    window.history.replaceState(null, "", url);
  }

  const shown = filter === "all" ? cards : cards.filter((c) => c.kind === filter);
  const shownSlots = useMemo(() => {
    const hrefs = new Set(shown.map((c) => c.href));
    return slots.filter((s) => s.href && hrefs.has(s.href));
  }, [shown, slots]);

  const films = cards.filter((c) => c.kind === "film").length;

  return (
    <>
      <IrisOpening films={films} photos={cards.length - films} />

      {/* The wall rises into the iris's light rather than after it: it is
          pulled up over the end of the opening, and its ground is clear at
          the top and dark further down, so the first cards stand in the
          light and the light settles into the dark beneath them. */}
      <div
        id="work"
        className="relative z-10 px-2 pb-28 md:px-3"
        style={{ marginTop: "-50svh", background: `linear-gradient(to bottom, transparent 0, ${INK} 55svh)` }}
      >
        {/* Clear of the corner words above it. */}
        <div className="flex items-center justify-between gap-4 px-1 pb-5 pt-16 md:pt-20">
          <div className="flex gap-6" role="tablist" aria-label="Filter work">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => choose(f.key)}
                className="mono transition-opacity duration-200"
                style={{
                  color: BONE,
                  opacity: filter === f.key ? 1 : 0.42,
                  borderBottom: `1px solid ${filter === f.key ? BONE : "transparent"}`,
                  paddingBottom: 2,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="mono flex gap-2" style={{ color: BONE }} aria-label="View">
            {(["grid", "sphere"] as const).map((v, i) => (
              <span key={v} className="flex gap-2">
                {i ? <span className="opacity-40">/</span> : null}
                <button
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className="transition-opacity"
                  style={{ opacity: view === v ? 1 : 0.42 }}
                >
                  {v}
                </button>
              </span>
            ))}
          </div>
        </div>

        {view === "grid" ? (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {shown.map((c, n) => (
              <li key={c.key}>
                <Card card={c} index={cards.indexOf(c)} eager={n < 4} delay={(n % 2) * 0.14} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="-mx-2 md:-mx-3">
            <WorkSphere key={filter} slots={shownSlots} />
          </div>
        )}
      </div>
    </>
  );
}

/** One card: the picture matted in the middle; under the pointer it opens
 * out to fill the card and cuts through its set. */
function Card({ card, index, eager, delay }: { card: WorkCard; index: number; eager: boolean; delay: number }) {
  const frames = card.frames.length ? card.frames : [{ src: card.img, ratio: 16 / 9, pos: card.pos }];
  const box = useRef<HTMLAnchorElement>(null);
  // Comes up out of the dark the first time it reaches the screen; the
  // right-hand card of a row a beat after the left.
  const [seen, setSeen] = useState(false);
  const [on, setOn] = useState(false);
  const [primed, setPrimed] = useState(false);
  const [cuts, setCuts] = useState(0);
  const n = frames.length;
  const i = on ? cuts % n : 0;
  const r = frames[0].ratio;

  useEffect(() => {
    if (!on || n < 2) return;
    const t = setInterval(() => setCuts((x) => x + 1), CUT_MS);
    return () => clearInterval(t);
  }, [on, n]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const enter = () => {
    setPrimed(true);
    setOn(true);
  };
  const leave = () => {
    setOn(false);
    setCuts(0);
  };

  return (
    <Link
      ref={box}
      href={card.href}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      aria-label={`${card.title} — ${card.sub}`}
      className="work-card relative block aspect-[4/3] overflow-hidden md:aspect-[3/2]"
      style={{
        background: "#141412",
        containerType: "size",
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : "translateY(28px)",
        transition: `opacity 1s ease ${delay}s, transform 1.1s cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}s`,
      }}
    >
      {/* The mat: the picture at its own proportions, centred; filling the
          card while it is looked at. */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          aspectRatio: String(r),
          width: on ? `max(100cqw, calc(100cqh * ${r.toFixed(4)}))` : `min(66cqw, calc(64cqh * ${r.toFixed(4)}))`,
          transition: "width 0.8s cubic-bezier(0.2, 0.7, 0.2, 1)",
        }}
      >
        {(primed ? frames : frames.slice(0, 1)).map((f, k) => (
          <Image
            key={f.src}
            src={f.src}
            alt={k === 0 ? card.title : ""}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            loading={eager && k === 0 ? "eager" : "lazy"}
            className="object-cover"
            style={{ opacity: k === i ? 1 : 0, objectPosition: f.pos ?? "50% 50%" }}
          />
        ))}
      </div>

      {/* Under the picture's own light, the label needs a floor to stand on
          once the picture fills the card. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 transition-opacity duration-500"
        style={{ background: `linear-gradient(to top, ${INK}cc, transparent)`, opacity: on ? 1 : 0 }}
      />

      <span className="mono absolute right-3 top-3 opacity-50" style={{ color: BONE, fontSize: "0.625rem" }}>
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5" style={{ color: BONE }}>
        <span className="mono shrink-0 border px-1.5 py-0.5" style={{ fontSize: "0.5625rem", borderColor: BONE }}>
          {card.kind === "film" ? "Film" : "Photo"}
        </span>
        <span className="mono truncate" style={{ fontSize: "0.6875rem" }}>
          {card.title}
        </span>
        <span className="mono hidden truncate opacity-55 sm:inline" style={{ fontSize: "0.625rem" }}>
          {card.sub}
        </span>
      </div>
    </Link>
  );
}
