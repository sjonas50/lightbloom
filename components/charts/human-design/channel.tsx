"use client";

interface ChannelProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  defined: boolean;
  hasPersonality: boolean;
  hasDesign: boolean;
}

const PERSONALITY_COLOR = "#1a1a2e";
const DESIGN_COLOR = "#ef4444";
const UNDEFINED_COLOR = "#4b5563";

export default function Channel({
  fromX,
  fromY,
  toX,
  toY,
  defined,
  hasPersonality,
  hasDesign,
}: ChannelProps) {
  if (!defined) {
    // Undefined channel: gray dashed line
    return (
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke={UNDEFINED_COLOR}
        strokeWidth={2}
        strokeDasharray="6 4"
        strokeOpacity={0.4}
        strokeLinecap="round"
      />
    );
  }

  // Both personality and design activations: draw two parallel lines
  if (hasPersonality && hasDesign) {
    // Compute a perpendicular offset for the split-line effect
    const dx = toX - fromX;
    const dy = toY - fromY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const offsetX = (dy / len) * 2;
    const offsetY = -(dx / len) * 2;

    return (
      <g>
        {/* Personality side (black/dark) */}
        <line
          x1={fromX + offsetX}
          y1={fromY + offsetY}
          x2={toX + offsetX}
          y2={toY + offsetY}
          stroke={PERSONALITY_COLOR}
          strokeWidth={3}
          strokeLinecap="round"
          strokeOpacity={0.9}
        />
        {/* Design side (red) */}
        <line
          x1={fromX - offsetX}
          y1={fromY - offsetY}
          x2={toX - offsetX}
          y2={toY - offsetY}
          stroke={DESIGN_COLOR}
          strokeWidth={3}
          strokeLinecap="round"
          strokeOpacity={0.9}
        />
      </g>
    );
  }

  // Only personality activation
  if (hasPersonality) {
    return (
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke={PERSONALITY_COLOR}
        strokeWidth={4}
        strokeLinecap="round"
        strokeOpacity={0.9}
      />
    );
  }

  // Only design activation
  if (hasDesign) {
    return (
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke={DESIGN_COLOR}
        strokeWidth={4}
        strokeLinecap="round"
        strokeOpacity={0.9}
      />
    );
  }

  // Fallback: defined but no specific activation info -- draw solid neutral
  return (
    <line
      x1={fromX}
      y1={fromY}
      x2={toX}
      y2={toY}
      stroke="#d4a574"
      strokeWidth={4}
      strokeLinecap="round"
      strokeOpacity={0.7}
    />
  );
}
