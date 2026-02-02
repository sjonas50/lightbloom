import {
  calculatePlanetPosition,
  SE_SUN,
  SE_MOON,
  SE_MERCURY,
  SE_VENUS,
  SE_MARS,
  SE_JUPITER,
  SE_SATURN,
  SE_URANUS,
  SE_NEPTUNE,
  SE_PLUTO,
  SE_TRUE_NODE,
  SE_CHIRON,
} from "./sweph-wrapper";

// ---------------------------------------------------------------------------
// Mapping from Swiss Ephemeris body IDs to human-readable planet names.
// Order matches the PLANETS constant in @/types/astrology.
// ---------------------------------------------------------------------------
const PLANET_LIST: { id: number; name: string }[] = [
  { id: SE_SUN, name: "Sun" },
  { id: SE_MOON, name: "Moon" },
  { id: SE_MERCURY, name: "Mercury" },
  { id: SE_VENUS, name: "Venus" },
  { id: SE_MARS, name: "Mars" },
  { id: SE_JUPITER, name: "Jupiter" },
  { id: SE_SATURN, name: "Saturn" },
  { id: SE_URANUS, name: "Uranus" },
  { id: SE_NEPTUNE, name: "Neptune" },
  { id: SE_PLUTO, name: "Pluto" },
  { id: SE_TRUE_NODE, name: "North Node" },
  { id: SE_CHIRON, name: "Chiron" },
];

// ---------------------------------------------------------------------------
// Raw planet position result (before zodiac sign / house assignment)
// ---------------------------------------------------------------------------
export interface RawPlanetPosition {
  planet: string;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
}

// ---------------------------------------------------------------------------
// calculateAllPlanets
// ---------------------------------------------------------------------------

/**
 * Calculate ecliptic positions and speeds for all standard natal chart bodies
 * (Sun through Chiron, including the True North Node) at the given Julian Day.
 *
 * @param julianDay  Julian Day number in Universal Time
 * @returns          Array of planet positions with retrograde flag
 */
export function calculateAllPlanets(julianDay: number): RawPlanetPosition[] {
  const results: RawPlanetPosition[] = [];

  for (const { id, name } of PLANET_LIST) {
    try {
      const { longitude, latitude, speed } = calculatePlanetPosition(
        julianDay,
        id
      );
      results.push({
        planet: name,
        longitude,
        latitude,
        speed,
        retrograde: speed < 0,
      });

      // Derive South Node as the opposite point of North Node
      if (name === "North Node") {
        const southLong = ((longitude + 180) % 360 + 360) % 360;
        results.push({
          planet: "South Node",
          longitude: southLong,
          latitude: -latitude,
          speed,
          retrograde: speed < 0,
        });
      }
    } catch {
      // Skip bodies that require external ephemeris files (e.g. Chiron)
    }
  }

  return results;
}
