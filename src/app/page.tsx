import { BrandTunnel, type Chapter } from "@/components/BrandTunnel";
import { Opener } from "@/components/Opener";
import { getField } from "@/data/field";
import { getReel } from "@/data/opener";
import { BONE, INK } from "@/data/palette";

/** The brands the homepage walks through, in the studio's order (Batu,
 * 2026-11-03). `video` is the film the chapter plays in place of its
 * picture; a brand without one shows its picture. */
const TUNNEL: { slug: string; video?: string }[] = [
  { slug: "atiye-konser" },
  { slug: "naya", video: "/media/naya/NAYA_VIDEO.mp4" },
  { slug: "freya-gurme", video: "/media/freya/OMLET_VRS2.mp4" },
  { slug: "kham", video: "/media/kham/kham_video1.mp4" },
  { slug: "soulhaus", video: "/media/soulhaus/sh-cugi-3.mp4" },
  { slug: "holiday-inn-kavaklidere", video: "/media/holiday_inn/MIRENO_HOLIDAY_INN_REEL_6.mp4" },
  { slug: "turta-home-cafe", video: "/media/turta/turta-reel-2.mp4" },
  { slug: "koz", video: "/media/koz/KOZ_COMINGSOON_V1.mp4" },
  { slug: "happy-pilates", video: "/media/happypilates/hp-joseph-pilates.mp4" },
];

// The homepage: the opening reel — one large frame cutting through the
// strongest work, the studio's name across it — and under it the chosen
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
  const slots = getField();
  const chapters = TUNNEL.flatMap(({ slug, video }): Chapter[] => {
    const s = slots.find((x) => x.href === `/work/${slug}`);
    if (!s || !s.frames.length) return [];
    return [
      {
        title: s.title ?? "",
        sub: s.sub ?? "",
        href: s.href!,
        hero: s.frames[0].src,
        video,
        sats: s.frames.slice(1, 4).map((f) => f.src),
      },
    ];
  });

  return (
    <main className="min-h-svh" style={{ background: INK, color: BONE }}>
      {/* Above the tunnel, which starts under its last stretch: the
          tunnel's light shows through the dark around the frame. */}
      <div className="relative z-10">
        <Opener reel={getReel()} />
      </div>
      <BrandTunnel chapters={chapters} />
    </main>
  );
}
