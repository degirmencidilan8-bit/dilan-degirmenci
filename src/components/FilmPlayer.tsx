"use client";

import Image from "next/image";
import { useState } from "react";
import { BONE } from "@/data/palette";

// A film, sized as large as the screen allows at its own ratio, showing a
// frame from itself until someone presses play — then the film, with sound
// and the browser's own controls.
//
// Nothing is fetched before the press: the files are the original exports
// and run to hundreds of megabytes.

export function FilmPlayer({
  src,
  poster,
  title,
  ratio,
}: {
  src: string;
  poster?: string;
  title: string;
  /** Width over height. */
  ratio: number;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="relative mx-auto overflow-hidden bg-ink-soft"
      style={{
        aspectRatio: ratio,
        // As wide as the page allows, and never so tall that the title
        // line below it falls onto the corner words.
        width: `min(88vw, calc((100svh - 17rem) * ${ratio.toFixed(4)}))`,
      }}
    >
      {playing ? (
        <video src={src} controls autoPlay playsInline className="absolute inset-0 h-full w-full bg-black object-contain" />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
          className="group absolute inset-0"
        >
          {poster ? (
            <Image src={poster} alt="" fill sizes="88vw" loading="eager" fetchPriority="high" className="object-cover" />
          ) : null}
          {/* A plain triangle in a hairline square — not a glossy button. */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span
              className="flex h-16 w-16 items-center justify-center border transition-colors duration-300 group-hover:bg-black/30"
              style={{ borderColor: "rgba(235,230,218,0.75)" }}
            >
              <span
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "9px solid transparent",
                  borderBottom: "9px solid transparent",
                  borderLeft: `15px solid ${BONE}`,
                  marginLeft: 4,
                }}
              />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
