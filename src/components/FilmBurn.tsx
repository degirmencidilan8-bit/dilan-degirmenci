"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// The cut between pages is a film burn, and it burns like paper: the old
// page catches in the middle and a hole burns outward through it, ragged,
// a hard bright edge running ahead of it. What the burn leaves is the page
// in negative, black and white, the way the names are set over the
// pictures: the page drains of colour, and inside the hole it is turned
// over, wholly where it burns hottest, half where it is thin, until the
// whole frame is a negative. There the new page is put under it, and the
// negative catches in the middle and burns open the same way onto the new
// page, the colour coming back as it goes. Hairline scratches run down
// the frame while it burns, and it flickers at film's 24 frames a second.
// Every burn is a little different.
//
// It is shot on film, not drawn: grain in two layers, the frame weaving in
// the gate, and dust.
//
// One fragment shader on a raw WebGL canvas over everything, drawn at two
// thirds of the screen's resolution and only while a burn is running; the
// rest of the time the canvas is not drawn at all.
//
// It takes over clicks on links within the site so the burn can start
// before the page changes; a page changed any other way (back, forward, a
// picture in the homepage tunnel) still burns out on arrival. With reduced
// motion asked for, none of this happens.

const VERT = `#version 300 es
in vec2 p;
out vec2 uv;
void main() {
  uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 uv;
out vec4 o;
uniform float amt;
uniform float t;
uniform float seed;
uniform vec2 dir;
uniform float aspect;
// How far the burn front has spread from the middle, 0 to 1 (the corners).
uniform float reach;
// 0 while the old page burns away (burn inside the front); 1 while the
// burn itself burns open (the new page inside the front).
uniform float opening;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += noise(p) * a;
    p *= 2.03;
    a *= 0.5;
  }
  return s;
}

// How far the burn turns the page to its negative: not at all where it has
// not caught, half where it is thin, wholly where it burns hottest. The
// canvas is laid over the page by difference, so white here is the page
// inverted and black is the page as it was.
float ramp(float b) {
  return 0.55 * smoothstep(0.04, 0.4, b) + 0.45 * smoothstep(0.45, 1.0, b);
}

// How burnt the film is at a point, for a frame's flicker-scaled amount.
float burnAt(vec2 p, float a) {
  // The burn's body: soft blotches drifting, stretched along the film's run.
  float f = fbm(vec2(p.x * 2.2, p.y * 1.1) + seed + vec2(t * 0.35, -t * 0.6));
  // It catches from one edge first.
  float e = clamp(dot(p - 0.5, dir) + 0.5, 0.0, 1.0);
  e = e * e;
  // Streaks down the frame, where the light leaks along the gate.
  float streak = fbm(vec2(p.x * 9.0 + seed * 3.0, p.y * 0.4 + t * 0.5));
  return a * (0.32 + 0.85 * f + 0.7 * e + 0.25 * streak) * (0.55 + 0.65 * a);
}

void main() {
  // Film runs at 24 frames a second: the frame flickers in brightness and
  // the picture weaves a little in the gate.
  float frame = floor(t * 24.0);
  float a = amt * (0.8 + 0.2 * hash(vec2(frame, seed)));
  vec2 weave = (vec2(hash(vec2(frame, 1.7)), hash(vec2(frame, 4.3))) - 0.5) * vec2(0.006, 0.01) * amt;
  vec2 p = uv + weave;

  float b = burnAt(p, a);
  vec3 c = vec3(ramp(b));

  // Where the film has only just caught the negative hesitates: a seam
  // where the page shows through as it was.
  float seam = smoothstep(0.1, 0.2, b) * (1.0 - smoothstep(0.22, 0.36, b));
  c *= 1.0 - 0.45 * seam;

  // Hairline scratches, jumping every few frames.
  float col = floor(p.x * 420.0);
  float scratch = step(0.996, hash(vec2(col, floor(frame / 3.0) + seed)));
  c += scratch * a * 0.55 * (0.6 + 0.4 * noise(vec2(col, p.y * 30.0 + frame)));

  // Dust: a handful of dark specks, new every frame, round and of
  // different sizes, each somewhere loose in its own cell of the frame.
  vec2 grid = vec2(48.0, 27.0);
  vec2 cell = floor(p * grid);
  float pick = hash(cell + frame * 7.13 + seed);
  vec2 at = vec2(hash(cell + 3.1 + frame), hash(cell + 9.7 + frame));
  float size = 0.04 + 0.12 * hash(cell + 5.3 + frame);
  float d = length((fract(p * grid) - at) * vec2(grid.x / grid.y, 1.0));
  float dust = step(0.985, pick) * (1.0 - smoothstep(size * 0.6, size, d));
  c *= 1.0 - dust * 0.7 * a;

  // Grain: per pixel and per frame, fine, a little heavier in the mids,
  // where film shows it most.
  float lum = dot(c, vec3(0.3, 0.59, 0.11));
  float g = hash(gl_FragCoord.xy + frame * 13.7) - 0.5;
  c += g * (0.05 + 0.07 * lum * (1.0 - lum) * 4.0) * a;

  // The corners of the frame fall off.
  vec2 v = uv - 0.5;
  c *= 1.0 - 0.45 * dot(v, v) * a;

  // Thin burns are glass, thick ones are the whole frame.
  float alpha = smoothstep(0.03, 0.38, b) + scratch * a * 0.5 + abs(g) * 0.15 * a;

  // The front: a hole burning outward from the middle of the frame, its
  // edge ragged the way paper burns — not a circle.
  vec2 q = (uv - 0.5) * vec2(aspect, 1.0);
  float far = length(vec2(aspect, 1.0)) * 0.5;
  float rag = (fbm(q * 3.2 + seed) - 0.5) * 0.32 + (fbm(q * 11.0 - seed + t * 0.6) - 0.5) * 0.08;
  float front = reach * (far + 0.42) - 0.06;
  // Negative inside the hole, positive outside it.
  float x = length(q) + rag - front;
  float inside = 1.0 - smoothstep(-0.004, 0.004, x);

  // Burning: the burn fills the hole and the old page is left outside it.
  // Opening: the burn is what is left outside, the new page is the hole.
  float region = mix(inside, 1.0 - inside, opening);
  c *= region;
  alpha *= region;

  // The edge where it is burning now: a hard line of full negative, and
  // round it a halo half turned, so the front reads on any page.
  float flick = 0.75 + 0.25 * hash(vec2(frame, seed + 2.0));
  float core = exp(-pow(x / 0.006, 2.0)) * flick;
  float glow = exp(-pow(x / 0.035, 2.0)) * 0.5 * flick;
  c = max(c, vec3(core + glow));
  alpha = max(alpha, max(core, glow));

  o = vec4(clamp(c, 0.0, 1.0), clamp(alpha, 0.0, 1.0));
}`;

