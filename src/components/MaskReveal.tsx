"use client";

import { clsx } from "clsx";
import { motion } from "motion/react";
import type { ReactNode } from "react";

// A line rising out of its own box. Translate + overflow rather than
// clip-path: the transform stays on the compositor, so a page full of
// these costs nothing.
//
// Only for display-scale type. Small labels must never do this — at 10px
// it reads as noise, not as craft. The extra bottom padding (undone by a
// matching negative margin) keeps descenders and Turkish diacritics from
// being clipped by the mask.
export function MaskReveal({
  children,
  delay = 0,
  className,
  duration = 0.9,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
}) {
  return (
    // The viewport test has to live on the OUTER box. The inner line
    // starts fully below the mask, so it is completely clipped — and
    // IntersectionObserver honours ancestor clipping, which means a
    // `whileInView` on the line itself would never fire. The outer box is
    // always visible, so it triggers and hands the state down by variant.
    <motion.span
      className={clsx("-mb-[0.18em] block overflow-hidden pb-[0.18em]", className)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
    >
      <motion.span
        className="block"
        variants={{ hidden: { y: "115%" }, shown: { y: "0%" } }}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
