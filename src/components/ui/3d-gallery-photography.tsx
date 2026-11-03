"use client";

import type React from "react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// An endless tunnel of photographs: planes spread around the camera's line
// of sight drift towards it, sharpen as they arrive, fade and blur as they
// pass, and come round again at the back with the next picture. Left alone
// for three seconds it plays itself. Under a pointer a plane ripples like a
// flag.
//
// From 21st.dev's "3d-gallery-photography", reworked for this site: the
// motion lives in refs and is written straight onto the meshes each frame
// (the original set React state every frame, a re-render sixty times a
// second); input is taken from this gallery's own canvas rather than the
// first canvas on the page; `speed` and `visibleCount` reach the scene;
// touch drags work; colours go out in sRGB; the no-WebGL fallback is set
// in the site's palette.
//
// Added here: `drive="scroll"` lets the page's own scroll push the tunnel,
// for a gallery set inside a scrolling page, where taking the wheel would
// trap the reader; `onHover`, `onSelect` and `onFront` report which picture
// is under the pointer, clicked, or nearest the viewer (with its colour);
// nothing loads until the gallery comes near the screen and nothing is
// drawn while it is off it.

type ImageItem = string | { src: string; alt?: string };

interface FadeSettings {
  fadeIn: { start: number; end: number };
  fadeOut: { start: number; end: number };
}

interface BlurSettings {
  blurIn: { start: number; end: number };
  blurOut: { start: number; end: number };
  maxBlur: number;
}

