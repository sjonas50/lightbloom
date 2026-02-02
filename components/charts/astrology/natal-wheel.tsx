"use client";

import { NatalChart, ZODIAC_SIGNS, ASPECT_CONFIG } from "@/types/astrology";
import { ZODIAC_GLYPHS, PLANET_GLYPHS, ZODIAC_COLORS, ASPECT_COLORS } from "./glyphs";

interface NatalWheelProps {
  chart: NatalChart;
}

const CX = 400;
const CY = 400;
const OUTER_R = 380;
const ZODIAC_INNER_R = 350;
const HOUSE_OUTER_R = 350;
const HOUSE_INNER_R = 250;
const PLANET_R = 300;
const PLANET_OUTER_R = 340;
const ASPECT_R = 240;

const ROMAN_NUMERALS = [
  "I", "II", "III", "IV", "V", "VI",
  "VII", "VIII", "IX", "X", "XI", "XII",
];

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Convert an ecliptic longitude to the wheel angle, in degrees.
 * - The Ascendant sits at the 9-o-clock position (180 degrees in standard math coords).
 * - Ecliptic degrees increase counter-clockwise on the wheel.
 * The returned angle is in standard math convention (0 = right, CCW positive).
 */
function eclipticToAngle(longitude: number, ascendant: number): number {
  return 180 + (ascendant - longitude);
}

function posOnCircle(
  angleDeg: number,
  radius: number
): { x: number; y: number } {
  const rad = degToRad(angleDeg);
  return {
    x: CX + radius * Math.cos(rad),
    y: CY - radius * Math.sin(rad),
  };
}

/**
 * Build an SVG arc path for a segment of the zodiac ring.
 * startAngle and endAngle are in standard math degrees (CCW).
 */
