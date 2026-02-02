import { ZODIAC_SIGNS } from "@/types/astrology";

// ---------------------------------------------------------------------------
// longitudeToSign
// ---------------------------------------------------------------------------
export interface ZodiacPosition {
  /** Zodiac sign name (Aries, Taurus, etc.) */
  sign: string;
  /** Whole degrees within the sign (0-29) */
  degree: number;
  /** Arc-minutes within the degree (0-59) */
  minute: number;
}

/**
 * Convert an ecliptic longitude (0-360) to a zodiac sign, degree and minute.
 *
 * @param longitude  Ecliptic longitude in decimal degrees
 * @returns          Object with sign name, degree (0-29), and minute (0-59)
 */
export function longitudeToSign(longitude: number): ZodiacPosition {
  // Normalise to 0-360
  let lng = longitude % 360;
  if (lng < 0) lng += 360;

  const signIndex = Math.floor(lng / 30);
  const posInSign = lng - signIndex * 30;
  const degree = Math.floor(posInSign);
  const minute = Math.floor((posInSign - degree) * 60);

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree,
    minute,
  };
}

// ---------------------------------------------------------------------------
// longitudeToHouse
// ---------------------------------------------------------------------------

/**
 * Determine which house (1-12) a given ecliptic longitude falls in based on
 * the provided house cusp longitudes.
 *
 * House cusps are expected as 12 ecliptic longitudes (indices 0-11) where
 * index 0 is the 1st house cusp, index 1 is the 2nd house cusp, etc.
 *
 * A planet is in house N when its longitude falls between cusp N and cusp N+1
 * (wrapping around at 360 degrees).
 *
 * @param longitude   Ecliptic longitude of the body (degrees)
 * @param houseCusps  Array of 12 house cusp longitudes
 * @returns           House number 1-12
 */
export function longitudeToHouse(
  longitude: number,
  houseCusps: number[]
): number {
  // Normalise the target longitude
  let lng = longitude % 360;
  if (lng < 0) lng += 360;

  for (let i = 0; i < 12; i++) {
    const cuspStart = houseCusps[i] % 360;
    const cuspEnd = houseCusps[(i + 1) % 12] % 360;

    if (cuspEnd > cuspStart) {
      // Normal case -- cusp range does not wrap around 0 Aries
      if (lng >= cuspStart && lng < cuspEnd) {
        return i + 1;
      }
    } else {
      // Wrap-around case -- the range crosses 0 degrees
      if (lng >= cuspStart || lng < cuspEnd) {
        return i + 1;
      }
    }
  }

  // Fallback: return 1 (should not be reached with valid cusps)
  return 1;
}
