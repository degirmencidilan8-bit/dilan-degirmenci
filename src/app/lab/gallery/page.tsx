import type { Metadata } from "next";
import { getField } from "@/data/field";
import { INK } from "@/data/palette";
import { Gallery } from "./Gallery";

export const metadata: Metadata = {
  title: "Gallery (lab) — Dilan&Batuhan",
  robots: { index: false, follow: false },
};

// A trial page, linked from nowhere: the 3D photograph tunnel
// (components/ui/3d-gallery-photography) run on the site's own work, to be
// judged before it is given a place on a real page.
export default function GalleryLab() {
  const images = getField()
    .filter((s) => s.href)
    .map((s) => ({ src: s.frames[0].src, alt: s.title ?? "" }));

  return (
    <main className="h-svh overflow-hidden" style={{ background: INK }}>
      <h1 className="sr-only">Gallery</h1>
      <Gallery images={images} />
    </main>
  );
}
