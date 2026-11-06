"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { BONE } from "@/data/palette";
import type { FlowFilm, FlowImage } from "@/data/home-flow";

// The homepage after the opening (see data/home-flow): a few projects, each
// laid out its own way, the way a magazine sets a feature — a picture
// across the whole screen, a photograph beside its film, two portraits, a
// short film. What carries it is the choice of pictures, their scale and
// the dark between them; the only movement is each one settling into its
// place as it comes up, once, and the films playing, silent, while they
// are on screen. At the end, the way on to all the work.

export type FlowPicture = FlowImage & { alt: string };
export type FlowEntry = {
  kind: "lead" | "duo" | "pair" | "film";
  title: string;
  line: string;
  href: string;
  images: FlowPicture[];
  film?: FlowFilm & { alt: string };
  flip?: boolean;
};

const aspect = (r: string) => r.replace(":", " / ");

function Picture({ p, sizes, className = "" }: { p: FlowPicture; sizes: string; className?: string }) {
  return (
    <div className={`relative w-full overflow-hidden bg-[#141413] ${className}`} style={{ aspectRatio: aspect(p.ratio) }}>
      <Image src={p.src} alt={p.alt} fill sizes={sizes} className="object-cover" style={{ objectPosition: p.pos ?? "50% 50%" }} />
    </div>
  );
}

function Film({ f, className = "" }: { f: FlowFilm & { alt: string }; className?: string }) {
  return (
    <div className={`relative w-full overflow-hidden bg-[#141413] ${className}`} style={{ aspectRatio: aspect(f.ratio) }}>
      <video
        data-flow-film
        src={f.src}
        poster={f.poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={f.alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

/** The project's number, name and what was done, small, in the technical
 * face; the name is the way into the project. */
function Label({ n, e, className = "" }: { n: number; e: FlowEntry; className?: string }) {
  return (
    <p className={`mono leading-relaxed ${className}`} style={{ color: BONE }}>
      <span className="opacity-55">{String(n).padStart(2, "0")} — </span>
      <Link href={e.href} className="border-b border-transparent hover:border-current">
        {e.title}
      </Link>
      <br />
      <span className="opacity-55">{e.line}</span>
    </p>
  );
}

export function EditorialFlow({ entries }: { entries: FlowEntry[] }) {
  const root = useRef<HTMLElement>(null);

  // Each block settles into place as it comes up (once), and the films
  // play only while they are on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!still) el.dataset.armed = "";
    const blocks = Array.from(el.querySelectorAll<HTMLElement>(".flow-reveal"));
    const reveal = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          reveal.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    blocks.forEach((b) => reveal.observe(b));
    const films = Array.from(el.querySelectorAll<HTMLVideoElement>("video[data-flow-film]"));
    const play = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && !still) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.25 },
    );
    films.forEach((f) => play.observe(f));
    // Past the opening, the corner words come forward and breathe, as they
    // did in the tunnel (html.in-tunnel, see globals.css).
    const html = document.documentElement;
    const onScroll = () => html.classList.toggle("in-tunnel", el.getBoundingClientRect().top <= 1);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      reveal.disconnect();
      play.disconnect();
      window.removeEventListener("scroll", onScroll);
      html.classList.remove("in-tunnel");
    };
  }, []);

  return (
    <section ref={root} aria-label="Selected work" data-explore-target className="flow relative pb-40" style={{ color: BONE }}>
      {entries.map((e, i) => {
        const n = i + 1;
        if (e.kind === "lead") {
          return (
            <figure key={e.href} className="flow-reveal relative">
              <div className="relative h-svh min-h-[30rem] w-full overflow-hidden">
                <Image
                  src={e.images[0].src}
                  alt={e.images[0].alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: e.images[0].pos ?? "50% 50%" }}
                />
              </div>
              <figcaption className="px-5 pt-5 md:px-10">
                <Label n={n} e={e} />
              </figcaption>
            </figure>
          );
        }
        if (e.kind === "duo") {
          const film = e.film ? (
            <div className={`md:col-span-4 ${e.flip ? "" : "md:mt-[22vh]"}`}>
              <Film f={e.film} />
            </div>
          ) : null;
          return (
            <div key={e.href} className="flow-reveal mt-[22vh] grid grid-cols-1 gap-6 px-5 md:grid-cols-12 md:gap-8 md:px-10">
              {e.flip ? (
                <>
                  <div className="md:col-span-1" />
                  {film}
                  <div className="md:col-span-1" />
                  <div className="md:col-span-6 md:mt-[16vh]">
                    <Picture p={e.images[0]} sizes="(max-width: 768px) 90vw, 50vw" />
                    <Label n={n} e={e} className="mt-5" />
                  </div>
                </>
              ) : (
                <>
                  <div className="md:col-span-1" />
                  <div className="md:col-span-6">
                    <Picture p={e.images[0]} sizes="(max-width: 768px) 90vw, 50vw" />
                    <Label n={n} e={e} className="mt-5" />
                  </div>
                  <div className="md:col-span-1" />
                  {film}
                </>
              )}
            </div>
          );
        }
        if (e.kind === "pair") {
          return (
            <div key={e.href} className="flow-reveal mt-[22vh] grid grid-cols-1 gap-6 px-5 md:grid-cols-12 md:gap-8 md:px-10">
              <div className="md:col-span-3 md:self-end">
                <Label n={n} e={e} />
              </div>
              <div className="md:col-span-4 md:col-start-5">
                <Picture p={e.images[0]} sizes="(max-width: 768px) 90vw, 34vw" />
              </div>
              <div className="md:col-span-4 md:mt-[12vh]">
                <Picture p={e.images[1]} sizes="(max-width: 768px) 90vw, 34vw" />
              </div>
            </div>
          );
        }
        return (
          <div key={e.href} className="flow-reveal mt-[22vh] px-5 md:px-10">
            <div className="md:mx-auto md:w-[78%]">
              {e.film ? <Film f={e.film} /> : null}
              <Label n={n} e={e} className="mt-5 md:text-right" />
            </div>
          </div>
        );
      })}

      <div className="flow-reveal mt-[26vh] flex justify-center">
        <Link href="/work" className="mono border-b pb-1" style={{ borderColor: BONE, fontSize: "0.875rem" }}>
          Explore Work ↗
        </Link>
      </div>
    </section>
  );
}