function arcPath(
  startAngle: number,
  endAngle: number,
  outerR: number,
  innerR: number
): string {
  const s1 = posOnCircle(startAngle, outerR);
  const e1 = posOnCircle(endAngle, outerR);
  const s2 = posOnCircle(endAngle, innerR);
  const e2 = posOnCircle(startAngle, innerR);

  // We always draw 30-degree arcs (< 180), so largeArcFlag = 0
  // Sweep direction: we go CCW on outer, CW on inner
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${outerR} ${outerR} 0 0 0 ${e1.x} ${e1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${innerR} ${innerR} 0 0 1 ${e2.x} ${e2.y}`,
    "Z",
  ].join(" ");
}

export default function NatalWheel({ chart }: NatalWheelProps) {
  const { planets, houses, aspects, ascendant } = chart;

  // Pre-compute planet wheel positions with collision avoidance
  const planetPositions = computePlanetPositions(planets, ascendant);

  return (
    <svg
      viewBox="0 0 800 800"
      className="w-full h-full max-w-[800px] max-h-[800px]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Glow filter for aspect lines */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Subtle shadow for text readability */}
        <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#000" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx={CX} cy={CY} r={OUTER_R + 10} fill="#0c0a1a" />
      <circle cx={CX} cy={CY} r={OUTER_R + 10} fill="none" stroke="#2d2b55" strokeWidth="1" />

      {/* Zodiac ring - 12 colored arcs */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const signStartLong = i * 30;
        const signEndLong = (i + 1) * 30;
        const startAngle = eclipticToAngle(signStartLong, ascendant);
        const endAngle = eclipticToAngle(signEndLong, ascendant);
        const midAngle = (startAngle + endAngle) / 2;
        const color = ZODIAC_COLORS[sign] ?? "#888";
        const glyph = ZODIAC_GLYPHS[sign] ?? "?";
        const labelPos = posOnCircle(midAngle, (OUTER_R + ZODIAC_INNER_R) / 2);

        return (
          <g key={sign}>
            <path
              d={arcPath(startAngle, endAngle, OUTER_R, ZODIAC_INNER_R)}
              fill={color}
              fillOpacity={0.15}
              stroke={color}
              strokeWidth={0.5}
              strokeOpacity={0.4}
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={color}
              fontSize="16"
              fontFamily="serif"
              filter="url(#textShadow)"
            >
              {glyph}
            </text>
          </g>
        );
      })}

      {/* Degree tick marks every 5 degrees on the zodiac ring */}
      {Array.from({ length: 72 }, (_, i) => {
        const longitude = i * 5;
        const angle = eclipticToAngle(longitude, ascendant);
        const isMajor = longitude % 30 === 0;
        const tickInner = isMajor ? ZODIAC_INNER_R - 5 : ZODIAC_INNER_R;
        const tickOuter = isMajor ? OUTER_R : OUTER_R - 4;
        const p1 = posOnCircle(angle, tickInner);
        const p2 = posOnCircle(angle, tickOuter);
        return (
          <line
            key={`tick-${i}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={isMajor ? "#9ca3af" : "#4b5563"}
            strokeWidth={isMajor ? 1.5 : 0.5}
          />
        );
      })}

      {/* Inner house circle */}
      <circle
        cx={CX}
        cy={CY}
        r={HOUSE_INNER_R}
        fill="#0c0a1a"
        fillOpacity={0.6}
        stroke="#2d2b55"
        strokeWidth={0.5}
      />

      {/* House cusp lines */}
      {houses.map((cusp, i) => {
        const angle = eclipticToAngle(cusp.longitude, ascendant);
        const inner = posOnCircle(angle, 0);
        const outer = posOnCircle(angle, HOUSE_OUTER_R);
        const isAngular = i === 0 || i === 3 || i === 6 || i === 9;
        return (
          <line
            key={`cusp-${cusp.house}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={isAngular ? "#8b5cf6" : "#374151"}
            strokeWidth={isAngular ? 1.5 : 0.75}
            strokeOpacity={isAngular ? 0.9 : 0.5}
          />
        );
      })}

      {/* House number labels (Roman numerals) */}
      {houses.map((cusp, i) => {
        const nextCusp = houses[(i + 1) % 12];
        let midLong = (cusp.longitude + nextCusp.longitude) / 2;
        // Handle wrapping past 360
        if (nextCusp.longitude < cusp.longitude) {
          midLong = ((cusp.longitude + nextCusp.longitude + 360) / 2) % 360;
        }
        const angle = eclipticToAngle(midLong, ascendant);
        const pos = posOnCircle(angle, (HOUSE_INNER_R + HOUSE_OUTER_R) / 2);
        return (
          <text
            key={`house-label-${cusp.house}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#6b7280"
            fontSize="10"
            fontFamily="serif"
          >
            {ROMAN_NUMERALS[i]}
          </text>
        );
      })}

      {/* Aspect lines between planets */}
      {aspects.map((aspect, i) => {
        const p1 = planetPositions.find((p) => p.planet === aspect.planet1);
        const p2 = planetPositions.find((p) => p.planet === aspect.planet2);
        if (!p1 || !p2) return null;

        const pos1 = posOnCircle(p1.angle, ASPECT_R);
        const pos2 = posOnCircle(p2.angle, ASPECT_R);
        const color = ASPECT_COLORS[aspect.type] ?? "#555";
        // Tighter orb = stronger aspect = more opaque
        const config = ASPECT_CONFIG[aspect.type];
        const maxOrb = config?.orb ?? 8;
        const opacity = Math.max(0.2, 1 - aspect.orb / maxOrb);

        return (
          <line
            key={`aspect-${i}`}
            x1={pos1.x}
            y1={pos1.y}
            x2={pos2.x}
            y2={pos2.y}
            stroke={color}
            strokeWidth={aspect.type === "conjunction" || aspect.type === "opposition" ? 1.5 : 1}
            strokeOpacity={opacity}
            strokeDasharray={
              aspect.type === "semi-sextile" || aspect.type === "quincunx"
                ? "4 3"
                : undefined
            }
            filter="url(#glow)"
          />
        );
      })}

      {/* Planet symbols positioned on the wheel */}
      {planetPositions.map((pp) => {
        const pos = posOnCircle(pp.angle, pp.radius);
        const glyph = PLANET_GLYPHS[pp.planet] ?? "?";
        const planetData = planets.find((p) => p.planet === pp.planet);
        const isRetrograde = planetData?.retrograde ?? false;

        // Draw a tiny line from exact zodiac position to planet symbol position
        // when the planet has been displaced for collision avoidance
        const exactPos = posOnCircle(pp.angle, ZODIAC_INNER_R);
        const dotPos = posOnCircle(pp.angle, pp.radius + 15);

        return (
          <g key={pp.planet}>
            {/* Connecting line from zodiac ring to planet */}
            <line
              x1={exactPos.x}
              y1={exactPos.y}
              x2={dotPos.x}
              y2={dotPos.y}
              stroke="#4b5563"
              strokeWidth={0.5}
              strokeOpacity={0.5}
            />
            {/* Small dot on zodiac ring at exact position */}
            <circle
              cx={exactPos.x}
              cy={exactPos.y}
              r={2}
              fill="#e2e8f0"
              fillOpacity={0.7}
            />
            {/* Planet glyph */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#e2e8f0"
              fontSize="14"
              fontWeight="bold"
              filter="url(#textShadow)"
            >
              {glyph}
            </text>
            {/* Retrograde indicator */}
            {isRetrograde && (
              <text
                x={pos.x + 10}
                y={pos.y - 6}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#f87171"
                fontSize="8"
                fontFamily="serif"
              >
                R
              </text>
            )}
            {/* Degree label */}
            <text
              x={pos.x}
              y={pos.y + 14}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#9ca3af"
              fontSize="7"
              fontFamily="monospace"
            >
              {planetData
                ? `${planetData.degree}\u00B0${String(planetData.minute).padStart(2, "0")}'`
                : ""}
            </text>
          </g>
        );
      })}

      {/* ASC label */}
      {(() => {
        const ascAngle = eclipticToAngle(ascendant, ascendant); // should be 180
        const pos = posOnCircle(ascAngle, OUTER_R + 20);
        return (
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#c084fc"
            fontSize="13"
            fontWeight="bold"
            filter="url(#textShadow)"
          >
            ASC
          </text>
        );
      })()}

      {/* MC label */}
      {(() => {
        const mcAngle = eclipticToAngle(chart.midheaven, ascendant);
        const pos = posOnCircle(mcAngle, OUTER_R + 20);
        return (
          <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#c084fc"
            fontSize="13"
            fontWeight="bold"
            filter="url(#textShadow)"
          >
            MC
          </text>
        );
      })()}
    </svg>
  );
}

