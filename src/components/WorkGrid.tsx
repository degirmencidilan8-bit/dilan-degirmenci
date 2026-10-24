"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { IndexItem, Kind } from "@/data/work-index";
import { BONE, INK } from "@/data/palette";

// The index of work: a light page, three columns of frames all cut to the
// same 16:9, even gutters, a filter in the top-left. Pulse Films' index,
// close to as-is.
//
// The one thing that is this studio's own: every frame is in black and
// white until the pointer is on it. On the light ground the grid reads as a
// contact sheet, and the frame being looked at is the only colour on the
// screen. On a touch screen nothing is "looked at" that way, so there the
// frames are in colour from the start.

const FILTERS: { key: "all" | Kind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "film", label: "Films" },
  { key: "photography", label: "Photography" },
];

export function WorkGrid({ items }: { items: IndexItem[] }) {
  const [filter, setFilter] = useState<"all" | Kind>("all");

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

  const shown = filter === "all" ? items : items.filter((i) => i.kind === filter);

  return (
    <>
      <div className="mb-5 flex gap-6 px-1" role="tablist" aria-label="Filter work">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => choose(f.key)}
            className="mono transition-opacity duration-200"
            style={{
              color: INK,
              opacity: filter === f.key ? 1 : 0.42,
              borderBottom: `1px solid ${filter === f.key ? INK : "transparent"}`,
              paddingBottom: 2,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {shown.map((it, n) => (
          <li key={it.key}>
            <Link
              href={it.href}
              className="work-frame group relative block aspect-video overflow-hidden"
              style={{ background: "#d9d3c5" }}
            >
              <Image
                src={it.img}
                alt={it.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                // The first two rows are on screen on arrival.
                loading={n < 6 ? "eager" : "lazy"}
                className="object-cover"
                style={{ objectPosition: it.pos ?? "50% 50%" }}
              />
              <div className="work-caption absolute inset-x-0 bottom-0 p-4">
                <p className="mono" style={{ color: BONE }}>
                  {it.title}
                </p>
                <p className="mono mt-1" style={{ color: BONE, opacity: 0.72, fontSize: "0.6875rem" }}>
                  {it.sub}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
