import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { MaskReveal } from "@/components/MaskReveal";
import { Reveal } from "@/components/Reveal";
import { HOUSE_TYPE, dialStyle } from "@/data/typography";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "Contact — Dilan&Batuhan",
};

// The page was a centred lockup over a warm halo — the studio's email set
// large in the middle of the screen with a true ellipse around its
// availability. It was the best thing on the site at the time and it is
// the wrong thing now: the homepage ends flush left on a hard rule, and
// arriving here from it used to feel like walking into a different
// building. (The availability line itself is gone too, at the studio's
// request.) Same rule as everywhere else now — structure brutal, light
// cinematic. The halo stays, because these two pages carry no photography
// at all and the warmth has to come from somewhere, but it sits behind a
// hard two-column grid instead of holding a centred composition together.
//
// Left is who you are writing to. Right is the writing.
export default function ContactPage() {
  return (
    <main className="relative min-h-svh overflow-hidden pb-[max(9rem,22vh)] pt-28 md:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10vw] top-[12vh] h-[60vh] w-[60vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 14%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative px-5 md:px-10">
        <MaskReveal>
          <h1
            className="display max-w-[16ch] text-[12vw] uppercase leading-[0.86] md:text-[5.6vw]"
            style={dialStyle(HOUSE_TYPE)}
          >
            Let&rsquo;s make your project special
          </h1>
        </MaskReveal>

        <div className="mt-16 grid grid-cols-1 gap-14 border-t border-line-strong pt-12 md:mt-24 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-5">
            <dl
              className="flex flex-col gap-8 text-[0.625rem] uppercase tracking-[0.26em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <div>
                <dt className="text-paper-dim">Studio</dt>
                <dd className="mt-3 text-paper">{profile.studioName}</dd>
              </div>
              <div>
                <dt className="text-paper-dim">Mail</dt>
                <dd className="mt-3">
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-paper transition-colors hover:text-[color:var(--color-accent)]"
                  >
                    {profile.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-paper-dim">Studio base</dt>
                <dd className="mt-3 text-paper">{profile.location}</dd>
              </div>
              <div>
                <dt className="text-paper-dim">Elsewhere</dt>
                <dd className="mt-3">
                  <a
                    href={profile.instagram.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-paper transition-colors hover:text-[color:var(--color-accent)]"
                  >
                    {profile.instagram.handle}
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-6 md:col-start-7">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </main>
  );
}
