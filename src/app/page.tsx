import { BrandTunnel, type Chapter } from "@/components/BrandTunnel";
import { CardOpening } from "@/components/CardOpening";
import { EditorialFlow, type FlowEntry } from "@/components/EditorialFlow";
import { FolioFlow } from "@/components/FolioFlow";
import { Opener } from "@/components/Opener";
import { TwoLooks } from "@/components/TwoLooks";
import { getField } from "@/data/field";
import { HOME_FLOW, type FlowImage } from "@/data/home-flow";
import { getReel } from "@/data/opener";
import { BONE, INK } from "@/data/palette";
import { getProjectBySlug } from "@/data/projects";

/** The first screen. "cards": two cards turning over, the two of them
 * under a holographic foil, giving way to the names (CardOpening,
 * 2026-11-05). "two-looks": two frames meeting in one (TwoLooks, tried
 * the same day). "reel": the opening before both, one frame cutting
 * through the work with the name across it (Opener). To change, set this;
 * nothing else needs to. */
const OPENING = "cards" as "cards" | "two-looks" | "reel";

/** What follows the opening. "editorial": a few projects, each laid out its
 * own way, like a magazine feature (EditorialFlow, data/home-flow.ts;
 * 2026-11-06). "folio": the same brands as prints in shallow depth, the
 * one in front slipping away to the lower left as the next comes forward
 * (FolioFlow, 2026-11-06). "tunnel": the brands one at a time out of a 3D
 * tunnel (BrandTunnel). Both take the TUNNEL list below. To change, set
 * this. */
const AFTER = "folio" as "editorial" | "folio" | "tunnel";

/** The brands the tunnel walks through, in the studio's order (Batu,
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

/** The editorial flow, with each project's name, what was done and the
 * pictures' own captions taken from the project data. */
function editorial(): FlowEntry[] {
  return HOME_FLOW.flatMap((b): FlowEntry[] => {
    const p = getProjectBySlug(b.slug);
    if (!p) return [];
    const media = [p.coverImage, ...(p.gallery ?? [])];
    const alt = (src: string) => media.find((m) => m?.src === src)?.caption ?? p.title;
    const pic = (i: FlowImage) => ({ ...i, alt: alt(i.src) });
    const images = b.kind === "lead" || b.kind === "duo" ? [pic(b.image)] : b.kind === "pair" ? b.images.map(pic) : [];
    const film = b.kind === "duo" || b.kind === "film" ? { ...b.film, alt: alt(b.film.src) } : undefined;
    return [
      {
        kind: b.kind,
        title: p.title,
        line: p.disciplines.join(" / "),
        href: `/work/${p.slug}`,
        images,
        film,
        flip: b.kind === "duo" ? b.flip : undefined,
      },
    ];
  });
}

// The homepage: the opening, and under it the work — now a few projects
// laid out like a magazine feature (EditorialFlow); before that, the
// chosen brands one at a time out of a tunnel (BrandTunnel), and before
// that, in turn, a tunnel of every project at once (WorkTunnel), a globe of
// them (WorkSphere) and the field of small pictures (Field). The opening
// before the cards, one framed reel with the name across it, is Opener.
export default function Home() {
  const tunnel = AFTER === "tunnel";
  const chapters = tunnel || AFTER === "folio"
    ? TUNNEL.flatMap(({ slug, video }): Chapter[] => {
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
      })
    : [];

  return (
    <main className="min-h-svh" style={{ background: INK, color: BONE }}>
      {/* Above the tunnel, which starts under its last stretch: the
          tunnel's light shows through the dark around the frame. */}
      <div className="relative z-10">
        {/* With the tunnel, the first stop for the scroll on a touch
            screen: the opening, whole (its own stops follow). Not with the
            editorial flow, which scrolls freely. */}
        {tunnel ? <div aria-hidden className="tunnel-stop" style={{ top: 0 }} /> : null}
        {OPENING === "cards" ? (
          <CardOpening waitForTunnel={tunnel} />
        ) : OPENING === "two-looks" ? (
          <TwoLooks />
        ) : (
          <Opener reel={getReel()} />
        )}
      </div>
      {tunnel ? (
        <BrandTunnel chapters={chapters} />
      ) : AFTER === "folio" ? (
        <FolioFlow chapters={chapters} />
      ) : (
        <EditorialFlow entries={editorial()} />
      )}
    </main>
  );
}
