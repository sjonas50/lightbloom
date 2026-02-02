/**
 * Reference Implementation: Natal Wheel SVG Component
 *
 * Demonstrates the architectural approach for the astrology chart visualization:
 * - Composable React SVG components
 * - Polar-to-Cartesian coordinate conversion
 * - Layered rendering (zodiac ring -> houses -> planets -> aspects)
 * - Collision detection for planet glyph placement
 *
 * NOTE: This is a reference implementation for architectural documentation.
 * The actual component will have more complete styling and all zodiac glyphs.
 */

import React from "react";

// ─── Types ────────────────────────────────────────────────────────

interface PlanetPosition {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
  retrograde: boolean;
}

interface HouseCusp {
  house: number;
  longitude: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: "conjunction" | "opposition" | "trine" | "square" | "sextile";
  orb: number;
}

interface NatalWheelProps {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: number;
  size?: number;
}

// ─── Constants ────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

// Unicode symbols for zodiac signs
const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A",
  Cancer: "\u264B", Leo: "\u264C", Virgo: "\u264D",
  Libra: "\u264E", Scorpio: "\u264F", Sagittarius: "\u2650",
  Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

// Unicode symbols for planets
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "\u2609", Moon: "\u263D", Mercury: "\u263F",
  Venus: "\u2640", Mars: "\u2642", Jupiter: "\u2643",
  Saturn: "\u2644", Uranus: "\u2645", Neptune: "\u2646",
  Pluto: "\u2647", "North Node": "\u260A",
};

// Aspect colors
const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#FFD700",
  opposition: "#FF4444",
  trine: "#4488FF",
  square: "#FF4444",
  sextile: "#44BB44",
};

// ─── Geometry Helpers ─────────────────────────────────────────────

/**
 * Convert polar coordinates (angle in degrees, radius) to Cartesian (x, y).
 * The wheel is drawn with 0 degrees at the Ascendant position (left/east),
 * going counter-clockwise (standard astrological convention).
 */
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number,
  ascendant: number
): { x: number; y: number } {
  // Adjust angle so Ascendant is at the left (180 degrees in SVG coordinates)
  // Astrology goes counter-clockwise, SVG goes clockwise
  const adjustedAngle = 180 - (angleDegrees - ascendant);
  const angleRad = (adjustedAngle * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY - radius * Math.sin(angleRad),
  };
}

/**
 * Create an SVG arc path between two angles.
 */
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  ascendant: number
): string {
  const start = polarToCartesian(cx, cy, radius, startAngle, ascendant);
  const end = polarToCartesian(cx, cy, radius, endAngle, ascendant);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y,
  ].join(" ");
}

// ─── Sub-Components ───────────────────────────────────────────────

