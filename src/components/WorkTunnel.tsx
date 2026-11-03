"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { LightCurtain } from "@/components/LightCurtain";
import InfiniteGallery from "@/components/ui/3d-gallery-photography";
import imageLoader from "@/lib/image-loader";
import { BONE, INK, RED } from "@/data/palette";

// The work as a tunnel the page scrolls through: every project's lead
// picture comes towards the viewer out of the dark (components/ui/
// 3d-gallery-photography), and the room it hangs in is lit by the work.
//
// From the back forward:
//   1. shafts of light falling through a curtain (LightCurtain), cool
//      lavender warmed by the colour of the picture nearest the viewer,
//      changing slowly as the pictures pass;
//   2. the projects' names, huge and outlined, drifting in two bands;
//   3. the tunnel;
//   4. two red light leaks breathing at the edges, the way film fogs where
//      light gets into the camera;
//   5. a vignette closing the corners;
//   6. stepped film grain, heavier than the site's own.
//
// Look at a picture and its name comes up below; click it and you are in
// the project.

export interface TunnelItem {
  src: string;
  title: string;
  sub: string;
  href: string;
}

export function WorkTunnel({ items }: { items: TunnelItem[] }) {
  const router = useRouter();
  const [tint, setTint] = useState<string>();
  const [front, setFront] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  // Kept stable across renders: a new array would reload and reset the
  // tunnel every time the name under it changes.
  const images = useMemo(
    () => items.map((it) => ({ src: imageLoader({ src: it.src, width: 1024 }), alt: it.title })),
    [items],
  );
  const shown = hover ?? front;
  const item = shown !== null ? items[shown] : null;
  const names = items.map((it) => it.title).join("  /  ");

  const onFront = useCallback((i: number, color: string) => {
    setTint(color);
    setFront(i);
  }, []);
  const onSelect = useCallback((i: number) => router.push(items[i].href), [router, items]);

  return (
    <section aria-label="Work" className="relative h-[400svh]">
      <div
        className="sticky top-0 h-svh overflow-hidden"
        style={{ background: INK }}
        // The viewfinder frames whatever the pointer is on.
        data-cursor={hover !== null ? "" : undefined}
      >
        {/* 1. Light from the work, falling through a curtain. */}
        <LightCurtain tint={tint} className="pointer-events-none absolute inset-0" />

        {/* 2. The names, drifting. Doubled so the loop has no seam. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col justify-between py-[12svh] opacity-[0.09]">
          {[0, 1].map((row) => (
            <div key={row} className="flex w-max whitespace-nowrap" style={{ animation: `tunnel-drift ${row ? 140 : 110}s linear infinite`, animationDirection: row ? "reverse" : "normal" }}>
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  className="display display-outline leading-none"
                  style={{
                    fontSize: "clamp(5rem, 16vw, 15rem)",
                    paddingRight: "0.4em",
                    ["--stroke" as string]: "1px",
                    ["--stroke-color" as string]: BONE,
                    ["--dw" as string]: "62",
                    ["--dg" as string]: "900",
                  }}
                >
                  {names}
                  {"  /  "}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* 3. The tunnel. */}
        <InfiniteGallery
          images={images}
          drive="scroll"
          speed={1}
          visibleCount={12}
          onFront={onFront}
          onHover={setHover}
          onSelect={onSelect}
          className="absolute inset-0"
        />

        {/* 4. Light leaks. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen">
          <div
            className="absolute -left-[20vw] -top-[25vh] h-[70vh] w-[60vw] rounded-full"
            style={{ background: `radial-gradient(closest-side, ${RED}, transparent)`, filter: "blur(40px)", animation: "leak-a 11s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute -bottom-[30vh] -right-[15vw] h-[65vh] w-[55vw] rounded-full"
            style={{ background: "radial-gradient(closest-side, hsl(12 100% 50%), transparent)", filter: "blur(50px)", animation: "leak-b 15s ease-in-out infinite alternate" }}
          />
        </div>

        {/* 5. Vignette. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          // Centred high, so the top edge — where the light falls from —
          // stays open and the sides and floor close in.
          style={{ background: `radial-gradient(ellipse 85% 95% at 50% 25%, transparent 45%, ${INK} 100%)` }}
        />

        {/* 6. Grain. */}
        <div aria-hidden className="tunnel-grain pointer-events-none absolute inset-0" />

        {/* The picture nearest the viewer, or the one under the pointer. */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-20 flex flex-col items-center text-center md:bottom-16"
          // Pictures pass behind the name; a soft shadow keeps it readable.
          style={{ color: BONE, textShadow: "0 0 24px rgba(12, 12, 11, 0.9), 0 0 4px rgba(12, 12, 11, 0.6)" }}
        >
          {item && shown !== null ? (
            <>
              <span className="mono opacity-55" style={{ fontSize: "0.6875rem" }}>
                {String(shown + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
              </span>
              <span
                className="display mt-1 leading-none transition-opacity"
                style={{
                  fontSize: "clamp(1.75rem, 3.6vw, 3.25rem)",
                  opacity: hover !== null ? 1 : 0.7,
                  ["--dw" as string]: "70",
                  ["--dg" as string]: "800",
                }}
              >
                {item.title}
              </span>
              <span className="mono mt-2 opacity-55" style={{ fontSize: "0.625rem" }}>
                {item.sub}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
