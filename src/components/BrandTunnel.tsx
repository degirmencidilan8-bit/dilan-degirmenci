"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { LightCurtain } from "@/components/LightCurtain";
import { colourOf, createClothMaterial, ramp } from "@/components/ui/3d-gallery-photography";
import imageLoader from "@/lib/image-loader";
import { BONE, INK } from "@/data/palette";

// The work, one brand at a time. The page scrolls through a tunnel in
// chapters: each brand's strongest picture comes out of the dark, stops in
// the middle of the screen large and sharp with the brand's name across it,
// holds, and then flies past the viewer as the next brand arrives from the
// depth. Three more of the brand's own pictures drift around it at other
// depths — the tunnel's depth, but every picture in a chapter belongs to
// it. The light falling behind takes each brand's colour.
//
// It replaced a tunnel of every project at once (WorkTunnel), which was
// beautiful in motion and said nothing: thirty small pictures scattered,
// none held long enough to be seen, none tied to a name.
//
// A short list of the brands runs down the left edge as the chapter index,
// set on a turning drum: it rolls with the scroll, the current brand large
// and lit at the front, its neighbours tipping away above and below into
// the dark, so only a few are ever seen. Click one to travel there.
//
// A brand with a film plays it in place of its picture: the picture holds
// the place (and gives the light its colour) until the film can play, the
// film is only fetched as its chapter comes near, and it plays only while
// its chapter is on screen.

export interface Chapter {
  title: string;
  sub: string;
  href: string;
  hero: string;
  /** A film to play in place of the hero picture. */
  video?: string;
  sats: string[];
}

type Film = { el: HTMLVideoElement; tex: THREE.VideoTexture; ready: boolean; playing: boolean };

/** Where a chapter's picture rests: this far in front of the camera. */
const REST = 6;
/** How far back a chapter starts. */
const FAR = 42;
/** How far past its rest it travels on the way out — through the camera. */
const PASS = 6.5;
/** Field of view, degrees. */
const FOV = 55;
/** Satellites, as shares of the visible width and height at rest, and a
 * depth offset from the hero (negative: behind it). */
const SATS = [
  { x: -0.4, y: 0.3, dz: -4.5 },
  { x: 0.42, y: -0.28, dz: -2.5 },
  { x: -0.36, y: -0.34, dz: 2.2 },
];
/** Scroll per chapter, in screen heights. */
const PER_CHAPTER = 0.9;
/** The first chapter is already arriving as the section comes up. */
const LEAD = 0.6;
/** How far the tunnel starts under the opening above it, in screen
 * heights × 100. */
const OVERLAP = 22;
/** The drum: degrees between two brands, and its radius in px. */
const DRUM_STEP = 24;
const DRUM_R = 134;

/** Where a brand sits on the drum, d chapters from the front. */
function drum(d: number) {
  const th = Math.max(-90, Math.min(90, d * DRUM_STEP));
  const c = Math.cos((th * Math.PI) / 180);
  const y = DRUM_R * Math.sin((th * Math.PI) / 180);
  return {
    transform: `translateY(calc(-50% + ${y.toFixed(1)}px)) perspective(720px) rotateX(${(-th).toFixed(1)}deg) scale(${(0.8 + 0.45 * c ** 4).toFixed(3)})`,
    opacity: Math.abs(th) < 82 ? Math.max(0, c) ** 5 : 0,
    reachable: Math.abs(th) < 60,
  };
}

type Callbacks = {
  onChapter: (k: number) => void;
  onColours: (c: string[]) => void;
  onHover: (k: number | null) => void;
  onSelect: (k: number) => void;
};

// The hold: |t| under this much is the chapter at rest.
function settle(t: number) {
  const a = Math.max(0, Math.abs(t) - 0.14) / 0.86;
  return Math.sign(t) * a;
}

// In fast and slowing (squared) from the back; out at an even pace, so by
// the time the name has changed — halfway between two chapters — the old
// picture is already going and the new one is coming up.
function depthOf(g: number) {
  return g < 0 ? -REST - FAR * g * g : -REST + PASS * g;
}

function aspectOf(tex: THREE.Texture | undefined) {
  const img = tex?.image as { width?: number; height?: number } | undefined;
  return img?.width && img?.height ? img.width / img.height : 1.5;
}