/**
 * Compute display positions for planets with collision avoidance.
 * Planets within 8 degrees of each other get offset radially.
 */
interface PlanetDisplayPos {
  planet: string;
  longitude: number;
  angle: number;
  radius: number;
}

function computePlanetPositions(
  planets: NatalChart["planets"],
  ascendant: number
): PlanetDisplayPos[] {
  const COLLISION_THRESHOLD = 8; // degrees
  const OFFSET_STEP = 22; // radial px offset per collision layer

  // Create initial positions sorted by longitude
  const positions: PlanetDisplayPos[] = planets.map((p) => ({
    planet: p.planet,
    longitude: p.longitude,
    angle: eclipticToAngle(p.longitude, ascendant),
    radius: PLANET_R,
  }));

  // Sort by longitude so neighbors are adjacent
  positions.sort((a, b) => a.longitude - b.longitude);

  // Check each pair and offset if too close
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const diff = Math.abs(positions[i].longitude - positions[j].longitude);
      const angularDist = Math.min(diff, 360 - diff);

      if (angularDist < COLLISION_THRESHOLD) {
        // Offset the second planet inward
        const currentOffset = positions[j].radius - PLANET_R;
        const layersUsed = Math.round(currentOffset / OFFSET_STEP);
        positions[j].radius = PLANET_R - OFFSET_STEP * (layersUsed + 1);
      }
    }
  }

  return positions;
}
