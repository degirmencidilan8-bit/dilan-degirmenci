import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { InlineVideo } from "@/components/InlineVideo";
import { Unveil } from "@/components/Unveil";
import type { Colophon } from "@/data/colophons";
import type { Feature as FeatureData, FeatureBlock } from "@/data/features";
import { BONE, INK } from "@/data/palette";
import { profile } from "@/data/profile";
import { RATIO_VALUE } from "@/data/ratio";
import { dialStyle, typeDial } from "@/data/typography";
import type { MediaRef, Project } from "@/data/types";

// A photographed project set as a magazine feature, on paper.
//
// The page is a twelve-column sheet with an eight-pixel-wide gutter of
// discipline: every picture, caption and line of text starts and ends on a
// column. What makes it read as edited rather than laid out is the change
// of scale from one block to the next — a full-bleed room, then a single
// frame held at half the width with its caption out in the margin, then a
// line of type the size of a picture — and the paper left empty around
// them.
//
// Pictures are numbered in the order they appear, as figures are in print,
// and the number is the one mark in the project's own colour.

type Span = [number, number];

const PAGE = "px-5 md:px-8";
const GRID = "grid grid-cols-12 gap-x-4 md:gap-x-6";
const ON_GRID = "col-span-full md:[grid-column:var(--c)]";
const GAP = "mt-28 md:mt-44";
const PAPER_SHADE = "#ddd7ca";

function col(s: Span): CSSProperties {
  return { ["--c" as string]: `${s[0]} / ${s[1] + 1}` };
}

function mediaCount(b: FeatureBlock): number {
  if (b.type === "bleed" || b.type === "image") return 1;
  if (b.type === "pair") return 2;
  if (b.type === "films") return b.srcs.length;
  return 0;
}

function nn(n: number) {
  return String(n).padStart(2, "0");
}

export interface NextUp {
  slug: string;
  title: string;
  sub: string;
  img: string;
  pos?: string;
}

