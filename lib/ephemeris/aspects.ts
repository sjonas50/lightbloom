import type { Aspect, AspectType } from "@/types/astrology";
import type { RawPlanetPosition } from "./planets";

// ---------------------------------------------------------------------------
// Aspect definitions: name, exact angle, and default orb
// ---------------------------------------------------------------------------
interface AspectDefinition {
  type: AspectType;
  angle: number;
  orb: number;
}

const ASPECT_DEFINITIONS: AspectDefinition[] = [
  // Major aspects (base orbs — adjusted per planet pair below)
  { type: "conjunction", angle: 0, orb: 8 },
  { type: "sextile", angle: 60, orb: 6 },
  { type: "square", angle: 90, orb: 7 },
  { type: "trine", angle: 120, orb: 8 },
  { type: "opposition", angle: 180, orb: 8 },
  // Minor aspects
  { type: "semi-sextile", angle: 30, orb: 2 },
  { type: "quincunx", angle: 150, orb: 2 },
];

// Planet categories for orb weighting
const LUMINARIES = new Set(["Sun", "Moon"]);
const OUTER_PLANETS = new Set(["Uranus", "Neptune", "Pluto"]);
const POINTS = new Set(["North Node", "South Node", "Chiron"]);

/**
 * Adjust aspect orb based on the two planets involved.
 * Luminaries (Sun/Moon) get wider orbs; outer-to-outer and points get tighter orbs.
 */
function effectiveOrb(baseOrb: number, planet1: string, planet2: string): number {
  if (LUMINARIES.has(planet1) || LUMINARIES.has(planet2)) {
    return baseOrb * 1.2; // 20% wider for luminary aspects
  }
  if (POINTS.has(planet1) || POINTS.has(planet2)) {
    return baseOrb * 0.6; // 40% tighter for points
  }
  if (OUTER_PLANETS.has(planet1) && OUTER_PLANETS.has(planet2)) {
    return baseOrb * 0.7; // 30% tighter for outer-outer aspects
  }
  return baseOrb;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalise an angle into the 0-360 range.
 */
function normalizeAngle(angle: number): number {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
}

/**
 * Return the shortest angular separation between two ecliptic longitudes.
 * Always returns a value between 0 and 180.
 */
function angularSeparation(lon1: number, lon2: number): number {
  const diff = Math.abs(normalizeAngle(lon1) - normalizeAngle(lon2));
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Determine whether an aspect is applying (tightening) or separating (loosening).
 *
 * We look at the relative speeds of the two bodies:
 *   - Compute the current separation and a separation a tiny step into the future.
 *   - If the future separation is smaller, the aspect is applying.
 *   - Otherwise it is separating.
 *
 * For a conjunction, "applying" means the two bodies are getting closer.
 * For an opposition or other aspect, "applying" means the actual angular
 * distance is approaching the exact aspect angle.
 */
function isApplying(
  lon1: number,
  speed1: number,
  lon2: number,
  speed2: number,
  exactAngle: number
): boolean {
  const currentDiff = Math.abs(angularSeparation(lon1, lon2) - exactAngle);
  // Project positions forward by a tiny amount (0.01 day ~ 14 minutes)
  const dt = 0.01;
  const futureDiff = Math.abs(
    angularSeparation(lon1 + speed1 * dt, lon2 + speed2 * dt) - exactAngle
  );
  return futureDiff < currentDiff;
}

// ---------------------------------------------------------------------------
// calculateAspects
// ---------------------------------------------------------------------------

/**
 * Detect aspects between all unique pairs of planets.
 *
 * @param planets  Array of planet positions (needs at minimum planet name,
 *                 longitude, and speed for each body).
 * @returns        Array of detected aspects sorted by tightest orb first.
 */
export function calculateAspects(planets: RawPlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const separation = angularSeparation(p1.longitude, p2.longitude);

      for (const def of ASPECT_DEFINITIONS) {
        const orb = Math.abs(separation - def.angle);
        const maxOrb = effectiveOrb(def.orb, p1.planet, p2.planet);

        if (orb <= maxOrb) {
          const applying = isApplying(
            p1.longitude,
            p1.speed,
            p2.longitude,
            p2.speed,
            def.angle
          );

          aspects.push({
            planet1: p1.planet,
            planet2: p2.planet,
            type: def.type,
            angle: Math.round(separation * 100) / 100,
            orb: Math.round(orb * 100) / 100,
            applying,
          });

          // A pair can only match one aspect definition so break on first hit
          break;
        }
      }
    }
  }

  // Sort tightest orb first
  aspects.sort((a, b) => a.orb - b.orb);

  return aspects;
}