interface InfiniteGalleryProps {
  images: ImageItem[];
  speed?: number;
  /** Accepted for compatibility with the original API; not used. */
  zSpacing?: number;
  visibleCount?: number;
  /** Accepted for compatibility with the original API; not used. */
  falloff?: { near: number; far: number };
  fadeSettings?: FadeSettings;
  blurSettings?: BlurSettings;
  /** "wheel" (default) takes the wheel over the canvas; "scroll" follows
   * the page's own scroll and leaves the wheel alone. */
  drive?: "wheel" | "scroll";
  /** Index into `images` of the picture under the pointer, or null. */
  onHover?: (index: number | null) => void;
  onSelect?: (index: number) => void;
  /** The picture nearest the viewer changed: its index and its colour. */
  onFront?: (index: number, color: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface PlaneData {
  z: number;
  imageIndex: number;
}

type Callbacks = Pick<InfiniteGalleryProps, "onHover" | "onSelect" | "onFront">;

const DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;
const IDLE_MS = 3000;

export const createClothMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Curve the plane with the scroll force, plus a light cloth ripple.
        float curveIntensity = scrollForce * 0.3;
        float d = length(pos.xy);
        float curve = d * d * curveIntensity;
        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float cloth = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;

        // Under the pointer: a flag wave, stronger towards the free edge.
        float flag = 0.0;
        if (isHovered > 0.5) {
          float damp = smoothstep(-0.5, 0.5, pos.x);
          flag = sin(pos.x * 3.0 + time * 8.0) * 0.1 * damp;
          flag += sin(pos.x * 5.0 + time * 12.0) * 0.03 * damp;
        }

        pos.z -= curve + cloth + flag;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(map, vUv);

        if (blurAmount > 0.0) {
          vec2 texel = 1.0 / vec2(textureSize(map, 0));
          vec4 sum = vec4(0.0);
          float total = 0.0;
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              float w = 1.0 / (1.0 + length(vec2(x, y)));
              sum += texture2D(map, vUv + vec2(x, y) * texel * blurAmount) * w;
              total += w;
            }
          }
          color = sum / total;
        }

        color.rgb += vec3(abs(scrollForce) * 0.005);
        gl_FragColor = vec4(color.rgb, color.a * opacity);
        #include <colorspace_fragment>
      }
    `,
  });

/** 0 → 1 across [start, end], clamped. */
export function ramp(x: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (x - start) / (end - start)));
}

function aspectScale(texture: THREE.Texture | undefined): [number, number, number] {
  const img = texture?.image as { width?: number; height?: number } | undefined;
  const aspect = img?.width && img?.height ? img.width / img.height : 1;
  return aspect > 1 ? [2 * aspect, 2, 1] : [2, 2 / aspect, 1];
}

/** A picture's colour, for light to take from it: the average of its
 * pixels weighted towards the vivid ones, so a red dress on grey reads red,
 * then lifted to a saturation and lightness that glows on black. */
export function colourOf(texture: THREE.Texture | undefined): string {
  const img = texture?.image as CanvasImageSource | undefined;
  if (!img) return "hsl(0 0% 30%)";
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 16;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "hsl(0 0% 30%)";
    ctx.drawImage(img, 0, 0, 16, 16);
    const px = ctx.getImageData(0, 0, 16, 16).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let wsum = 0;
    for (let i = 0; i < px.length; i += 4) {
      const max = Math.max(px[i], px[i + 1], px[i + 2]);
      const min = Math.min(px[i], px[i + 1], px[i + 2]);
      const w = 0.05 + ((max - min) / 255) * (max / 255);
      r += px[i] * w;
      g += px[i + 1] * w;
      b += px[i + 2] * w;
      wsum += w;
    }
    const [h, s] = hsl(r / wsum, g / wsum, b / wsum);
    return `hsl(${Math.round(h)} ${Math.round(Math.max(0.35, Math.min(0.85, s * 1.4)) * 100)}% 42%)`;
  } catch {
    return "hsl(0 0% 30%)";
  }
}

function hsl(r: number, g: number, b: number): [number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s];
}

function GalleryScene({
  images,
  speed = 1,
  visibleCount = 8,
  fadeSettings,
  blurSettings,
  drive,
  live,
  callbacks,
}: {
  images: { src: string; alt: string }[];
  speed?: number;
  visibleCount?: number;
  fadeSettings: FadeSettings;
  blurSettings: BlurSettings;
  drive: "wheel" | "scroll";
  live: boolean;
  callbacks: React.RefObject<Callbacks>;
}) {
  const textures = useTexture(
    images.map((img) => img.src),
    (loaded) => {
      for (const t of [loaded].flat()) t.colorSpace = THREE.SRGBColorSpace;
    },
  );
  const gl = useThree((s) => s.gl);
  const total = images.length;
  const colours = useMemo(() => textures.map(colourOf), [textures]);

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createClothMaterial()),
    [visibleCount],
  );
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  // Spread around the line of sight: golden-angle offsets, varied radii.
  const spots = useMemo(
    () =>
      Array.from({ length: visibleCount }, (_, i) => {
        const h = (i * 2.618) % (Math.PI * 2);
        const v = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
        return {
          x: (Math.sin(h) * (i % 3) * 1.2 * MAX_HORIZONTAL_OFFSET) / 3,
          y: (Math.cos(v) * ((i + 1) % 4) * 0.8 * MAX_VERTICAL_OFFSET) / 4,
        };
      }),
    [visibleCount],
  );

  const start = useMemo<PlaneData[]>(
    () =>
      Array.from({ length: visibleCount }, (_, i) => ({
        z: ((DEPTH_RANGE / visibleCount) * i) % DEPTH_RANGE,
        imageIndex: total > 0 ? i % total : 0,
      })),
    [visibleCount, total],
  );

  const planes = useRef<PlaneData[]>([]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const velocity = useRef(0);
  const lastInput = useRef(0);
  const front = useRef(-1);
  const liveRef = useRef(live);

  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  // A fresh set of planes whenever the count or the pictures change.
  useEffect(() => {
    planes.current = start.map((p) => ({ ...p }));
    start.forEach((p, i) => {
      materials[i].uniforms.map.value = textures[p.imageIndex] ?? null;
      meshes.current[i]?.scale.set(...aspectScale(textures[p.imageIndex]));
    });
  }, [start, materials, textures]);

  // Input: the page's scroll, or the wheel over this gallery's own canvas;
  // the arrow keys and a finger dragged up or down either way.
  useEffect(() => {
    const el = gl.domElement;
    const push = (v: number) => {
      velocity.current += v;
      lastInput.current = performance.now();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      push(e.deltaY * 0.01 * speed);
    };
    const page = { y: window.scrollY };
    const onScroll = () => {
      const dy = window.scrollY - page.y;
      page.y = window.scrollY;
      if (liveRef.current) push(dy * 0.01 * speed);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!liveRef.current) return;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") push(-2 * speed);
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") push(2 * speed);
    };
    const drag: { y: number | null } = { y: null };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && drive === "wheel") drag.y = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (drag.y === null) return;
      push((drag.y - e.clientY) * 0.02 * speed);
      drag.y = e.clientY;
    };
    const onUp = () => {
      drag.y = null;
    };
    if (drive === "wheel") el.addEventListener("wheel", onWheel, { passive: false });
    else window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("keydown", onKey);
    };
  }, [gl, speed, drive]);

  useFrame((state, delta) => {
    if (performance.now() - lastInput.current > IDLE_MS) velocity.current += 0.3 * delta;
    velocity.current *= 0.95;
    const v = velocity.current;
    const time = state.clock.getElapsedTime();
    const advance = total > 0 ? visibleCount % total || total : 0;
    // The nearest picture still fully in view.
    let nearest = -1;
    let nearestN = -1;

    planes.current.forEach((plane, i) => {
      const material = materials[i];
      const mesh = meshes.current[i];
      if (!material || !mesh) return;

      let z = plane.z + v * delta * 10;
      // Round the back again, carrying the next picture.
      const wraps = Math.floor(z / DEPTH_RANGE);
      if (wraps !== 0 && total > 0) {
        plane.imageIndex = (((plane.imageIndex + wraps * advance) % total) + total) % total;
        const tex = textures[plane.imageIndex];
        material.uniforms.map.value = tex;
        mesh.scale.set(...aspectScale(tex));
      }
      z -= wraps * DEPTH_RANGE;
      plane.z = z;
      mesh.position.set(spots[i].x, spots[i].y, z - DEPTH_RANGE / 2);

      const n = z / DEPTH_RANGE;
      const opacity = n < fadeSettings.fadeOut.start
        ? ramp(n, fadeSettings.fadeIn.start, fadeSettings.fadeIn.end)
        : 1 - ramp(n, fadeSettings.fadeOut.start, fadeSettings.fadeOut.end);
      const blur = n < blurSettings.blurOut.start
        ? blurSettings.maxBlur * (1 - ramp(n, blurSettings.blurIn.start, blurSettings.blurIn.end))
        : blurSettings.maxBlur * ramp(n, blurSettings.blurOut.start, blurSettings.blurOut.end);

      material.uniforms.time.value = time;
      material.uniforms.scrollForce.value = v;
      material.uniforms.opacity.value = opacity;
      material.uniforms.blurAmount.value = blur;

      if (opacity > 0.6 && n < fadeSettings.fadeOut.start && n > nearestN) {
        nearestN = n;
        nearest = plane.imageIndex;
      }
    });

    if (nearest >= 0 && nearest !== front.current) {
      front.current = nearest;
      callbacks.current?.onFront?.(nearest, colours[nearest]);
    }
  });

  if (total === 0) return null;

  return (
    <>
      {start.map((p, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          position={[spots[i].x, spots[i].y, p.z - DEPTH_RANGE / 2]}
          scale={aspectScale(textures[p.imageIndex])}
          material={materials[i]}
          onPointerEnter={() => {
            materials[i].uniforms.isHovered.value = 1;
            const at = planes.current[i]?.imageIndex;
            if (at !== undefined) callbacks.current?.onHover?.(at);
          }}
          onPointerLeave={() => {
            materials[i].uniforms.isHovered.value = 0;
            callbacks.current?.onHover?.(null);
          }}
          onClick={() => {
            const at = planes.current[i]?.imageIndex;
            if (at !== undefined) callbacks.current?.onSelect?.(at);
          }}
        >
          <planeGeometry args={[1, 1, 32, 32]} />
        </mesh>
      ))}
    </>
  );
}

// For a browser without WebGL: the same pictures as a plain grid.
function FallbackGallery({ images }: { images: { src: string; alt: string }[] }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <p className="mono mb-4 opacity-60">WebGL not supported</p>
      <div className="grid max-h-[80%] w-full grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3">
        {images.map((img, i) => (
          <div key={i} className="relative h-32 w-full">
            <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InfiniteGallery({
  images,
  speed = 1,
  visibleCount = 8,
  drive = "wheel",
  onHover,
  onSelect,
  onFront,
  className = "h-96 w-full",
  style,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.25 },
    fadeOut: { start: 0.4, end: 0.43 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.4, end: 0.43 },
    maxBlur: 8.0,
  },
}: InfiniteGalleryProps) {
  const [webgl, setWebgl] = useState(true);
  // `near`: close enough to load. `live`: on screen, so worth drawing.
  const [near, setNear] = useState(false);
  const [live, setLive] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const callbacks = useRef<Callbacks>({});
  const normalized = useMemo(
    () => images.map((img) => (typeof img === "string" ? { src: img, alt: "" } : { src: img.src, alt: img.alt ?? "" })),
    [images],
  );

  useEffect(() => {
    callbacks.current = { onHover, onSelect, onFront };
  }, [onHover, onSelect, onFront]);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-time feature probe after mount
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) setWebgl(false);
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ahead = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    const seen = new IntersectionObserver(([e]) => setLive(e.isIntersecting));
    ahead.observe(el);
    seen.observe(el);
    return () => {
      ahead.disconnect();
      seen.disconnect();
    };
  }, []);

  return (
    <div ref={box} className={className} style={style}>
      {!webgl ? (
        <FallbackGallery images={normalized} />
      ) : near ? (
        <Canvas
          camera={{ position: [0, 0, 0], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
          frameloop={live ? "always" : "never"}
          // In wheel mode a drag through the tunnel must not scroll the page.
          style={{ touchAction: drive === "wheel" ? "none" : "pan-y" }}
        >
          <GalleryScene
            images={normalized}
            speed={speed}
            visibleCount={visibleCount}
            fadeSettings={fadeSettings}
            blurSettings={blurSettings}
            drive={drive}
            live={live}
            callbacks={callbacks}
          />
        </Canvas>
      ) : null}
    </div>
  );
}
