/** A lens's iris as one SVG path: six solid blades for a hexagonal hole of
 * corner radius `hole`, turned by `spin` radians, ending at radius `rim`.
 * Each blade runs from one corner of the hole out along the next edge's
 * line to the rim, round the rim, and back in along the following edge —
 * together they fill the ring outside the hole. Stroke the path in the
 * ground's colour and the strokes become the gaps between the blades.
 *
 * Drawn by the pointer (Cursor) and on the back of the opening's cards
 * (CardOpening). */
export function irisBlades(hole: number, spin: number, rim: number) {
  const P = Array.from({ length: 6 }, (_, i) => {
    const a = spin + (i * Math.PI) / 3;
    return [hole * Math.cos(a), hole * Math.sin(a)] as const;
  });
  // Where the line of edge i (P[i] towards P[i+1]) meets the rim, past P[i+1].
  const Q = P.map((p, i) => {
    const q = P[(i + 1) % 6];
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const l = Math.hypot(dx, dy) || 1;
    const ux = dx / l;
    const uy = dy / l;
    const b = p[0] * ux + p[1] * uy;
    const t = -b + Math.sqrt(Math.max(0, b * b - (p[0] * p[0] + p[1] * p[1]) + rim * rim));
    return [p[0] + t * ux, p[1] + t * uy] as const;
  });
  const f = (n: number) => n.toFixed(2);
  let d = "";
  for (let i = 0; i < 6; i++) {
    const c = P[(i + 1) % 6];
    const a = Q[i];
    const b = Q[(i + 1) % 6];
    let da = Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0]);
    while (da <= -Math.PI) da += 2 * Math.PI;
    while (da > Math.PI) da -= 2 * Math.PI;
    d += `M${f(c[0])} ${f(c[1])}L${f(a[0])} ${f(a[1])}A${rim} ${rim} 0 0 ${da > 0 ? 1 : 0} ${f(b[0])} ${f(b[1])}Z`;
  }
  return d;
}
