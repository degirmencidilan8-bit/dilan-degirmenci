import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Directed } from "@/components/Directed";
import { Feature } from "@/components/Feature";
import { InlineVideo } from "@/components/InlineVideo";
import { accentFor } from "@/data/accents";
import { colophonNotes, getColophon } from "@/data/colophons";
import { getFeature } from "@/data/features";
import { getFilmBySlug } from "@/data/films";
import { getLayout } from "@/data/layouts";
import { NO_PHOTOS_YET, getProjectBySlug, projects } from "@/data/projects";
import type { MediaRef } from "@/data/types";
import { RATIO_VALUE } from "@/data/ratio";
import { frameFor, projectsInOrder } from "@/data/work-index";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Dilan&Batuhan`,
    description: getColophon(slug)?.short || project.description || undefined,
  };
}

// A project's own page, on the dark ground.
//
// The lead frame first, as large as the screen allows at its own shape;
// under it the name and a line of facts; then what the studio was asked,
// what it did and what came of it, in the studio's own words; then the
// rest of the set as one tight sequence. Portraits travel in pairs so a
// set of tall frames is not a scroll of one picture per screen; landscapes
// take the full width. Then the next projects and the way back.
//
// Every photograph here is in its own colour. The Work index is the
// contact sheet; this is the print.

type Block = { kind: "single"; item: MediaRef } | { kind: "pair"; a: MediaRef; b: MediaRef };

function sequence(items: MediaRef[]): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    const b = items[i + 1];
    const tall = (m: MediaRef) => RATIO_VALUE[m.ratio] < 1;
    if (b && tall(a) && tall(b)) {
      out.push({ kind: "pair", a, b });
      i++;
    } else {
      out.push({ kind: "single", item: a });
    }
  }
  return out;
}

function Frame({
  m,
  sizes,
  eager,
  ratio,
}: {
  m: MediaRef;
  sizes: string;
  eager?: boolean;
  /** Override the frame's own shape — a pair shares one. */
  ratio?: number;
}) {
  return (
    <div className="relative overflow-hidden bg-ink-soft" style={{ aspectRatio: ratio ?? RATIO_VALUE[m.ratio] }}>
      {m.kind === "video" ? (
        <InlineVideo src={m.src} label={m.caption} poster={m.poster} />
      ) : (
        <Image
          src={m.src}
          alt={m.caption ?? ""}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          className="object-cover"
        />
      )}
    </div>
  );
}

const COLUMN = "mx-auto w-[min(92vw,72rem)]";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  // A project whose photographs have not been delivered has no page yet:
  // a page of broken frames is worse than no page.
  if (!project || NO_PHOTOS_YET.has(slug)) notFound();

  const colophon = getColophon(slug);
  const film = getFilmBySlug(slug);

  // The order of the index, for the issue number and what comes next.
  const order = projectsInOrder();
  const at = order.findIndex((p) => p.slug === slug);

  // A project written up as a feature is set on paper as one.
  const feature = getFeature(slug);
  if (feature) {
    const n = order[(Math.max(at, 0) + 1) % order.length];
    const frame = n && n.slug !== slug ? frameFor(n.slug) : undefined;
    return (
      <Feature
        project={project}
        colophon={colophon}
        feature={feature}
        accent={accentFor(slug) ?? "#d2001c"}
        issue={at + 1}
        next={
          n && frame ? { slug: n.slug, title: n.title, sub: n.disciplines.join(" / "), ...frame } : undefined
        }
      />
    );
  }

  const lead = project.coverImage;
  const leadRatio = RATIO_VALUE[lead.ratio];
  const rest = project.gallery.filter((m) => m.src !== lead.src);
  const meta = [project.year, project.disciplines.join(" / ")].filter(Boolean).join(" — ");

  // The next three projects in the index's order, wrapping round.
  const next = [1, 2, 3].map((k) => order[(Math.max(at, 0) + k) % order.length]).filter((p) => p.slug !== slug);

  const moreWork = (
    <div className={`${COLUMN} mt-28`}>
      <p className="mono mb-4 text-paper-dim">More work</p>
      <ul className="border-t border-line">
        {next.map((p) => (
          <li key={p.slug} className="border-b border-line">
            <Link href={`/work/${p.slug}`} className="group flex items-baseline justify-between gap-6 py-4">
              <span
                className="display text-[clamp(1.25rem,2vw,1.75rem)] transition-opacity duration-200 group-hover:opacity-60"
                style={{ ["--dw" as string]: "62", ["--dg" as string]: "900" }}
              >
                {p.title}
              </span>
              <span className="mono shrink-0 text-paper-dim">{p.disciplines.join(" / ")}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/work" className="mono mt-8 inline-block border-b border-accent pb-0.5">
        &larr; Back to work
      </Link>
    </div>
  );

  // A project with its own layout is set from it (see data/layouts.ts).
  const layout = getLayout(slug);
  if (layout) {
    return (
      <main className="min-h-svh bg-ink pb-28 text-paper">
        <Directed layout={layout} project={project} colophon={colophon} film={film} />
        {moreWork}
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-ink pb-28 pt-20 text-paper md:pt-24">
      {/* The lead frame, as large as the screen allows at its own shape,
          and its name and facts set underneath it on the picture's own left
          edge. They used to run across the full text column, which on a
          portrait lead started them well to the left of the photograph
          they belong to. */}
      <div
        className="mx-auto"
        style={{ width: `min(92vw, calc((100svh - 17rem) * ${leadRatio.toFixed(4)}))` }}
      >
        <Frame m={lead} sizes="92vw" eager />
        <h1
          className="display mt-5 text-[clamp(2rem,4vw,3.5rem)] leading-[0.9]"
          style={{ ["--dw" as string]: "62", ["--dg" as string]: "900" }}
        >
          {project.title}
        </h1>
        <p className="mono mt-3 text-paper-dim">
          {meta}
          {project.agency ? (
            <>
              <br />
              With {project.agency}
            </>
          ) : null}
          {colophon?.location ? (
            <>
              <br />
              {colophon.location}
            </>
          ) : null}
        </p>
        {/* A brand that was also filmed (ARKADAŞ BASIM) keeps the film on
            its own page; this is the way to it from the photographs. */}
        {film ? (
          <Link href={`/films/${film.slug}`} className="mono mt-4 inline-block border-b border-accent pb-0.5">
            Watch the film &rarr;
          </Link>
        ) : null}
      </div>

      <div className={`${COLUMN} mt-5`}>
        {colophon ? (
          <div className="mt-14 border-t border-line pt-6">
            {colophon.short ? (
              <p className="max-w-[30ch] text-2xl font-light leading-snug md:text-3xl">{colophon.short}</p>
            ) : null}
            <dl className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
              {colophonNotes(colophon).map(([term, text]) => (
                <div key={term}>
                  <dt className="mono mb-3 text-paper-dim">{term}</dt>
                  <dd className="text-[0.95rem] leading-relaxed text-paper/85">{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>

      {rest.length ? (
        <div className={`${COLUMN} mt-20 flex flex-col gap-3 md:gap-4`}>
          {sequence(rest).map((b, i) =>
            b.kind === "pair" ? (
              // A pair shares one shape — the taller of the two — so the
              // row ends on one line instead of one frame hanging below
              // the other.
              <div key={i} className="grid grid-cols-2 gap-3 md:gap-4">
                <Frame m={b.a} ratio={Math.min(RATIO_VALUE[b.a.ratio], RATIO_VALUE[b.b.ratio])} sizes="(max-width: 768px) 46vw, 36rem" />
                <Frame m={b.b} ratio={Math.min(RATIO_VALUE[b.a.ratio], RATIO_VALUE[b.b.ratio])} sizes="(max-width: 768px) 46vw, 36rem" />
              </div>
            ) : RATIO_VALUE[b.item.ratio] < 1 ? (
              // A portrait with no partner: centred at a readable height
              // rather than stretched across the full width.
              <div
                key={i}
                className="mx-auto"
                style={{ width: `min(92vw, calc((100svh - 6rem) * ${RATIO_VALUE[b.item.ratio].toFixed(4)}))` }}
              >
                <Frame m={b.item} sizes="(max-width: 768px) 92vw, 48rem" />
              </div>
            ) : (
              <Frame key={i} m={b.item} sizes="(max-width: 768px) 92vw, 72rem" />
            ),
          )}
        </div>
      ) : null}

      {moreWork}
    </main>
  );
}
