import { houses } from "sweph";

// ---------------------------------------------------------------------------
// House system codes accepted by Swiss Ephemeris
// ---------------------------------------------------------------------------
const HOUSE_SYSTEM_CODES: Record<string, string> = {
  placidus: "P",
  whole_sign: "W",
  koch: "K",
  equal: "E",
  P: "P",
  W: "W",
  K: "K",
  E: "E",
};

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------
export interface HouseCalcResult {
  /** Ecliptic longitudes for house cusps 1-12 */
  cusps: number[];
  /** Ascendant longitude */
  ascendant: number;
  /** Midheaven (MC) longitude */
  midheaven: number;
}

// ---------------------------------------------------------------------------
// calculateHouses
// ---------------------------------------------------------------------------

/**
 * Calculate house cusps and angles for a given moment and location.
 *
 * @param julianDay  Julian Day in Universal Time
 * @param latitude   Geographic latitude of the birth location (degrees, north positive)
 * @param longitude  Geographic longitude of the birth location (degrees, east positive)
 * @param system     House system identifier -- one of "placidus", "whole_sign",
 *                   "koch", "equal", or the single-letter Swiss Ephemeris codes
 *                   "P", "W", "K", "E".  Defaults to Placidus ("P").
 * @returns          Object containing cusps array, ascendant, and midheaven
 */
export function calculateHouses(
  julianDay: number,
  latitude: number,
  longitude: number,
  system: string = "placidus"
): HouseCalcResult {
  const hsys = HOUSE_SYSTEM_CODES[system] ?? "P";

  const result = houses(julianDay, latitude, longitude, hsys);

  if (result.flag < 0) {
    throw new Error(
      `Swiss Ephemeris house calculation failed (system=${hsys})`
    );
  }

  // result.data.houses is a 12-element tuple (HousesList)
  const cusps: number[] = Array.from(result.data.houses);

  // result.data.points is a tuple: [asc, mc, armc, vertex, equasc, coasc1, coasc2, polasc]
  const ascendant = result.data.points[0]; // ASC
  const midheaven = result.data.points[1]; // MC

  return { cusps, ascendant, midheaven };
}
