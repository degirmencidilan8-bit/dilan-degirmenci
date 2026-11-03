"use client";

import { Amp } from "@/components/Corners";
import InfiniteGallery from "@/components/ui/3d-gallery-photography";
import imageLoader from "@/lib/image-loader";
import { BONE } from "@/data/palette";

// The tunnel, fed the lead picture of every project as its prebuilt 1600px
// WebP rather than the original export, with the studio's name over it.
export function Gallery({ images }: { images: { src: string; alt: string }[] }) {
  const sized = images.map((img) => ({ src: imageLoader({ src: img.src, width: 1600 }), alt: img.alt }));

  return (
    <>
      <InfiniteGallery images={sized} speed={1.2} visibleCount={12} className="h-svh w-full overflow-hidden" />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 flex items-center justify-center px-3 text-center mix-blend-exclusion"
        style={{ color: BONE }}
      >
        <p
          className="display whitespace-nowrap leading-none"
          style={{
            fontSize: "clamp(3rem, 11vw, 13rem)",
            ["--dw" as string]: "62",
            ["--dg" as string]: "900",
            ["--dt" as string]: "-0.02em",
          }}
        >
          DILAN<Amp />BATUHAN
        </p>
      </div>

      <div className="mono pointer-events-none fixed inset-x-0 bottom-16 text-center" style={{ color: BONE, fontSize: "0.6875rem" }}>
        <p>Wheel, arrow keys or drag</p>
        <p className="opacity-55">Plays itself after three seconds</p>
      </div>
    </>
  );
}
