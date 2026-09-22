import { useId } from "react";

type HexMeshProps = {
  className?: string;
  /** Hexagon edge length in SVG units (default 26). */
  cell?: number;
  /** Stroke width (default 1). */
  strokeWidth?: number;
};

/**
 * Tiling hexagonal mesh (honeycomb) used as a faint texture: hero upper-right on dark
 * grounds, page corners on light grounds. Colour follows `currentColor`; opacity is set
 * by the caller's CSS. Purely decorative.
 */
export function HexMesh({ className, cell = 26, strokeWidth = 1 }: HexMeshProps) {
  const id = useId();
  const w = Math.sqrt(3) * cell;
  const h = 2 * cell;
  const tileW = w;
  const tileH = 1.5 * h;
  const hex = (cx: number, cy: number) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      points.push(
        `${(cx + cell * Math.cos(angle)).toFixed(2)},${(cy + cell * Math.sin(angle)).toFixed(2)}`,
      );
    }
    return points.join(" ");
  };
  const patternId = `hex-${id.replace(/:/g, "")}`;

  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={patternId} width={tileW} height={tileH} patternUnits="userSpaceOnUse">
          <polygon
            points={hex(w / 2, cell)}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <polygon
            points={hex(0, cell * 2.5)}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <polygon
            points={hex(w, cell * 2.5)}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
