"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import imageLoader from "@/lib/image-loader";

// What plays inside the homepage's frame: the studio's opening film when
// there is one, and until then a hard-cut sequence of stills.
//
// Hard cuts, not cross-fades. A cut is what an edit does; a dissolve is
// what a slideshow does.

const HOLD = 1300;

export function OpeningFrame({ video, stills }: { video: string | null; stills: string[] }) {
  if (video) {
    return (
      <video
        src={video}
        // The first still stands in until the film's first frame decodes,
        // so the frame is never an empty box.
        poster={stills[0] ? imageLoader({ src: stills[0], width: 1600 }) : undefined}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  return <Cuts stills={stills} />;
}

function Cuts({ stills }: { stills: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % stills.length), HOLD);
    return () => clearInterval(t);
  }, [stills.length]);

  return (
    <>
      {stills.map((src, n) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          // Every frame is fetched from the start, so a cut is never a cut
          // to an empty frame while a file arrives.
          loading="eager"
          fetchPriority={n === 0 ? "high" : undefined}
          className="object-cover"
          style={{ opacity: n === i ? 1 : 0 }}
        />
      ))}
    </>
  );
}
