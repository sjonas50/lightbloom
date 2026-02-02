/**
 * Reference Implementation: Swiss Ephemeris Wrapper
 *
 * This module wraps the `sweph` npm package to provide a clean TypeScript API
 * for calculating planetary positions, house cusps, and aspects.
 *
 * Key architectural decisions:
 * - Server-side only (sweph is a native C add-on)
 * - Singleton initialization pattern for sweph configuration
 * - All calculations return typed data structures
 * - Julian Day conversion handled internally
 *
 * NOTE: This is a reference implementation for architectural documentation.
 */

import sweph from "sweph";

// ─── Initialization ───────────────────────────────────────────────

let initialized = false;

function ensureInitialized(): void {
  if (!initialized) {
    // Use Moshier ephemeris (no external data files needed)
    // For higher precision, set path to Swiss Ephemeris data files
    sweph.set_ephe_path(null); // null = use Moshier interpolation
    initialized = true;
  }
}

// ─── Type Definitions ─────────────────────────────────────────────

export interface PlanetPosition {
  planet: string;
  longitude: number; // 0-360 ecliptic longitude
  latitude: number;
  distance: number; // AU
  speedLongitude: number;
  sign: string; // Zodiac sign name
  degree: number; // Degree within sign (0-30)
  minute: number; // Arc minute within degree
  retrograde: boolean;
}

export interface HouseCusp {
  house: number; // 1-12
  longitude: number;
  sign: string;
  degree: number;
}

export interface ChartPositions {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  ascendant: number;
  midheaven: number;
}

// ─── Constants ────────────────────────────────────────────────────

const PLANETS = [
  { id: sweph.constants.SE_SUN, name: "Sun" },
  { id: sweph.constants.SE_MOON, name: "Moon" },
  { id: sweph.constants.SE_MERCURY, name: "Mercury" },
  { id: sweph.constants.SE_VENUS, name: "Venus" },
  { id: sweph.constants.SE_MARS, name: "Mars" },
  { id: sweph.constants.SE_JUPITER, name: "Jupiter" },
  { id: sweph.constants.SE_SATURN, name: "Saturn" },
  { id: sweph.constants.SE_URANUS, name: "Uranus" },
  { id: sweph.constants.SE_NEPTUNE, name: "Neptune" },
  { id: sweph.constants.SE_PLUTO, name: "Pluto" },
  { id: sweph.constants.SE_TRUE_NODE, name: "North Node" },
];

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

// ─── Core Calculation Functions ───────────────────────────────────

/**
 * Convert a date/time to Julian Day Number.
 * This is the fundamental time unit for ephemeris calculations.
 */
export function dateToJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number, // Decimal hours in UT (e.g., 14.5 = 2:30 PM)
  minute: number
): number {
  ensureInitialized();
  const decimalHour = hour + minute / 60;
  const result = sweph.julday(
    year,
    month,
    day,
    decimalHour,
    sweph.constants.SE_GREG_CAL
  );
  return result;
}

/**
 * Calculate longitude for a zodiac sign name and degree within sign.
 */
function longitudeToSign(longitude: number): {
  sign: string;
  degree: number;
  minute: number;
} {
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: Math.floor(degreeInSign),
    minute: Math.floor((degreeInSign % 1) * 60),
  };
}

/**
 * Calculate all planet positions for a given Julian Day.
 */
export function calculatePlanets(julianDay: number): PlanetPosition[] {
  ensureInitialized();
  const flags =
    sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED;

  return PLANETS.map(({ id, name }) => {
    const result = sweph.calc_ut(julianDay, id, flags);

    // result.data = [longitude, latitude, distance, speedLong, speedLat, speedDist]
    const longitude = result.data[0];
    const latitude = result.data[1];
    const distance = result.data[2];
    const speedLongitude = result.data[3];

    const { sign, degree, minute } = longitudeToSign(longitude);

    return {
      planet: name,
      longitude,
      latitude,
      distance,
      speedLongitude,
      sign,
      degree,
      minute,
      retrograde: speedLongitude < 0,
    };
  });
}

/**
 * Calculate house cusps using the Placidus system.
 */
export function calculateHouses(
  julianDay: number,
  latitude: number,
  longitude: number,
  system: string = "P" // P = Placidus, W = Whole Sign, K = Koch
): { cusps: HouseCusp[]; ascendant: number; midheaven: number } {
  ensureInitialized();

  const result = sweph.houses_ex2(
    julianDay,
    sweph.constants.SEFLG_SWIEPH,
    latitude,
    longitude,
    system
  );

  // result.data.houses = array of 12 house cusp longitudes (index 1-12)
  // result.data.points = [ASC, MC, ARMC, Vertex, ...]
  const cusps: HouseCusp[] = [];
  for (let i = 1; i <= 12; i++) {
    const cuspLongitude = result.data.houses[i];
    const { sign, degree } = longitudeToSign(cuspLongitude);
    cusps.push({
      house: i,
      longitude: cuspLongitude,
      sign,
      degree,
    });
  }

  return {
    cusps,
    ascendant: result.data.points[0],
    midheaven: result.data.points[1],
  };
}

/**
 * Calculate a complete natal chart for given birth data.
 * This is the primary entry point used by the /api/calculate route.
 */
export function calculateNatalChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  latitude: number,
  longitude: number
): ChartPositions {
  const julianDay = dateToJulianDay(year, month, day, hour, minute);
  const planets = calculatePlanets(julianDay);
  const { cusps, ascendant, midheaven } = calculateHouses(
    julianDay,
    latitude,
    longitude
  );

  return {
    planets,
    houses: cusps,
    ascendant,
    midheaven,
  };
}