/** The old page burning through from the middle, ms. */
const IN_MS = 520;
/** The burn burning open from the middle onto the new page, ms. */
const OUT_MS = 1150;
/** If the new page is slow to come, burn out anyway after this long. */
const HOLD_MAX_MS = 2500;
/** The burn holds at full at least this long, a beat of pure negative. */
const HOLD_MIN_MS = 180;

function ramp(x: number, a: number, b: number) {
  return Math.max(0, Math.min(1, (x - a) / (b - a)));
}

type Phase = "idle" | "in" | "hold" | "out";

export function FilmBurn() {
  const pathname = usePathname();
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  // The running burn, shared by the click handler, the route change and
  // the draw loop.
  const burn = useRef({ phase: "idle" as Phase, at: 0, from: 0, amt: 0, peak: 0 });
  const grain = useRef<HTMLDivElement>(null);
  const mono = useRef<HTMLDivElement>(null);
  const kick = useRef<() => void>(() => {});
  const first = useRef(true);

  // The draw loop, set up once.
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = el.getContext("webgl2", { premultipliedAlpha: false, antialias: false });
    if (!gl) return;

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uAmt = gl.getUniformLocation(prog, "amt");
    const uT = gl.getUniformLocation(prog, "t");
    const uSeed = gl.getUniformLocation(prog, "seed");
    const uDir = gl.getUniformLocation(prog, "dir");
    const uAspect = gl.getUniformLocation(prog, "aspect");
    const uReach = gl.getUniformLocation(prog, "reach");
    const uOpening = gl.getUniformLocation(prog, "opening");

    let raf = 0;
    let running = false;
    let born = 0;

    // Two thirds of the screen's resolution: the burn is all bloom, but its
    // grain has to be fine enough to read as film rather than blocks.
    const size = () => {
      el.width = Math.max(1, Math.round(window.innerWidth / 1.5));
      el.height = Math.max(1, Math.round(window.innerHeight / 1.5));
      gl.viewport(0, 0, el.width, el.height);
      gl.uniform1f(uAspect, el.width / el.height);
    };

    // Where the front is: spreading from the middle while the old page
    // burns (reach 0 → 1, burn inside), held over the whole frame, then
    // burning open from the middle again on the new page (reach 0 → 1,
    // the page inside). The burn itself is hottest at the hold.
    let reach = 0;
    let opening = 0;
    // How far the page under the burn is drained of colour.
    let gray = 0;

    const draw = (now: number) => {
      const b = burn.current;
      const dt = now - b.at;
      if (b.phase === "in") {
        const k = Math.min(1, dt / IN_MS);
        // Catches slowly, then runs.
        reach = Math.pow(k, 1.4);
        opening = 0;
        b.amt = b.from + (1 - b.from) * (0.65 + 0.35 * k);
        gray = ramp(k, 0, 0.6);
        if (k >= 1) {
          b.phase = "hold";
          b.at = now;
          b.peak = now;
        }
      } else if (b.phase === "hold") {
        b.amt = 1;
        reach = 1;
        opening = 0;
        gray = 1;
        if (dt > HOLD_MAX_MS) {
          b.phase = "out";
          b.at = now;
          b.from = 1;
        }
      } else if (b.phase === "out") {
        // A start in the future is the hold at full.
        const k = Math.max(0, Math.min(1, dt / OUT_MS));
        reach = Math.pow(k, 1.15);
        opening = dt >= 0 ? 1 : 0;
        if (!opening) reach = 1;
        b.amt = b.from * (1 - 0.35 * k);
        // Colour comes back into the new page as the negative burns off it.
        gray = opening ? 1 - ramp(reach, 0.15, 0.85) : 1;
        if (k >= 1) {
          b.phase = "idle";
          b.amt = 0;
          gray = 0;
        }
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uAmt, b.amt);
      gl.uniform1f(uT, (now - born) / 1000);
      gl.uniform1f(uReach, reach);
      gl.uniform1f(uOpening, opening);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (grain.current) grain.current.style.opacity = (b.amt * 0.35).toFixed(3);
      if (mono.current) mono.current.style.opacity = gray.toFixed(3);

      if (b.phase === "idle") {
        running = false;
        el.style.visibility = "hidden";
        if (grain.current) grain.current.style.opacity = "0";
        if (mono.current) {
          mono.current.style.opacity = "0";
          mono.current.style.visibility = "hidden";
        }
        return;
      }
      raf = requestAnimationFrame(draw);
    };

    kick.current = () => {
      if (running) return;
      running = true;
      born = performance.now();
      // A new burn: its own pattern and its own edge to catch from.
      const a = Math.random() * Math.PI * 2;
      gl.uniform1f(uSeed, Math.random() * 100);
      gl.uniform2f(uDir, Math.cos(a), Math.sin(a));
      size();
      el.style.visibility = "visible";
      if (mono.current) mono.current.style.visibility = "visible";
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      kick.current = () => {};
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  // Clicks on links within the site: burn first, then go.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // The same page (a filter, an anchor) is not a cut.
      if (url.pathname === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      const b = burn.current;
      if (b.phase !== "idle") return;
      b.phase = "in";
      b.at = performance.now();
      b.from = 0;
      kick.current();
      window.setTimeout(() => router.push(url.pathname + url.search + url.hash), IN_MS);
    };
    // Capture, so the burn starts before the link's own navigation runs.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // The new page is here: burn back off it.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const b = burn.current;
    const now = performance.now();
    if (b.phase === "in" || b.phase === "hold") {
      b.from = 1;
      // Hold at full for a moment once full is reached.
      const peak = b.phase === "hold" ? b.peak : b.at + IN_MS;
      b.phase = "out";
      b.at = Math.max(now, peak + HOLD_MIN_MS);
    } else {
      // Arrived without a click (back, forward): flare on arrival.
      b.from = 0.95;
      kick.current();
      b.phase = "out";
      b.at = now + HOLD_MIN_MS * 0.6;
    }
  }, [pathname]);

  return (
    <>
      {/* The page goes to black and white under the burn, so the burn's
          negative is a black-and-white one, like the names set over the
          pictures. */}
      <div
        ref={mono}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[299] backdrop-grayscale"
        style={{ opacity: 0, visibility: "hidden" }}
      />
      <canvas
        ref={canvas}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[300] h-full w-full mix-blend-difference"
        style={{ visibility: "hidden" }}
      />
      {/* Fine grain over the burn, stepped like the
          darkroom's: the shader's grain is the coarse layer, this the
          fine one. Only there while a burn is. */}
      <div
        ref={grain}
        aria-hidden
        className="burn-grain pointer-events-none fixed inset-0 z-[302] mix-blend-overlay"
        style={{ opacity: 0 }}
      />
    </>
  );
}
