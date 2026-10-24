import { Field } from "@/components/Field";
import { Opener } from "@/components/Opener";
import { getField } from "@/data/field";
import { getReel } from "@/data/opener";
import { BONE, INK } from "@/data/palette";

// The homepage: the opening reel — one large frame cutting through the
// strongest work, the studio's name across it — and under it the field of
// work. See Opener and Field.
//
// The field used to be the first screen on its own, the name over it (kept
// in Field as `named`). The earlier opening before that (one framed reel,
// the name stacked over it — Pulse Films' structure) is kept in
// OpeningFrame and data/home.ts.
export default function Home() {
  return (
    <main className="min-h-svh" style={{ background: INK, color: BONE }}>
      <Opener reel={getReel()} />
      <Field slots={getField()} named={false} />
    </main>
  );
}