export function Feature({
  project,
  colophon,
  feature,
  accent,
  issue,
  next,
}: {
  project: Project;
  colophon?: Colophon;
  feature: FeatureData;
  accent: string;
  /** The project's place in the index, printed as the issue number. */
  issue: number;
  next?: NextUp;
}) {
  const dial = typeDial(project.slug);
  const media = new Map<string, MediaRef>([project.coverImage, ...project.gallery].map((m) => [m.src, m]));
  const lookup = (src: string): MediaRef => media.get(src) ?? { src, ratio: "4:5", kind: "image" };

  // Figure numbers, in reading order. The cover is the first.
  const counts = feature.blocks.map(mediaCount);
  const figs = counts.map((c, i) => {
    const start = 2 + counts.slice(0, i).reduce((s, x) => s + x, 0);
    return Array.from({ length: c }, (_, k) => start + k);
  });

  const titleWords = project.title.split(" ");
  const meta = [project.disciplines.join(" / "), project.year].filter(Boolean);

  return (
    <main data-tone="light" className="min-h-svh pb-28" style={{ background: BONE, color: INK }}>
      {/* The opening spread. The title on the left page, set in the
          project's own cut and bottom-aligned with the picture on the
          right page, which keeps a printed page's margins rather than
          bleeding — the corner words sit in those margins. */}
      <section className="grid grid-cols-1 md:min-h-svh md:grid-cols-[1fr_auto]">
        <div className="order-2 flex flex-col justify-between gap-16 px-5 pb-6 pt-10 md:order-1 md:px-8 md:pb-16 md:pt-24">
          <div className="mono flex items-baseline justify-between gap-6 border-t pt-3" style={{ borderColor: "rgba(12,12,11,0.2)" }}>
            <span className="whitespace-nowrap" style={{ color: accent }}>N° {nn(issue)}</span>
            <span className="text-right opacity-60">{meta.join(" — ")}</span>
          </div>

          <div>
            <h1
              className="display uppercase leading-[0.86] text-[clamp(2.6rem,6.2vw,6.75rem)]"
              style={dialStyle(dial)}
            >
              {titleWords.map((w) => (
                <span key={w} className="block">
                  {w}
                </span>
              ))}
            </h1>
            {colophon?.short ? (
              <p className="mt-8 max-w-[24ch] text-[clamp(1.25rem,1.9vw,1.75rem)] font-light leading-[1.25] tracking-[-0.01em] md:mt-10">
                {colophon.short}
              </p>
            ) : null}
            {project.coverImage.caption ? (
              <p className="mt-10 hidden max-w-[44ch] gap-3 text-[0.8125rem] leading-snug md:flex">
                <span className="mono shrink-0" style={{ color: accent }}>
                  {nn(1)} →
                </span>
                <span className="opacity-60">{project.coverImage.caption}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="order-1 px-5 pt-20 md:order-2 md:flex md:h-svh md:items-end md:pb-16 md:pl-0 md:pr-8 md:pt-24">
          <Unveil
            className="relative w-full overflow-hidden md:h-full md:w-auto"
            style={{ aspectRatio: RATIO_VALUE[project.coverImage.ratio], background: PAPER_SHADE }}
          >
            <Image
              src={project.coverImage.src}
              alt={project.coverImage.caption ?? project.title}
              fill
              sizes="(max-width: 768px) 92vw, 46vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
              style={{ objectPosition: feature.coverPos }}
            />
          </Unveil>
        </div>
      </section>

      {/* The brief, as the feature's opening paragraph. */}
      {colophon?.brief ? (
        <section className={`${PAGE} ${GRID} ${GAP}`}>
          <p className={`mono ${ON_GRID} mb-6 opacity-60 md:mb-0 md:pt-3`} style={col([1, 3])}>
            Brief
          </p>
          <p
            className={`${ON_GRID} text-[clamp(1.5rem,2.7vw,2.6rem)] font-light leading-[1.18] tracking-[-0.015em]`}
            style={col([4, 11])}
          >
            {colophon.brief}
          </p>
        </section>
      ) : null}

      {feature.blocks.map((b, i) => (
        <Block key={i} b={b} lookup={lookup} figs={figs[i]} accent={accent} colophon={colophon} quote={feature.quote} dial={dial} />
      ))}

      {/* Credits — only what is known. */}
      <section className={`${PAGE} ${GRID} ${GAP}`}>
        <div className={`${ON_GRID} border-t pt-3`} style={{ ...col([1, 12]), borderColor: "rgba(12,12,11,0.2)" }} />
        <p className={`mono ${ON_GRID} mt-4 opacity-60`} style={col([1, 3])}>
          Credits
        </p>
        <dl className={`${ON_GRID} mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2`} style={col([4, 11])}>
          {(
            [
              ["Client", project.title],
              ["Year", project.year],
              ["Disciplines", project.disciplines.join(", ")],
              ["Agency", project.agency],
              ["Location", colophon?.location],
              ["Studio", profile.names.join(" & ")],
            ] as const
          )
            .filter(([, v]) => Boolean(v))
            .map(([k, v]) => (
              <div key={k}>
                <dt className="mono opacity-50">{k}</dt>
                <dd className="mt-1 text-[1.0625rem]">{v}</dd>
              </div>
            ))}
        </dl>
      </section>

      {next ? <Next next={next} /> : null}

      <div className={`${PAGE} mt-14`}>
        <Link href="/work" className="mono inline-block border-b pb-0.5" style={{ borderColor: accent }}>
          &larr; All work
        </Link>
      </div>
    </main>
  );
}

function Caption({
  n,
  text,
  accent,
  className = "",
  style,
}: {
  n: number;
  text?: string;
  accent: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <figcaption className={`flex gap-3 text-[0.8125rem] leading-snug ${className}`} style={style}>
      <span className="mono shrink-0" style={{ color: accent }}>
        {nn(n)}
      </span>
      {text ? <span className="opacity-60">{text}</span> : null}
    </figcaption>
  );
}

function Picture({ m, sizes, eager, pos }: { m: MediaRef; sizes: string; eager?: boolean; pos?: string }) {
  return (
    <Unveil className="relative overflow-hidden" style={{ aspectRatio: RATIO_VALUE[m.ratio], background: PAPER_SHADE }}>
      {m.kind === "video" ? (
        <InlineVideo src={m.src} label={m.caption} />
      ) : (
        <Image
          src={m.src}
          alt={m.caption ?? ""}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          className="object-cover"
          style={pos ? { objectPosition: pos } : undefined}
        />
      )}
    </Unveil>
  );
}

function Block({
  b,
  lookup,
  figs,
  accent,
  colophon,
  quote,
  dial,
}: {
  b: FeatureBlock;
  lookup: (src: string) => MediaRef;
  figs: number[];
  accent: string;
  colophon?: Colophon;
  quote?: { text: string; by: string };
  dial: ReturnType<typeof typeDial>;
}) {
  switch (b.type) {
    case "bleed": {
      const m = lookup(b.src);
      const n = figs[0];
      return (
        <figure className={GAP}>
          <Unveil className="relative h-[70svh] w-full overflow-hidden md:h-svh" style={{ background: PAPER_SHADE }}>
            <Image src={m.src} alt={m.caption ?? ""} fill sizes="100vw" className="object-cover" style={{ objectPosition: b.pos }} />
          </Unveil>
          <div className={`${PAGE} ${GRID} mt-4`}>
            <Caption n={n} text={m.caption} accent={accent} className={ON_GRID} style={col([1, 6])} />
          </div>
        </figure>
      );
    }

    case "image": {
      const m = lookup(b.src);
      const n = figs[0];
      const side = b.caption === "left" || b.caption === "right";
      return (
        <figure className={`${PAGE} ${GRID} ${GAP} items-end`}>
          <div className={ON_GRID} style={{ ...col(b.span), gridRow: 1 }}>
            <Picture m={m} sizes="(max-width: 768px) 92vw, 50vw" />
            {side ? null : <Caption n={n} text={m.caption} accent={accent} className="mt-4" />}
          </div>
          {side ? (
            <div className={`${ON_GRID} mt-4 md:row-start-1 md:mt-0`} style={col(b.capSpan ?? b.span)}>
              <Caption n={n} text={m.caption} accent={accent} className={`max-w-[30ch] md:flex-col md:gap-2 md:text-[0.875rem] ${b.caption === "left" ? "md:ml-auto md:items-end md:text-right" : ""}`} />
            </div>
          ) : null}
        </figure>
      );
    }

    case "pair": {
      const a = lookup(b.a);
      const c = lookup(b.b);
      const [na, nb] = figs;
      const lifted = "md:mt-0";
      const lowered = "md:mt-40";
      return (
        <div className={`${PAGE} ${GRID} ${GAP} items-start gap-y-12`}>
          <figure className={`${ON_GRID} ${b.lift === "a" ? lifted : lowered}`} style={col(b.spanA)}>
            <Picture m={a} sizes="(max-width: 768px) 92vw, 42vw" />
            <Caption n={na} text={a.caption} accent={accent} className="mt-4" />
          </figure>
          <figure className={`${ON_GRID} ${b.lift === "b" ? lifted : lowered}`} style={col(b.spanB)}>
            <Picture m={c} sizes="(max-width: 768px) 92vw, 42vw" />
            <Caption n={nb} text={c.caption} accent={accent} className="mt-4" />
          </figure>
        </div>
      );
    }

    case "quote": {
      const text = quote?.text ?? colophon?.short;
      if (!text) return null;
      return (
        <blockquote lang="tr" className={`${PAGE} ${GRID} ${GAP}`}>
          <p
            className={`display ${ON_GRID} relative text-center uppercase leading-[0.95] text-[clamp(2.25rem,6.4vw,7rem)]`}
            style={{ ...dialStyle(dial), ...col([2, 11]) }}
          >
            {text}
          </p>
          {quote?.by ? (
            <footer className={`mono ${ON_GRID} mt-8 text-center`} style={{ ...col([2, 11]), color: accent }}>
              — {quote.by}
            </footer>
          ) : null}
        </blockquote>
      );
    }

    case "films": {
      const items = b.srcs.map(lookup);
      const nums = figs;
      return (
        <div className={`${PAGE} ${GRID} ${GAP}`}>
          <div
            className={`${ON_GRID} grid gap-4 md:gap-6`}
            style={{ ...col(b.span), gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
          >
            {items.map((m, k) => (
              <figure key={m.src}>
                <Picture m={m} sizes="(max-width: 768px) 46vw, 25vw" />
                <Caption n={nums[k]} text={m.caption} accent={accent} className="mt-4" />
              </figure>
            ))}
          </div>
        </div>
      );
    }

    case "notes": {
      if (!colophon) return null;
      return (
        <section className={`${PAGE} ${GRID} ${GAP} gap-y-10`}>
          {(
            [
              ["Contribution", colophon.contribution, [4, 7]],
              ["Output", colophon.output, [8, 11]],
            ] as const
          ).map(([k, v, s]) =>
            v ? (
              <div key={k} className={`${ON_GRID} border-t pt-3`} style={{ ...col(s as Span), borderColor: "rgba(12,12,11,0.2)" }}>
                <p className="mono opacity-60">{k}</p>
                <p className="mt-5 text-[1.125rem] leading-[1.5]">{v}</p>
              </div>
            ) : null,
          )}
        </section>
      );
    }
  }
}

function Next({ next }: { next: NextUp }) {
  return (
    <section className={`${PAGE} ${GAP}`}>
      <Link href={`/work/${next.slug}`} className="work-frame group block">
        <div className="mono flex items-baseline justify-between gap-6 border-t pt-3" style={{ borderColor: "rgba(12,12,11,0.2)" }}>
          <span>Next</span>
          <span className="text-right opacity-60">{next.sub}</span>
        </div>
        <p
          className="display mt-6 uppercase leading-[0.86] text-[clamp(3rem,10vw,10rem)] transition-opacity duration-300 group-hover:opacity-70"
          style={dialStyle(typeDial(next.slug))}
        >
          {next.title}
        </p>
        <div className="relative mt-8 aspect-[21/9] w-full overflow-hidden" style={{ background: PAPER_SHADE }}>
          <Image src={next.img} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: next.pos }} />
        </div>
      </Link>
    </section>
  );
}
