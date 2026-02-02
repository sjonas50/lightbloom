"use client";

interface CenterProps {
  name: string;
  x: number;
  y: number;
  shape: string;
  width: number;
  height: number;
  defined: boolean;
}

const DEFINED_FILL = "#d4a574";
const DEFINED_STROKE = "#b8956a";
const UNDEFINED_FILL = "transparent";
const UNDEFINED_STROKE = "#6b7280";

const CENTER_LABELS: Record<string, string> = {
  head: "Head",
  ajna: "Ajna",
  throat: "Throat",
  g: "G",
  heart: "Heart",
  spleen: "Spleen",
  sacral: "Sacral",
  esp: "Solar Plexus",
  root: "Root",
};

function getShapePath(
  shape: string,
  x: number,
  y: number,
  w: number,
  h: number
): string {
  const hw = w / 2;
  const hh = h / 2;

  switch (shape) {
    case "triangle-up":
      return `M ${x} ${y - hh} L ${x + hw} ${y + hh} L ${x - hw} ${y + hh} Z`;
    case "triangle-down":
      return `M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} L ${x} ${y + hh} Z`;
    case "square":
      return `M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} L ${x + hw} ${y + hh} L ${x - hw} ${y + hh} Z`;
    case "diamond":
      return `M ${x} ${y - hh} L ${x + hw} ${y} L ${x} ${y + hh} L ${x - hw} ${y} Z`;
    default:
      // Fallback to a circle-like shape using a square
      return `M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} L ${x + hw} ${y + hh} L ${x - hw} ${y + hh} Z`;
  }
}

export default function Center({
  name,
  x,
  y,
  shape,
  width,
  height,
  defined,
}: CenterProps) {
  const fill = defined ? DEFINED_FILL : UNDEFINED_FILL;
  const stroke = defined ? DEFINED_STROKE : UNDEFINED_STROKE;
  const fillOpacity = defined ? 0.85 : 0;
  const label = CENTER_LABELS[name] ?? name;

  return (
    <g>
      {/* Shape */}
      <path
        d={getShapePath(shape, x, y, width, height)}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth={defined ? 2 : 1.5}
        strokeDasharray={defined ? undefined : "4 2"}
      />

      {/* Subtle inner glow for defined centers */}
      {defined && (
        <path
          d={getShapePath(shape, x, y, width * 0.7, height * 0.7)}
          fill="#d4a574"
          fillOpacity={0.3}
          stroke="none"
        />
      )}

      {/* Center name label */}
      <text
        x={x}
        y={y + height / 2 + 14}
        textAnchor="middle"
        dominantBaseline="auto"
        fill={defined ? "#e2e8f0" : "#9ca3af"}
        fontSize="9"
        fontFamily="sans-serif"
        fontWeight={defined ? "600" : "400"}
      >
        {label}
      </text>
    </g>
  );
}
