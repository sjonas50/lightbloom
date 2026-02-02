import { calc_ut, julday, revjul, set_ephe_path, constants } from "sweph";

// ---------------------------------------------------------------------------
// Initialization -- use the built-in Moshier ephemeris (no external data files)
// Passing an empty string tells Swiss Ephemeris to fall back to its bundled
// analytical Moshier method which is accurate to ~1 arc-second.
// ---------------------------------------------------------------------------
set_ephe_path("");

// ---------------------------------------------------------------------------
// Planet body constants (Swiss Ephemeris IDs)
// ---------------------------------------------------------------------------
export const SE_SUN = constants.SE_SUN; // 0
export const SE_MOON = constants.SE_MOON; // 1
export const SE_MERCURY = constants.SE_MERCURY; // 2
export const SE_VENUS = constants.SE_VENUS; // 3
export const SE_MARS = constants.SE_MARS; // 4
export const SE_JUPITER = constants.SE_JUPITER; // 5
export const SE_SATURN = constants.SE_SATURN; // 6
export const SE_URANUS = constants.SE_URANUS; // 7
export const SE_NEPTUNE = constants.SE_NEPTUNE; // 8
export const SE_PLUTO = constants.SE_PLUTO; // 9
export const SE_TRUE_NODE = constants.SE_TRUE_NODE; // 11
export const SE_CHIRON = constants.SE_CHIRON; // 15

// ---------------------------------------------------------------------------
// Calculation flags
// SEFLG_SWIEPH (2)  -- use Swiss Ephemeris / Moshier
// SEFLG_SPEED  (256) -- include daily speed values in output
// Combined = 258
// ---------------------------------------------------------------------------
export const CALC_FLAGS =
  constants.SEFLG_SWIEPH | constants.SEFLG_SPEED; // 258

// Gregorian calendar flag for date conversion functions
export const SE_GREG_CAL = constants.SE_GREG_CAL; // 1

// ---------------------------------------------------------------------------
// calculatePlanetPosition
// ---------------------------------------------------------------------------
export interface PlanetCalcResult {
  longitude: number;
  latitude: number;
  speed: number;
}

/**
 * Calculate the ecliptic position of a celestial body for a given Julian Day
 * in Universal Time.
 *
 * @param julianDay  Julian Day number in UT
 * @param planet     Swiss Ephemeris body ID (use the SE_* constants)
 * @returns          Object with longitude, latitude, and daily speed in longitude
 */
export function calculatePlanetPosition(
  julianDay: number,
  planet: number
): PlanetCalcResult {
  const result = calc_ut(julianDay, planet, CALC_FLAGS);

  if (result.flag < 0) {
    throw new Error(
      `Swiss Ephemeris calc_ut failed for planet ${planet}: ${result.error}`
    );
  }

  // CalcData tuple: [lon, lat, dist, lonSpd, latSpd, distSpd]
  const [longitude, latitude, , speed] = result.data;

  return { longitude, latitude, speed };
}

// ---------------------------------------------------------------------------
// dateToJulianDay
// ---------------------------------------------------------------------------

/**
 * Convert a calendar date (Gregorian) to a Julian Day number.
 *
 * @param year   Full year (e.g. 2026)
 * @param month  Month 1-12
 * @param day    Day 1-31
 * @param hours  Decimal hours in UT (e.g. 14.5 for 14:30)
 * @returns      Julian Day number
 */
export function dateToJulianDay(
  year: number,
  month: number,
  day: number,
  hours: number
): number {
  return julday(year, month, day, hours, SE_GREG_CAL);
}

// ---------------------------------------------------------------------------
// julianDayToDate
// ---------------------------------------------------------------------------
export interface JulianDayDate {
  year: number;
  month: number;
  day: number;
  hour: number;
}

/**
 * Convert a Julian Day number back to a Gregorian calendar date.
 *
 * @param jd  Julian Day number
 * @returns   Object with year, month, day, hour (decimal hours)
 */
export function julianDayToDate(jd: number): JulianDayDate {
  const result = revjul(jd, SE_GREG_CAL);
  return {
    year: result.year,
    month: result.month,
    day: result.day,
    hour: result.hour,
  };
}
