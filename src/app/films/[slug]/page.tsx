import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmPlayer } from "@/components/FilmPlayer";
import { filmSub, films, getFilmBySlug } from "@/data/films";
import { RATIO_VALUE } from "@/data/ratio";

export function generateStaticParams() {
  return films.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const film = getFilmBySlug(slug);
  if (!film) return {};
  return { title: `${film.title} — Dilan&Batuhan` };
}

// A film's own page. Back to the dark for watching: the film centred and as
// large as the screen allows, everything about it underneath in two lines
// of the technical face, then the other films as a plain list and the way
// back. Nothing beside the picture competes with it.
export default async function FilmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const film = getFilmBySlug(slug);
  if (!film) notFound();
  const ratio = RATIO_VALUE[film.ratio];
  const more = films.filter((f) => f.slug !== film.slug);

  return (
    <main className="min-h-svh bg-ink pb-28 pt-20 text-paper md:pt-24">
      <FilmPlayer src={film.src} poster={film.poster} title={film.title} ratio={ratio} />

      {/* Name and type on the film's own left edge, at a size that holds
          its own beside a picture this large. */}
      <div
        className="mx-auto mt-5"
        style={{ width: `min(88vw, calc((100svh - 17rem) * ${ratio.toFixed(4)}))` }}
      >
        <h1
          className="display text-[clamp(2.25rem,4.5vw,4rem)] leading-[0.9]"
          style={{ ["--dw" as string]: "62", ["--dg" as string]: "900" }}
        >
          {film.title}
        </h1>
        <p className="mono mt-3 text-paper-dim">
          {[film.type, film.year].filter(Boolean).join(" — ")}
          {film.role ? (
            <>
              <br />
              Our part: {film.role.toLowerCase()}
            </>
          ) : null}
        </p>
      </div>

      <div className="mx-auto w-[min(88vw,64rem)]">
        <div className="mt-20">
          <p className="mono mb-4 text-paper-dim">More films</p>
          <ul className="border-t border-line">
            {more.map((f) => (
              <li key={f.slug} className="border-b border-line">
                <Link href={`/films/${f.slug}`} className="group flex items-baseline justify-between gap-6 py-4">
                  <span
                    className="display text-[clamp(1.25rem,2vw,1.75rem)] transition-opacity duration-200 group-hover:opacity-60"
                    style={{ ["--dw" as string]: "62", ["--dg" as string]: "900" }}
                  >
                    {f.title}
                  </span>
                  <span className="mono shrink-0 text-paper-dim">{filmSub(f)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/work?filter=films" className="mono mt-8 inline-block border-b border-accent pb-0.5">
            &larr; Back to work
          </Link>
        </div>
      </div>
    </main>
  );
}
