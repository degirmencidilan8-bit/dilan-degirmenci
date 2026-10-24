import type { Metadata } from "next";
import { DuoFigure } from "@/components/DuoFigure";
import { LEDGER } from "@/data/ledger";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "About — Dilan&Batuhan",
};

// About, in the site's new language.
//
// Pulse Films' About is a single screen: one paragraph in the technical
// face on the left, a moving image on the right, a signature. Nothing else
// is needed to say who a studio is, and this follows it. The studio's own
// three sentences on the left, set in capitals in the mono face; a picture
// on the right; the two names as the signature. Below the fold, for anyone
// who wants them, the facts as a plain two-column sheet.
//
// The picture is the two of them, the glowing cut-out the studio chose
// (2026-10-24), standing in the dark and turning in 3D with the pointer —
// see DuoFigure.

export default function AboutPage() {
  const facts: { term: string; items: string[] }[] = [
    { term: "Disciplines", items: profile.disciplines },
    { term: "Also", items: profile.services },
    { term: "Sectors", items: profile.sectors },
    { term: "Selected clients", items: profile.clients },
  ];

  return (
    <main className="min-h-svh bg-ink text-paper">
      {/* First screen: the words, the picture, the signature. */}
      <section className="grid min-h-svh grid-cols-1 items-center gap-12 px-5 pb-24 pt-24 md:grid-cols-12 md:gap-10 md:px-10 md:pt-28">
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-2">
          <div className="mono flex max-w-[36rem] flex-col gap-6 text-[0.95rem] leading-[1.6] tracking-[0.04em] md:text-[1.0625rem]">
            <p>{profile.who}</p>
            <p>{profile.statement}</p>
            <p className="text-paper/70">{profile.how}</p>
          </div>
          <p className="mono mt-10 text-paper-dim">
            {profile.names.join(" & ")}
          </p>
        </div>

        <div className="md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-7">
          <DuoFigure />
        </div>
      </section>

      {/* The record, as four numbers counted from the data (see
          data/ledger.ts) — not typed in, so they cannot drift from the
          work they count. */}
      <section className="border-t border-line px-5 py-16 md:px-10 md:py-20">
        <dl className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {LEDGER.map((e) => (
            // Term first in the markup, as a definition list requires;
            // the number is shown above it.
            <div key={e.code} className="flex flex-col-reverse">
              <dt className="mono mt-3 text-paper-dim">{e.label}</dt>
              <dd
                className="display text-[clamp(3rem,7vw,6rem)] leading-[0.85]"
                style={{ ["--dw" as string]: "62", ["--dg" as string]: "900" }}
              >
                {e.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The sheet: every fact once, in two columns of the mono face. */}
      <section className="border-t border-line px-5 pb-32 pt-16 md:px-10 md:pt-20">
        <dl className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          {facts.map((f) => (
            <div key={f.term}>
              <dt className="mono mb-5 text-paper-dim">{f.term}</dt>
              <dd>
                <ul className="mono flex flex-col gap-2">
                  {f.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>

        <dl className="mono mt-16 grid grid-cols-1 gap-8 border-t border-line pt-8 md:grid-cols-3">
          <div>
            <dt className="mb-3 text-paper-dim">Base</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt className="mb-3 text-paper-dim">Mail</dt>
            <dd>
              <a href={`mailto:${profile.email}`} className="border-b border-transparent hover:border-accent">
                {profile.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="mb-3 text-paper-dim">Elsewhere</dt>
            <dd>
              <a
                href={profile.instagram.url}
                target="_blank"
                rel="noreferrer"
                className="border-b border-transparent hover:border-accent"
              >
                {profile.instagram.handle}
              </a>
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
