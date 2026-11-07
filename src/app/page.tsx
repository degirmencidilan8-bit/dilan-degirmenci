import { CardOpening } from "@/components/CardOpening";
import { FolioFlow, type Chapter } from "@/components/FolioFlow";
import { getField } from "@/data/field";
import { BONE, INK } from "@/data/palette";

/** The brands the folio walks through, in the studio's order (Batu,
 * 2026-11-03). `video` is the film the print plays in place of its
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

// The homepage: the opening (two cards turning over, then the names;
// CardOpening) and under it the folio, the brands as dark prints running
// by on their own down to Work (FolioFlow).
export default function Home() {
  const chapters = TUNNEL.flatMap(({ slug, video }): Chapter[] => {
    const s = getField().find((x) => x.href === `/work/${slug}`);
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
      <div className="relative z-10">
        <CardOpening />
      </div>
      <FolioFlow chapters={chapters} />
    </main>
  );
}
