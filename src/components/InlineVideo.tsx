"use client";

import { useEffect, useRef, useState } from "react";
import imageLoader from "@/lib/image-loader";

// A short film in a project's sequence: muted, looping, playing only while
// it is on screen. Nothing is fetched until it is close to being seen.
export function InlineVideo({ src, label, poster }: { src: string; label?: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
        setInView(e.intersectionRatio > 0.35);
      },
      { rootMargin: "50% 0px", threshold: [0, 0.35, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Play and pause after the source is on the element. Deciding inside the
  // observer missed a film already on screen when the page opened: the
  // observer fired once, before the source was attached, and never again.
  useEffect(() => {
    const v = ref.current;
    if (!v || !near) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [near, inView]);

  return (
    <video
      ref={ref}
      src={near ? src : undefined}
      poster={poster ? imageLoader({ src: poster, width: 1024 }) : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className="absolute inset-0 h-full w-full bg-ink-soft object-cover"
    />
  );
}