function Scene({
  chapters,
  progress,
  callbacks,
}: {
  chapters: { hero: string; video?: string; sats: string[] }[];
  progress: RefObject<number>;
  callbacks: RefObject<Callbacks>;
}) {
  // Every picture in one flat list: chapter k's hero, then its satellites.
  const layout = useMemo(() => {
    const urls: string[] = [];
    const slots = chapters.map((c) => {
      const hero = urls.push(c.hero) - 1;
      const sats = c.sats.slice(0, SATS.length).map((s) => urls.push(s) - 1);
      return { hero, sats };
    });
    return { urls, slots };
  }, [chapters]);

  const textures = useTexture(layout.urls, (loaded) => {
    for (const t of [loaded].flat()) {
      t.colorSpace = THREE.SRGBColorSpace;
      // Frames are seen bent and at an angle; without this the GPU blurs
      // them there. three.js caps it at what the device supports.
      t.anisotropy = 8;
    }
  });
  const materials = useMemo(() => layout.urls.map(() => createClothMaterial()), [layout]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);
  useEffect(() => {
    materials.forEach((m, i) => {
      m.uniforms.map.value = textures[i];
    });
  }, [materials, textures]);

  useEffect(() => {
    callbacks.current?.onColours(layout.slots.map((s) => colourOf(textures[s.hero])));
  }, [layout, textures, callbacks]);

  // The films, one per chapter that has one; nothing is fetched yet.
  const films = useRef<(Film | null)[]>([]);
  useEffect(() => {
    const list = chapters.map((c): Film | null => {
      if (!c.video) return null;
      const el = document.createElement("video");
      el.muted = true;
      el.loop = true;
      el.playsInline = true;
      el.setAttribute("playsinline", "");
      el.preload = "auto";
      const tex = new THREE.VideoTexture(el);
      tex.colorSpace = THREE.SRGBColorSpace;
      const f: Film = { el, tex, ready: false, playing: false };
      el.addEventListener("loadeddata", () => {
        f.ready = true;
      });
      el.dataset.src = c.video;
      return f;
    });
    films.current = list;
    return () => {
      list.forEach((f) => {
        if (!f) return;
        f.el.pause();
        f.el.removeAttribute("src");
        f.el.load();
        f.tex.dispose();
      });
      films.current = [];
    };
  }, [chapters]);

  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const at = useRef(progress.current ?? 0);
  const chapter = useRef(-1);
  // The focus pull (in place of the flag wave the gallery has; a tilt
  // towards the pointer was tried too, 2026-11-04): the chapter under the
  // pointer, and how far each chapter is pulled into focus, 0..1.
  const aim = useRef(-1);
  const focus = useRef<number[]>([]);

  useFrame((state) => {
    const target = progress.current ?? 0;
    const prev = at.current;
    at.current += (target - at.current) * 0.075;
    const speed = (at.current - prev) * 60;
    const time = state.clock.getElapsedTime();

    const n = layout.slots.length;
    const k = Math.max(0, Math.min(n - 1, Math.round(at.current)));
    if (k !== chapter.current) {
      chapter.current = k;
      callbacks.current?.onChapter(k);
    }

    const viewH = 2 * REST * Math.tan(((FOV / 2) * Math.PI) / 180);
    const viewW = viewH * (state.size.width / state.size.height);

    layout.slots.forEach((slot, c) => {
      const t = at.current - c;
      const g = settle(t);
      const heroZ = depthOf(g);

      // The film: fetched as its chapter comes near, playing while it is on
      // screen, in place of the picture once it has a frame to show.
      const film = films.current[c];
      let ar = aspectOf(textures[slot.hero]);
      if (film) {
        if (Math.abs(t) < 2 && !film.el.src) {
          film.el.src = film.el.dataset.src ?? "";
          film.el.load();
        }
        const on = Math.abs(t) < 1.3;
        if (on && !film.playing) {
          film.playing = true;
          film.el.play().catch(() => {
            film.playing = false;
          });
        } else if (!on && film.playing) {
          film.playing = false;
          film.el.pause();
        }
        const map = materials[slot.hero].uniforms.map;
        if (film.ready && film.el.videoWidth) {
          map.value = film.tex;
          ar = film.el.videoWidth / film.el.videoHeight;
        } else {
          map.value = textures[slot.hero];
        }
      }
      // Looked at, and at rest: it comes forward a little and sharpens,
      // and what is around it falls back and dims.
      const want = aim.current === c && Math.abs(t) < 0.3 ? 1 : 0;
      const f = (focus.current[c] ?? 0) + (want - (focus.current[c] ?? 0)) * 0.07;
      focus.current[c] = f;
      const lift = f * f * (3 - 2 * f);

      // As large as the screen allows: most of its height, most of its width.
      const h = Math.min(0.64 * viewH, (0.82 * viewW) / ar) * (1 + 0.05 * lift);

      const place = (i: number, x: number, y: number, z: number, height: number, a: number, dof: number) => {
        const mesh = meshes.current[i];
        const m = materials[i];
        if (!mesh) return;
        const shown = Math.abs(t) < 1.3;
        mesh.visible = shown;
        if (!shown) return;
        mesh.position.set(x, y, z);
        mesh.scale.set(height * a, height, 1);
        const fadeIn = ramp(z, -REST - FAR, -REST - FAR * 0.55);
        const fadeOut = 1 - ramp(z, -3.6, -1.4);
        m.uniforms.opacity.value = fadeIn * fadeOut;
        m.uniforms.blurAmount.value = Math.min(7, dof + (g < 0 ? -g * 9 : g * 3));
        m.uniforms.scrollForce.value = speed * 0.6;
        m.uniforms.time.value = time;
      };

      place(slot.hero, 0, 0, heroZ, h, ar, 0);
      materials[slot.hero].uniforms.focus.value = lift;
      slot.sats.forEach((i, j) => {
        const s = SATS[j];
        place(i, s.x * viewW, s.y * viewH, heroZ + s.dz, h * 0.42, aspectOf(textures[i]), (s.dz < 0 ? 1.4 : 0.6) + 3 * lift);
        materials[i].uniforms.opacity.value *= 0.85 * (1 - 0.6 * lift);
      });
    });
  });

  return (
    <>
      {layout.urls.map((_, i) => {
        const owner = layout.slots.findIndex((s) => s.hero === i);
        const isHero = owner >= 0;
        return (
          <mesh
            key={i}
            ref={(m) => {
              meshes.current[i] = m;
            }}
            material={materials[i]}
            onPointerEnter={() => {
              if (!isHero || materials[i].uniforms.opacity.value < 0.6) return;
              aim.current = owner;
              callbacks.current?.onHover(owner);
            }}
            onPointerLeave={() => {
              if (!isHero) return;
              if (aim.current === owner) aim.current = -1;
              callbacks.current?.onHover(null);
            }}
            onClick={() => {
              if (isHero && materials[i].uniforms.opacity.value > 0.6) callbacks.current?.onSelect(owner);
            }}
          >
            <planeGeometry args={[1, 1, 32, 32]} />
          </mesh>
        );
      })}
    </>
  );
}

