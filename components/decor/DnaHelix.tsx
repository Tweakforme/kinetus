type DnaHelixProps = {
  className?: string;
};

const HEIGHT = 720;
const WIDTH = 150;
const TURNS = 3;
const AMP = 52;
const CX = WIDTH / 2;
const STEPS = 96;

function strand(phase: number): string {
  const parts: string[] = [];
  for (let i = 0; i <= STEPS; i += 1) {
    const t = i / STEPS;
    const y = t * HEIGHT;
    const x = CX + AMP * Math.sin(t * TURNS * Math.PI * 2 + phase);
    parts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return parts.join(" ");
}

/**
 * Ghosted double helix at the right edge of the product page (slide 9). Two sine strands
 * with rungs at regular intervals; drawn at 150×720 and scaled by CSS. Decorative.
 */
export function DnaHelix({ className }: DnaHelixProps) {
  const rungs: { x1: number; x2: number; y: number }[] = [];
  const rungCount = TURNS * 8;
  for (let i = 0; i <= rungCount; i += 1) {
    const t = i / rungCount;
    const y = t * HEIGHT;
    const a = t * TURNS * Math.PI * 2;
    rungs.push({ x1: CX + AMP * Math.sin(a), x2: CX + AMP * Math.sin(a + Math.PI), y });
  }

  return (
    <svg
      className={className}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d={strand(0)} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d={strand(Math.PI)} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {rungs.map((rung, index) => (
        <line
          key={index}
          x1={rung.x1.toFixed(1)}
          y1={rung.y.toFixed(1)}
          x2={rung.x2.toFixed(1)}
          y2={rung.y.toFixed(1)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      {rungs.map((rung, index) => (
        <g key={`n-${index}`}>
          <circle cx={rung.x1.toFixed(1)} cy={rung.y.toFixed(1)} r="4" fill="currentColor" />
          <circle cx={rung.x2.toFixed(1)} cy={rung.y.toFixed(1)} r="4" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}
