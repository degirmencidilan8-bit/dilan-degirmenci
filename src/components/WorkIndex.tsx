"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { IrisOpening } from "@/components/IrisOpening";
import { WorkSphere } from "@/components/WorkSphere";
import type { FieldFrame, FieldSlot } from "@/data/field";
import { BONE, INK } from "@/data/palette";
import { dialStyle, typeDial } from "@/data/typography";
import type { IndexItem, Kind } from "@/data/work-index";

// The index of work, on the dark ground.
//
// It opens on a lens's iris (IrisOpening) that the scroll opens, light
// spilling through it until it fills the screen and the work comes up
// under it.
//
// The work itself is a two-column wall of large dark cards. Each cover
// fills its card held down in the dark, so the covers stop arguing with
// one another and the wall reads as one thing, and the brand's name runs
// across it in that project's own type setting, its letters rising in
// when the card first comes into view. Point at a card and the picture
// comes up into its own light, the name opens wider, and the card starts
// cutting through the rest of its set.
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

/** The name across the card, set in its project's own tone (the same
 * width and weight as on the project page) and sized to the card. Its
 * letters rise into place one after another the first time the card is
 * seen; under the pointer the name opens wider. */
function CardName({ title, slug, seen, on, delay }: { title: string; slug: string; seen: boolean; on: boolean; delay: number }) {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const d = typeDial(slug);
  // Room left so the wider setting under the pointer still fits.
  const wider = Math.min(125, d.wdth + 16);

  useEffect(() => {
    const b = box.current;
    const l = line.current;
    if (!b || !l) return;
    const fit = () => {
      l.style.fontSize = "100px";
      const w = l.scrollWidth;
      if (!w || !b.clientWidth) return;
      const grow = wider / d.wdth;
      const px = Math.min(((b.clientWidth * 0.86) / (w * grow)) * 100, b.clientHeight * 0.36);
      l.style.fontSize = `${px.toFixed(1)}px`;
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    return () => ro.disconnect();
  }, [d.wdth, wider]);

  return (
    // Negative where it crosses the picture, like the names on the
    // project pages, so it reads over a white wall as well as a dark room.
    <div ref={box} aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center mix-blend-difference">
      <span
        ref={line}
        className="display flex whitespace-nowrap leading-[0.86]"
        style={{
          ...dialStyle(d),
          ["--dw" as string]: String(on ? wider : d.wdth),
          color: BONE,
          fontSize: "8cqw",
          transition: "font-variation-settings 0.9s cubic-bezier(0.2, 0.7, 0.2, 1)",
        }}
      >
        {[...title].map((ch, k) => (
          <span key={k} className="inline-block overflow-hidden pb-[0.06em]">
            <span
              className="work-letter inline-block"
              style={{
                transform: seen ? "none" : "translateY(105%)",
                transition: `transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) ${(delay + 0.15 + k * 0.035).toFixed(3)}s`,
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}

/** One card: the picture filling it, held down in the dark so the cards
 * read as one wall and the name across it carries the card; under the
 * pointer the picture comes up into its own light and cuts through its
 * set. */
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
  const slug = card.href.split("/").pop() ?? "";

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
      {/* The picture fills the card, dark and a little drained at rest so
          no one cover shouts over the others; looked at, it comes up and
          settles back from a slight push-in. */}
      <div
        className="absolute inset-0"
        style={{
          filter: on ? "brightness(0.85) saturate(1)" : "brightness(0.58) saturate(0.65)",
          transform: on ? "scale(1)" : "scale(1.06)",
          transition: "filter 0.8s ease, transform 1.4s cubic-bezier(0.2, 0.7, 0.2, 1)",
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

      {/* The edges fall away into the ground, so the name sits in a pool
          of the picture's light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(120% 90% at 50% 50%, transparent 45%, ${INK}99 100%)` }}
      />

      <CardName title={card.title} slug={slug} seen={seen} on={on} delay={delay} />

      <span className="mono absolute right-3 top-3 opacity-50" style={{ color: BONE, fontSize: "0.625rem" }}>
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5" style={{ color: BONE }}>
        <span className="mono shrink-0 border px-1.5 py-0.5" style={{ fontSize: "0.5625rem", borderColor: BONE }}>
          {card.kind === "film" ? "Film" : "Photo"}
        </span>
        <span className="mono truncate opacity-70" style={{ fontSize: "0.625rem" }}>
          {card.sub}
        </span>
      </div>
    </Link>
  );
}