export function BrandTunnel({ chapters }: { chapters: Chapter[] }) {
  const n = chapters.length;
  const router = useRouter();
  const section = useRef<HTMLElement>(null);
  const progress = useRef(-LEAD);
  const callbacks = useRef<Callbacks>({ onChapter: () => {}, onColours: () => {}, onHover: () => {}, onSelect: () => {} });
  const [chapter, setChapter] = useState(0);
  const [colours, setColours] = useState<string[]>([]);
  const [hover, setHover] = useState(false);
  const [near, setNear] = useState(false);
  const [live, setLive] = useState(false);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const dawn = useRef<HTMLDivElement>(null);
  const seam = useRef<HTMLDivElement>(null);

  const sized = useMemo(() => {
    // The chapter's picture fills most of a screen, bent: a fixed 1600 went
    // soft on a sharp wide screen. Sized to the screen instead (all nine
    // are held at once, so a phone keeps small files), up to 2400.
    const hero =
      typeof window === "undefined"
        ? 1600
        : Math.min(2400, Math.round(window.innerWidth * Math.min(2, window.devicePixelRatio || 1) * 0.75));
    const sat = Math.min(1024, Math.max(320, Math.round(hero * 0.45)));
    return chapters.map((c) => ({
      hero: imageLoader({ src: c.hero, width: hero }),
      video: c.video,
      sats: c.sats.map((s) => imageLoader({ src: s, width: sat })),
    }));
  }, [chapters]);

  // Where the page has to be for chapter k to be at rest.
  const scrollFor = useCallback(
    (k: number) => {
      const el = section.current;
      if (!el) return 0;
      const run = el.offsetHeight - window.innerHeight;
      return el.offsetTop + ((k + LEAD) / (n - 1 + LEAD)) * run;
    },
    [n],
  );

  useEffect(() => {
    callbacks.current = {
      onChapter: setChapter,
      onColours: setColours,
      onHover: (k) => setHover(k !== null),
      onSelect: (k) => router.push(chapters[k].href),
    };
  }, [chapters, router]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const onScroll = () => {
      const box = el.getBoundingClientRect();
      // While the tunnel is still coming up under the opening, its top
      // is held in the dark and the light rises out of it.
      if (dawn.current) {
        const k = Math.min(1, Math.max(0, box.top / window.innerHeight));
        const e = Math.min(1, k * 1.8);
        dawn.current.style.opacity = (e * e * (3 - 2 * e)).toFixed(3);
      }
      // The very edge stays dark until it is almost at the top of the
      // screen, so the light never shows a line where it begins.
      if (seam.current) seam.current.style.opacity = Math.min(1, (Math.min(1, Math.max(0, box.top / window.innerHeight))) * 14).toFixed(3);
      const run = box.height - window.innerHeight;
      const r = run > 0 ? Math.min(1, Math.max(0, -box.top / run)) : 0;
      progress.current = -LEAD + r * (n - 1 + LEAD);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const ahead = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    const seen = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    ahead.observe(el);
    seen.observe(el);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ahead.disconnect();
      seen.disconnect();
    };
  }, [n]);

  // The drum turns with the scroll, eased, written straight to the page.
  useEffect(() => {
    if (!live) return;
    let raf = 0;
    let a = Math.min(n - 1, Math.max(0, progress.current ?? 0));
    const tick = () => {
      a += (Math.min(n - 1, Math.max(0, progress.current ?? 0)) - a) * 0.1;
      items.current.forEach((el, k) => {
        if (!el) return;
        const p = drum(k - a);
        el.style.transform = p.transform;
        el.style.opacity = p.opacity.toFixed(3);
        el.style.pointerEvents = p.reachable ? "auto" : "none";
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, n]);

  const current = chapters[chapter];

  return (
    <section
      ref={section}
      aria-label="Work"
      className="relative"
      // Pulled up under the end of the opening, so there is no gap of
      // plain dark between the two.
      style={{ height: `${(n - 1 + LEAD) * PER_CHAPTER * 100 + 100}svh`, marginTop: `-${OVERLAP}svh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden" style={{ background: INK }} data-cursor={hover ? "" : undefined}>
        <LightCurtain tint={colours[chapter]} className="pointer-events-none absolute inset-0" />
        {/* The focus pull dims the room too: the light behind falls back
            while a picture is looked at. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: INK, opacity: hover ? 0.45 : 0, transition: "opacity 0.9s ease" }}
        />

        {near ? (
          <Canvas
            camera={{ position: [0, 0, 0], fov: FOV }}
            gl={{ antialias: true, alpha: true }}
            frameloop={live ? "always" : "never"}
            style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}
          >
            <Scene chapters={sized} progress={progress} callbacks={callbacks} />
          </Canvas>
        ) : null}

        {/* Vignette: the sides and the floor close in; the top, where the
            light falls from, stays open. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 85% 95% at 50% 25%, transparent 45%, ${INK} 100%)` }}
        />
        <div aria-hidden className="tunnel-grain pointer-events-none absolute inset-0" />

        {/* The seam with the opening above: no edge where the light
            begins. The top of the tunnel is ground while it comes up, and
            clears as it reaches the top of the screen. */}
        <div
          ref={dawn}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{ height: "70%", background: `linear-gradient(to bottom, ${INK} 0%, ${INK}99 30%, transparent 100%)` }}
        />
        <div
          ref={seam}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{ height: "22%", background: `linear-gradient(to bottom, ${INK} 0%, ${INK} 20%, transparent 100%)` }}
        />

        {/* No name across the picture (Dilan and Batu, 2026-11-04: with it
            the tunnel read as crowded). The picture speaks; the index on
            the left says whose it is, and on a phone, where there is no
            index, the line at the bottom does. */}

        {/* The index: every brand on a drum, the current one at the front.
            Placed for the first chapter here; the drum turns from then on. */}
        <nav
          aria-label="Brands"
          className="absolute left-5 top-1/2 hidden -translate-y-1/2 md:block"
          style={{
            height: "24rem",
            width: "19rem",
            color: BONE,
            maskImage: "linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)",
          }}
        >
          {chapters.map((c, k) => {
            const p = drum(k);
            return (
              <button
                key={c.href}
                ref={(el) => {
                  items.current[k] = el;
                }}
                type="button"
                aria-current={k === chapter ? "true" : undefined}
                onClick={() => window.scrollTo({ top: scrollFor(k), behavior: "smooth" })}
                className="mono absolute left-0 top-1/2 flex origin-left gap-3 whitespace-nowrap text-left"
                style={{ fontSize: "0.875rem", transform: p.transform, opacity: p.opacity }}
              >
                <span>{String(k + 1).padStart(2, "0")}</span>
                <span>{c.title}</span>
              </button>
            );
          })}
        </nav>


        {/* The chapter's line, and the way in. */}
        <div className="absolute inset-x-0 bottom-20 flex flex-col items-center gap-2 text-center md:bottom-16" style={{ color: BONE }}>
          <span className="mono md:hidden" style={{ fontSize: "0.75rem" }}>
            {current.title}
          </span>
          <span className="mono opacity-55" style={{ fontSize: "0.6875rem" }}>
            {String(chapter + 1).padStart(2, "0")}/{String(n).padStart(2, "0")} — {current.sub}
          </span>
          <Link href={current.href} className="mono border-b pb-0.5" style={{ fontSize: "0.6875rem", borderColor: BONE }}>
            View project →
          </Link>
        </div>
      </div>
    </section>
  );
}
