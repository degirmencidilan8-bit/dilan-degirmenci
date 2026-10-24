"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// One line of display type sized to fill its box: the name set as wide as
// the page, whatever the name. Measured once the face has loaded and again
// whenever the box changes size. Until then it is set from an estimate, so
// the server-rendered page is already close and the correction is small.
//
// `fill` above 1 runs the line past the box's edge, deliberately cropped;
// `maxVh` stops a short name (KÖZ, ATIYE) growing taller than the screen.
export function FitText({
  text,
  as: Tag = "p",
  fill = 1,
  maxVh,
  className = "",
  style,
  boxClassName = "",
  boxStyle,
}: {
  text: string;
  as?: "h1" | "p";
  fill?: number;
  maxVh?: number;
  className?: string;
  style?: CSSProperties;
  boxClassName?: string;
  boxStyle?: CSSProperties;
}) {
  const box = useRef<HTMLElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const b = box.current;
    const l = line.current;
    if (!b || !l) return;
    const fit = () => {
      l.style.fontSize = "100px";
      const w = l.getBoundingClientRect().width;
      if (!w || !b.clientWidth) return;
      let px = ((b.clientWidth * fill) / w) * 100;
      if (maxVh) px = Math.min(px, (window.innerHeight * maxVh) / 100);
      l.style.fontSize = `${px.toFixed(1)}px`;
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    return () => ro.disconnect();
  }, [fill, maxVh]);

  // A first guess: a condensed heavy capital is roughly 0.6em wide.
  const guess = Math.min((fill * 100) / (text.length * 0.6), maxVh ? maxVh * 0.9 : 40);

  return (
    <Tag ref={box as never} className={boxClassName} style={boxStyle}>
      <span
        ref={line}
        className={`inline-block whitespace-nowrap ${className}`}
        style={{ fontSize: `${guess.toFixed(2)}vw`, ...style }}
      >
        {text}
      </span>
    </Tag>
  );
}
