type HexLatticeProps = {
  className?: string;
};

/** A vertex of the lattice, shared by neighbouring hexagons. */
function hexPoints(cx: number, cy: number, r: number): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return points;
}

const R = 46;
const W = Math.sqrt(3) * R;
/** Centres of a small honeycomb cluster (the deck's ghosted molecule behind the vial). */
const CENTRES: [number, number][] = [
  [W * 1.5, R * 1.5],
  [W * 2.5, R * 1.5],
  [W * 1, R * 3],
  [W * 2, R * 3],
  [W * 3, R * 3],
  [W * 1.5, R * 4.5],
  [W * 2.5, R * 4.5],
  [W * 2, R * 6],
];

/**
 * Ghosted hexagonal lattice with node circles at each vertex (slide 9's molecule motif
 * behind the product render). Fixed 320×360 drawing; scale with CSS. Decorative.
 */
export function HexLattice({ className }: HexLatticeProps) {
  const nodes = new Map<string, [number, number]>();
  const polygons = CENTRES.map(([cx, cy]) => {
    const pts = hexPoints(cx, cy, R);
    for (const [x, y] of pts) {
      nodes.set(`${x.toFixed(1)},${y.toFixed(1)}`, [x, y]);
    }
    return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  });

  return (
    <svg
      className={className}
      viewBox={`0 0 ${(W * 4).toFixed(0)} ${(R * 7.5).toFixed(0)}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {polygons.map((points, index) => (
        <polygon key={index} points={points} stroke="currentColor" strokeWidth="1.5" />
      ))}
      {Array.from(nodes.values()).map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r="5.5"
          fill="var(--kinetus-bg-base, #fff)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}
