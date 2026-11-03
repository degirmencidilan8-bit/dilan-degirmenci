import { BrandTunnel } from "@/components/BrandTunnel";
import { Opener } from "@/components/Opener";
import { getField } from "@/data/field";
import { getReel } from "@/data/opener";
import { BONE, INK } from "@/data/palette";

/** How many brands the homepage walks through: the first of the Work
 * index's order, which is the studio's own ranking. */
const BRANDS = 10;

// The homepage: the opening reel — one large frame cutting through the
// strongest work, the studio's name across it — and under it the strongest
// brands one at a time, each arriving out of a tunnel with its name across
// it. See Opener and BrandTunnel.
//
// Before it, in turn: a tunnel of every project at once (WorkTunnel), a
// globe of them (WorkSphere), and the field of small pictures (Field). The
// field used to be the first screen on its own, the name over it (Field's
// `named`). The earlier opening before that (one framed reel, the name
// stacked over it — Pulse Films' structure) is kept in OpeningFrame and
// data/home.ts.
export default function Home() {
  const chapters = getField()
    .filter((s) => s.href && s.frames.length > 0)
    .slice(0, BRANDS)
    .map((s) => ({
      title: s.title ?? "",
      sub: s.sub ?? "",
      href: s.href!,
      hero: s.frames[0].src,
      sats: s.frames.slice(1, 4).map((f) => f.src),
    }));

  return (
    <main className="min-h-svh" style={{ background: INK, color: BONE }}>
      <Opener reel={getReel()} />
      <BrandTunnel chapters={chapters} />
    </main>
  );
}
