import type { Metadata } from "next";
import { WorkGrid } from "@/components/WorkGrid";
import { BONE, INK } from "@/data/palette";
import { getWorkIndex } from "@/data/work-index";

export const metadata: Metadata = {
  title: "Work — Dilan&Batuhan",
};

// The index: films and photography in one grid on the light ground. See
// WorkGrid and data/work-index.ts.
export default function WorkPage() {
  return (
    <main
      data-tone="light"
      className="min-h-svh px-3 pb-24 pt-20 md:px-5 md:pt-24"
      style={{ background: BONE, color: INK }}
    >
      <h1 className="sr-only">Work</h1>
      <WorkGrid items={getWorkIndex()} />
    </main>
  );
}
