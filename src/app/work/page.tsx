import type { Metadata } from "next";
import { WorkIndex } from "@/components/WorkIndex";
import { getField } from "@/data/field";
import { INK } from "@/data/palette";
import { getWorkIndex } from "@/data/work-index";

export const metadata: Metadata = {
  title: "Work — Dilan&Batuhan",
};

// The index: films and photography as one wall of cards on the dark
// ground, opened by an aperture, with a globe as the other view. See
// WorkIndex. (Before it: a light page of greyscale 16:9 frames, WorkGrid.)
export default function WorkPage() {
  const field = getField().filter((s) => s.href);
  // Each card carries its project's whole set, to cut through on a look.
  const sets = new Map(field.map((s) => [s.href!, s.frames]));
  const cards = getWorkIndex().map((it) => ({ ...it, frames: sets.get(it.href) ?? [] }));

  return (
    <main className="min-h-svh" style={{ background: INK }}>
      <WorkIndex cards={cards} slots={field} />
    </main>
  );
}
