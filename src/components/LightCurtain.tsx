"use client";

import { useEffect, useRef } from "react";

// Light falling through a curtain: soft vertical shafts, leaning and
// swaying, bright at the top and gone by the bottom, sliding past one
// another and breathing, a broad sweep passing across them now and then, each
// edge split into a thin rainbow the way light fringes through old glass or
// burnt film. Cool lavender by default, warmed towards `tint` — the colour
// of the picture in front — so the work still lights its own room.
//
// One fragment shader on a raw WebGL canvas, drawn at a third of the
// screen's resolution (it is all blur, nothing is lost) and only while on
// screen. Without WebGL, or with reduced motion asked for, it is one still
// frame or nothing.

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
uniform float t;
uniform float aspect;
uniform vec3 tint;

float hash(float n) { return fract(sin(n) * 43758.5453); }
float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}

// The shafts at one horizontal position: three layers drifting at their
// own speeds, sharpened so they read as bars rather than haze, each
// breathing brighter and dimmer on its own, and a broad sweep of light
// passing across them every few seconds.
float shafts(float x) {
  float s = 0.0;
  s += pow(noise(x * 5.0 + t * 0.22), 3.0) * 0.75;
  s += pow(noise(x * 11.0 - t * 0.34 + 7.3), 4.0) * 0.55;
  s += pow(noise(x * 23.0 + t * 0.16 + 2.1), 6.0) * 0.35;
  s *= 0.7 + 0.45 * noise(x * 3.0 + t * 0.6 + 4.0);
  float sweep = fract(x * 0.16 - t * 0.09) - 0.5;
  s += exp(-sweep * sweep * 40.0) * 0.32 * (0.6 + 0.4 * noise(x * 9.0 - t));
  return s;
}

void main() {
  // The light reaches a little further down, then draws back.
  float y = uv.y + 0.04 * sin(t * 0.55);
  // Lean: the shafts tilt, the tilt itself rocking slowly, and they sway
  // along their length like a curtain in a draught.
  float x = uv.x * aspect + (1.0 - y) * (0.18 + 0.07 * sin(t * 0.21))
    + sin(y * 2.6 + t * 0.9) * 0.04 + sin(y * 5.0 - t * 1.3) * 0.012;

  // Each channel sampled a hair apart: the rainbow at the edges.
  float r = shafts(x + 0.006);
  float g = shafts(x);
  float b = shafts(x - 0.006);

  // From the top, falling off well before the bottom.
  float fall = smoothstep(0.08, 0.95, y);
  fall *= fall;

  vec3 cool = vec3(0.50, 0.53, 0.70);
  vec3 hue = mix(cool, tint, 0.45);
  vec3 light = vec3(r, g, b) * hue * fall * 1.15;

  vec3 ink = vec3(0.047, 0.047, 0.051);
  o = vec4(ink + light, 1.0);
}`;

/** "hsl(h s% l%)", as the tunnel reports colours, to linear-ish 0..1 RGB. */
function parse(color: string): [number, number, number] {
  const m = color.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!m) return [0.5, 0.5, 0.55];
  const h = Number(m[1]) / 360;
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  const k = (n: number) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

export function LightCurtain({ tint, className }: { tint?: string; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef<[number, number, number]>([0.5, 0.5, 0.55]);

  useEffect(() => {
    if (tint) target.current = parse(tint);
  }, [tint]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const gl = el.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
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

    // One triangle that covers the screen.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uT = gl.getUniformLocation(prog, "t");
    const uAspect = gl.getUniformLocation(prog, "aspect");
    const uTint = gl.getUniformLocation(prog, "tint");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tint = [...target.current];
    const born = performance.now();
    let raf = 0;
    let running = false;

    const size = () => {
      const w = Math.max(1, Math.round(el.clientWidth / 3));
      const h = Math.max(1, Math.round(el.clientHeight / 3));
      el.width = w;
      el.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform1f(uAspect, w / h);
    };

    const draw = (now: number) => {
      // The colour eases towards the picture in front over a second or two.
      for (let i = 0; i < 3; i++) tint[i] += (target.current[i] - tint[i]) * 0.02;
      gl.uniform3f(uTint, tint[0], tint[1], tint[2]);
      gl.uniform1f(uT, still ? 12 : (now - born) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || still) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    size();
    draw(performance.now());
    const ro = new ResizeObserver(() => {
      size();
      if (!running) draw(performance.now());
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(el);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className={className} style={{ width: "100%", height: "100%", display: "block" }} />;
}