function ZodiacRing({
  cx, cy, outerR, innerR, ascendant,
}: {
  cx: number; cy: number; outerR: number; innerR: number; ascendant: number;
}) {
  const midR = (outerR + innerR) / 2;

  return (
    <g id="zodiac-ring">
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#534b7a" strokeWidth={1} />
      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#534b7a" strokeWidth={1} />

      {ZODIAC_SIGNS.map((sign, i) => {
        const startDeg = i * 30;
        const midDeg = startDeg + 15;

        // Sign divider line
        const lineStart = polarToCartesian(cx, cy, innerR, startDeg, ascendant);
        const lineEnd = polarToCartesian(cx, cy, outerR, startDeg, ascendant);

        // Symbol position
        const symbolPos = polarToCartesian(cx, cy, midR, midDeg, ascendant);

        return (
          <g key={sign}>
            <line
              x1={lineStart.x} y1={lineStart.y}
              x2={lineEnd.x} y2={lineEnd.y}
              stroke="#534b7a" strokeWidth={0.5}
            />
            <text
              x={symbolPos.x} y={symbolPos.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize={14} fill="#b8b0d4"
              fontFamily="serif"
            >
              {ZODIAC_SYMBOLS[sign]}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function HouseLines({
  cx, cy, innerR, houseR, houses, ascendant,
}: {
  cx: number; cy: number; innerR: number; houseR: number;
  houses: HouseCusp[]; ascendant: number;
}) {
  return (
    <g id="house-lines">
      {houses.map((house) => {
        const lineStart = polarToCartesian(cx, cy, houseR, house.longitude, ascendant);
        const lineEnd = polarToCartesian(cx, cy, innerR, house.longitude, ascendant);
        // Thicker lines for angular houses (1, 4, 7, 10)
        const isAngular = [1, 4, 7, 10].includes(house.house);

        return (
          <line
            key={house.house}
            x1={lineStart.x} y1={lineStart.y}
            x2={lineEnd.x} y2={lineEnd.y}
            stroke={isAngular ? "#e94560" : "#3d3660"}
            strokeWidth={isAngular ? 1.5 : 0.5}
          />
        );
      })}
    </g>
  );
}

function PlanetGlyphs({
  cx, cy, radius, planets, ascendant,
}: {
  cx: number; cy: number; radius: number;
  planets: PlanetPosition[]; ascendant: number;
}) {
  // Simple collision detection: spread overlapping planets
  const positions = resolveCollisions(planets, cx, cy, radius, ascendant);

  return (
    <g id="planet-glyphs">
      {positions.map(({ planet, x, y }) => (
        <g key={planet.planet}>
          <text
            x={x} y={y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={16} fill="#e8e0ff"
            fontFamily="serif"
          >
            {PLANET_SYMBOLS[planet.planet] || "?"}
          </text>
          {planet.retrograde && (
            <text
              x={x + 10} y={y - 6}
              fontSize={8} fill="#e94560"
            >
              R
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

function AspectLines({
  cx, cy, radius, aspects, planets, ascendant,
}: {
  cx: number; cy: number; radius: number;
  aspects: Aspect[]; planets: PlanetPosition[]; ascendant: number;
}) {
  const planetMap = new Map(planets.map((p) => [p.planet, p]));

  return (
    <g id="aspect-lines" opacity={0.4}>
      {aspects.map((aspect, i) => {
        const p1 = planetMap.get(aspect.planet1);
        const p2 = planetMap.get(aspect.planet2);
        if (!p1 || !p2) return null;

        const pos1 = polarToCartesian(cx, cy, radius, p1.longitude, ascendant);
        const pos2 = polarToCartesian(cx, cy, radius, p2.longitude, ascendant);

        return (
          <line
            key={`${aspect.planet1}-${aspect.planet2}-${i}`}
            x1={pos1.x} y1={pos1.y}
            x2={pos2.x} y2={pos2.y}
            stroke={ASPECT_COLORS[aspect.type] || "#666"}
            strokeWidth={0.8}
            strokeDasharray={aspect.type === "sextile" ? "4,4" : "none"}
          />
        );
      })}
    </g>
  );
}

// ─── Collision Detection ──────────────────────────────────────────

interface PositionedPlanet {
  planet: PlanetPosition;
  x: number;
  y: number;
}

function resolveCollisions(
  planets: PlanetPosition[],
  cx: number,
  cy: number,
  radius: number,
  ascendant: number,
  minDistance: number = 20
): PositionedPlanet[] {
  // Sort by longitude
  const sorted = [...planets].sort((a, b) => a.longitude - b.longitude);

  // Initial placement
  const positions = sorted.map((planet) => {
    const pos = polarToCartesian(cx, cy, radius, planet.longitude, ascendant);
    return { planet, x: pos.x, y: pos.y, adjustedLongitude: planet.longitude };
  });

  // Iterative collision resolution (spread overlapping glyphs)
  for (let iteration = 0; iteration < 10; iteration++) {
    let hasCollision = false;
    for (let i = 0; i < positions.length - 1; i++) {
      const a = positions[i];
      const b = positions[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDistance) {
        hasCollision = true;
        // Push apart by adjusting longitude offset
        const adjustment = 1.5; // degrees
        a.adjustedLongitude -= adjustment;
        b.adjustedLongitude += adjustment;
        const posA = polarToCartesian(cx, cy, radius, a.adjustedLongitude, ascendant);
        const posB = polarToCartesian(cx, cy, radius, b.adjustedLongitude, ascendant);
        a.x = posA.x;
        a.y = posA.y;
        b.x = posB.x;
        b.y = posB.y;
      }
    }
    if (!hasCollision) break;
  }

  return positions;
}

// ─── Main Component ───────────────────────────────────────────────

export function NatalWheel({
  planets,
  houses,
  aspects,
  ascendant,
  size = 800,
}: NatalWheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;  // Outer edge of zodiac ring
  const zodiacInnerR = size * 0.38; // Inner edge of zodiac ring
  const planetR = size * 0.32; // Planet glyph radius
  const houseR = size * 0.15;  // Inner house number area
  const aspectR = size * 0.28; // Aspect line endpoints

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-auto max-w-[800px]"
      role="img"
      aria-label="Natal astrology chart wheel"
    >
      {/* Background */}
      <circle cx={cx} cy={cy} r={outerR + 10} fill="#0f0f23" />

      {/* Chart layers, rendered back-to-front */}
      <AspectLines
        cx={cx} cy={cy} radius={aspectR}
        aspects={aspects} planets={planets} ascendant={ascendant}
      />
      <HouseLines
        cx={cx} cy={cy} innerR={houseR} houseR={zodiacInnerR}
        houses={houses} ascendant={ascendant}
      />
      <ZodiacRing
        cx={cx} cy={cy} outerR={outerR} innerR={zodiacInnerR}
        ascendant={ascendant}
      />
      <PlanetGlyphs
        cx={cx} cy={cy} radius={planetR}
        planets={planets} ascendant={ascendant}
      />
    </svg>
  );
}

export default NatalWheel;
