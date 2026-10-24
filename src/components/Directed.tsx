import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { colophonNotes, type Colophon } from "@/data/colophons";
import type { Block, Gap, Hero, Layout } from "@/data/layouts";
import { RATIO_VALUE } from "@/data/ratio";
import type { Film, MediaRef, Project } from "@/data/types";
import { dialStyle, typeDial } from "@/data/typography";
import { FitText } from "./FitText";
import { InlineVideo } from "./InlineVideo";

// A project page set from its layout (data/layouts.ts): one of four
// openings, then the hand-written sequence of blocks. Every picture is
// looked up in the project's own data by its path, so the caption, shape
// and poster are the project's own and a layout cannot introduce a frame
// the project does not have.

const COLUMN = "mx-auto w-[min(92vw,80rem)]";

const GAP: Record<Gap, string> = {
  none: "mt-3 md:mt-4",
  md: "mt-16 md:mt-24",
  lg: "mt-28 md:mt-40",
};

function lookup(project: Project, src: string): MediaRef | undefined {
  if (project.coverImage.src === src) return project.coverImage;
  return project.gallery.find((m) => m.src === src);
}

/** One picture or film. `fill` fills its parent (which sets the size);
 * otherwise it takes its own shape, or the `ratio` it is given. */
function Shot({
  m,
  sizes,
  ratio,
  pos,
  fill,
  eager,
  className = "",
}: {
  m: MediaRef;
  sizes: string;
  ratio?: number;
  pos?: string;
  fill?: boolean;
  eager?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${fill ? "absolute inset-0" : "relative"} overflow-hidden bg-ink-soft ${className}`}
      style={fill ? undefined : { aspectRatio: ratio ?? RATIO_VALUE[m.ratio] }}
    >
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
          style={pos ? { objectPosition: pos } : undefined}
        />
      )}
    </div>
  );
}

function Caption({ children, n }: { children?: ReactNode; n?: number }) {
  if (!children) return null;
  return (
    <p className="mono mt-3 text-paper-dim">
      {n !== undefined ? <span className="mr-3 opacity-60">{String(n).padStart(2, "0")}</span> : null}
      {children}
    </p>
  );
}

/** The facts line: year and disciplines, the agency, the place, the film. */
function Facts({ project, colophon, film }: { project: Project; colophon?: Colophon; film?: Film }) {
  const meta = [project.year, project.disciplines.join(" / ")].filter(Boolean).join(" — ");
  return (
    <p className="mono leading-relaxed">
      {project.subtitle ? (
        <>
          {project.subtitle}
          <br />
        </>
      ) : null}
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
      {film ? (
        <>
          <br />
          <Link href={`/films/${film.slug}`} className="mt-2 inline-block border-b border-accent pb-0.5">
            Watch the film &rarr;
          </Link>
        </>
      ) : null}
    </p>
  );
}

/** What was asked, what was done, what came of it — numbered, the numbers
 * hollow, as in the reference's list. */
function Notes({ colophon }: { colophon: Colophon }) {
  const items = colophonNotes(colophon);
  if (!items.length) return null;
  // A lone "1." reads as a list cut short: one part is set as a statement.
  if (items.length === 1) {
    const [[term, text]] = items;
    return (
      <div>
        <p className="mono mb-3 opacity-60">{term}</p>
        <p className="max-w-[30ch] text-xl font-light leading-snug md:text-2xl">{text}</p>
      </div>
    );
  }
  return (
    <ol className="flex flex-col gap-8 md:gap-10">
      {items.map(([term, text], i) => (
        <li key={term} className="grid grid-cols-[3.5rem_1fr] gap-4 md:grid-cols-[5rem_1fr] md:gap-6">
          <span
            className="display display-outline text-[3.25rem] leading-[0.8] md:text-[4.5rem]"
            style={{ ["--stroke" as string]: "1px" }}
          >
            {i + 1}.
          </span>
          <div>
            <p className="mono mb-2 opacity-60">{term}</p>
            <p className="max-w-[34rem] text-[0.95rem] leading-relaxed md:text-base">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function HeroView({
  hero,
  project,
  colophon,
  film,
}: {
  hero: Hero;
  project: Project;
  colophon?: Colophon;
  film?: Film;
}) {
  const dial = dialStyle(typeDial(project.slug));

  if (hero.kind === "cross") {
    const m = lookup(project, hero.src);
    if (!m) return null;
    const r = RATIO_VALUE[m.ratio];
    return (
      <section className="relative isolate h-svh min-h-[36rem] overflow-hidden bg-ink">
        {/* On a phone the picture is held in the middle of the screen, so
            a landscape (short on a narrow screen) still has the name
            through it; from tablet up it hangs from under the corners. */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:top-[5.5rem] md:translate-y-0"
          style={{ width: `min(100vw - 2.5rem, (100svh - 10rem) * ${r.toFixed(4)})` }}
        >
          <Shot m={m} sizes="(max-width: 768px) 92vw, 50vw" eager />
        </div>
        {/* The name, straight across the picture, negative where it
            crosses it. */}
        <FitText
          as="h1"
          text={project.title}
          fill={0.94}
          maxVh={50}
          boxClassName="pointer-events-none absolute inset-x-0 top-1/2 flex justify-center text-paper mix-blend-difference md:top-[var(--ty)]"
          boxStyle={{ ["--ty" as string]: `${hero.titleY ?? 55}%`, transform: "translateY(-50%)" }}
          className="display leading-[0.78]"
          style={dial}
        />
        <div className="absolute bottom-16 left-5 max-w-[17rem] text-paper mix-blend-difference md:bottom-20 md:left-10">
          {colophon?.short ? <p className="mb-4 text-[0.95rem] leading-snug">{colophon.short}</p> : null}
          <Facts project={project} colophon={colophon} film={film} />
        </div>
      </section>
    );
  }

  if (hero.kind === "split") {
    const m = lookup(project, hero.src);
    if (!m) return null;
    const paper = hero.tone === "paper";
    return (
      <section className="grid grid-cols-1 bg-ink text-paper md:min-h-svh md:grid-cols-2">
        {/* Its own shape on a phone; on a wide screen it fills its half,
            cropped, and never pushes the half beside it (a square at full
            height is wider than half the screen). */}
        <div
          className={`relative aspect-[var(--r)] min-w-0 md:aspect-auto md:h-svh ${hero.side === "right" ? "md:order-2" : ""}`}
          style={{ ["--r" as string]: String(RATIO_VALUE[m.ratio]) }}
        >
          <Shot m={m} sizes="(max-width: 768px) 100vw, 50vw" pos={hero.pos} fill eager />
        </div>
        {/* On paper the half is a sheet laid beside the photograph, held
            clear of the bands the corner words sit on, top and bottom. */}
        <div
          className={`flex min-w-0 flex-col overflow-hidden px-5 pb-16 pt-10 md:px-10 md:pb-20 ${
            paper ? "bg-paper text-ink md:mb-16 md:mt-20 md:pt-10" : "md:pt-28"
          } ${paper ? (hero.side === "right" ? "md:ml-10" : "md:mr-10") : ""}`}
          style={paper ? { ["--stroke-color" as string]: "var(--color-ink)" } : undefined}
        >
          <FitText
            as="h1"
            text={project.title}
            fill={1}
            maxVh={26}
            className="display display-outline leading-[0.8]"
            style={{ ...dial, ["--stroke" as string]: "1.5px" }}
          />
          <div className="mt-8">
            <Facts project={project} colophon={colophon} film={film} />
          </div>
          {colophon ? (
            <div className="mt-auto pt-14">
              <Notes colophon={colophon} />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (hero.kind === "bleed") {
    const m = lookup(project, hero.src);
    if (!m) return null;
    const bottom = hero.titleAt === "bottom";
    return (
      <section className="relative h-svh min-h-[34rem] overflow-hidden bg-ink">
        <Shot m={m} sizes="100vw" pos={hero.pos} fill eager />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: bottom
              ? "linear-gradient(0deg, rgba(12,12,11,0.88) 0%, rgba(12,12,11,0.35) 38%, rgba(12,12,11,0) 60%)"
              : "linear-gradient(180deg, rgba(12,12,11,0.85) 0%, rgba(12,12,11,0.3) 38%, rgba(12,12,11,0) 58%)",
          }}
        />
        <div className={`absolute inset-x-0 px-5 md:px-10 ${bottom ? "bottom-16 md:bottom-20" : "top-20 md:top-24"}`}>
          <FitText as="h1" text={project.title} fill={1} maxVh={30} className="display leading-[0.8]" style={dial} />
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-4">
              <Facts project={project} colophon={colophon} film={film} />
            </div>
            {colophon?.short ? (
              <p className="text-[1.05rem] leading-snug md:col-span-4 md:col-start-9 md:text-right">{colophon.short}</p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  // type
  return (
    <section className="px-5 pt-24 md:px-10 md:pt-28">
      <FitText as="h1" text={project.title} fill={1} maxVh={42} className="display leading-[0.8]" style={dial} />
      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-line pt-5 md:grid-cols-12">
        <div className="md:col-span-4">
          <Facts project={project} colophon={colophon} film={film} />
        </div>
        {colophon?.short ? (
          <p className="text-xl font-light leading-snug md:col-span-5 md:col-start-8 md:text-2xl">{colophon.short}</p>
        ) : null}
      </div>
    </section>
  );
}

function BlockView({
  b,
  project,
  colophon,
  n,
}: {
  b: Block;
  project: Project;
  colophon?: Colophon;
  /** Running count of captioned frames, for the small numbers. */
  n: number;
}) {
  const gap = GAP[b.gap ?? "md"];
  const get = (s: string) => lookup(project, s);

  switch (b.t) {
    case "bleed": {
      const m = get(b.src);
      if (!m) return null;
      return (
        <div className={`${gap} relative h-[70svh] w-full md:h-svh`}>
          <Shot m={m} sizes="100vw" pos={b.pos} fill />
        </div>
      );
    }
    case "full": {
      const m = get(b.src);
      if (!m) return null;
      return (
        <div className={`${gap} ${COLUMN}`}>
          <Shot m={m} sizes="(max-width: 768px) 92vw, 80rem" />
        </div>
      );
    }
    case "pair": {
      const a = get(b.a);
      const c = get(b.b);
      if (!a || !c) return null;
      const r = Math.min(RATIO_VALUE[a.ratio], RATIO_VALUE[c.ratio]);
      return (
        <div className={`${gap} ${COLUMN} grid grid-cols-2 gap-3 md:gap-4`}>
          <Shot m={a} ratio={r} sizes="(max-width: 768px) 46vw, 40rem" />
          <Shot m={c} ratio={r} sizes="(max-width: 768px) 46vw, 40rem" />
        </div>
      );
    }
    case "trio": {
      const ms = b.srcs.map(get).filter((m): m is MediaRef => Boolean(m));
      if (ms.length !== 3) return null;
      const r = Math.min(...ms.map((m) => RATIO_VALUE[m.ratio]));
      return (
        <div className={`${gap} ${COLUMN} grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4`}>
          {ms.map((m, i) => (
            <div key={m.src} className={i === 0 ? "col-span-2 md:col-span-1" : ""}>
              <Shot m={m} ratio={r} sizes="(max-width: 768px) 92vw, 27rem" />
            </div>
          ))}
        </div>
      );
    }
    case "offset": {
      const big = get(b.big);
      const small = get(b.small);
      if (!big || !small) return null;
      return (
        <div className={`${gap} ${COLUMN} grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end md:gap-4`}>
          <div className={b.flip ? "md:col-span-7 md:col-start-6 md:row-start-1" : "md:col-span-7"}>
            <Shot m={big} sizes="(max-width: 768px) 92vw, 46rem" />
          </div>
          <figure
            className={
              b.flip
                ? "mt-6 w-2/3 md:col-span-4 md:col-start-1 md:row-start-1 md:mb-[14%] md:mt-0 md:w-auto"
                : "ml-auto mt-6 w-2/3 md:col-span-4 md:col-start-9 md:mb-[14%] md:ml-0 md:mt-0 md:w-auto"
            }
          >
            <Shot m={small} sizes="(max-width: 768px) 60vw, 26rem" />
            <Caption n={n}>{small.caption}</Caption>
          </figure>
        </div>
      );
    }
    case "solo": {
      const m = get(b.src);
      if (!m) return null;
      const span = { sm: 4, md: 6, lg: 8 }[b.width];
      const start = b.align === "left" ? 1 : b.align === "right" ? 13 - span : (12 - span) / 2 + 1;
      const phone = { sm: "w-2/3", md: "w-5/6", lg: "w-full" }[b.width];
      const phoneAlign = b.align === "right" ? "ml-auto" : b.align === "center" ? "mx-auto" : "";
      return (
        <div className={`${gap} ${COLUMN} grid grid-cols-1 md:grid-cols-12 md:gap-4`}>
          <figure
            className={`${phone} ${phoneAlign} gc-md md:mx-0 md:w-auto`}
            style={{ ["--gc" as string]: `${start} / span ${span}` }}
          >
            <Shot m={m} sizes="(max-width: 768px) 80vw, 52rem" />
            <Caption n={n}>{m.caption}</Caption>
          </figure>
        </div>
      );
    }
    case "reels": {
      const ms = b.srcs.map(get).filter((m): m is MediaRef => Boolean(m));
      if (!ms.length) return null;
      const k = ms.length;
      return (
        <div
          className={`${gap} ${COLUMN} grid grid-cols-2 gap-3 md:gap-4 md:[grid-template-columns:repeat(var(--k),minmax(0,1fr))]`}
          // No film taller than most of the screen: the strip narrows instead.
          style={{
            ["--k" as string]: String(k),
            maxWidth: `calc(${k} * 82svh * 9 / 16 + ${k - 1}rem)`,
          }}
        >
          {ms.map((m) => (
            <figure key={m.src}>
              <Shot m={m} sizes="(max-width: 768px) 46vw, 24rem" />
              <Caption>{m.caption}</Caption>
            </figure>
          ))}
        </div>
      );
    }
    case "notes": {
      if (!colophon) return null;
      if (!b.src) {
        // Words alone: set from the column's middle, as wide as a reading
        // line.
        return (
          <div className={`${gap} ${COLUMN} grid grid-cols-1 md:grid-cols-12 md:gap-4`}>
            <div className="md:col-span-6 md:col-start-7">
              <Notes colophon={colophon} />
            </div>
          </div>
        );
      }
      const m = get(b.src);
      if (!m) return null;
      const right = b.side === "right";
      return (
        <div className={`${gap} ${COLUMN} grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center md:gap-4`}>
          <div className={right ? "md:col-span-5 md:col-start-8 md:row-start-1" : "md:col-span-5"}>
            <Shot m={m} sizes="(max-width: 768px) 92vw, 33rem" />
          </div>
          <div className={right ? "md:col-span-6 md:col-start-1 md:row-start-1" : "md:col-span-6 md:col-start-7"}>
            {colophon.short ? (
              <p className="mb-10 max-w-[24ch] text-2xl font-light leading-snug md:text-3xl">{colophon.short}</p>
            ) : null}
            <Notes colophon={colophon} />
          </div>
        </div>
      );
    }
    case "word":
      return (
        <div className={`${gap} overflow-hidden`} aria-hidden>
          <FitText
            text={project.title}
            fill={1.18}
            className="display display-outline leading-[0.8]"
            style={{ ...dialStyle(typeDial(project.slug)), ["--stroke" as string]: "1.5px", marginLeft: "-6vw" }}
          />
        </div>
      );
  }
}

export function Directed({
  layout,
  project,
  colophon,
  film,
}: {
  layout: Layout;
  project: Project;
  colophon?: Colophon;
  film?: Film;
}) {
  // Small numbers on the captioned frames, counted down the page.
  const captioned = (b: Block) => b.t === "offset" || b.t === "solo";
  const counted = layout.blocks.map((_, i) => layout.blocks.slice(0, i + 1).filter(captioned).length);
  return (
    <div>
      <HeroView hero={layout.hero} project={project} colophon={colophon} film={film} />
      {layout.blocks.map((b, i) => (
        <BlockView key={i} b={b} project={project} colophon={colophon} n={counted[i]} />
      ))}
    </div>
  );
}
