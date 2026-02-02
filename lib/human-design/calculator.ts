/**
 * Human Design Chart Calculator
 *
 * Orchestrates the full HD calculation pipeline:
 *   1. Parse birth date/time to Julian Day
 *   2. Calculate Personality planet positions at birth
 *   3. Find the Design date (~88 degrees of solar arc before birth)
 *   4. Calculate Design planet positions at the Design date
 *   5. Map all positions to gates/lines
 *   6. Derive channels, centers, type, authority, profile, definition, cross
 *   7. Return the complete HumanDesignChart
 */

import type {
  HumanDesignChart,
  GateActivation,
  HDChannel,
} from "@/types/human-design";
import {
  calculatePlanetPosition,
  dateToJulianDay,
  julianDayToDate,
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
} from "@/lib/ephemeris";
import { longitudeToGate } from "./gates";
import { getDefinedChannels } from "./channels";
import { getDefinedCenters, getDefinedCenterNames } from "./centers";
import { deriveType } from "./type-derivation";
import { deriveAuthority } from "./authority";
import { deriveProfile, deriveIncarnationCross, deriveDefinition } from "./profile";

// ---------------------------------------------------------------------------
// Planet configuration
// ---------------------------------------------------------------------------

/**
 * Planet identifiers used in Human Design.
 * Earth is derived as Sun + 180 degrees.
 * South Node is derived as North Node + 180 degrees.
 */
interface PlanetConfig {
  id: number;
  name: string;
}

const HD_PLANETS: readonly PlanetConfig[] = [
  { id: SE_SUN, name: "Sun" },
  { id: SE_MOON, name: "Moon" },
  { id: SE_TRUE_NODE, name: "North Node" },
  { id: SE_MERCURY, name: "Mercury" },
  { id: SE_VENUS, name: "Venus" },
  { id: SE_MARS, name: "Mars" },
  { id: SE_JUPITER, name: "Jupiter" },
  { id: SE_SATURN, name: "Saturn" },
  { id: SE_URANUS, name: "Uranus" },
  { id: SE_NEPTUNE, name: "Neptune" },
  { id: SE_PLUTO, name: "Pluto" },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize a longitude value to the 0-360 range. */
function normalizeLongitude(lng: number): number {
  return ((lng % 360) + 360) % 360;
}

/**
 * Calculate positions for all 13 HD bodies at a given Julian Day.
 *
 * The 13 bodies are:
 *   Sun, Earth (Sun+180), Moon, North Node, South Node (NNode+180),
 *   Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto.
 *
 * @param jd - Julian Day number.
 * @param isPersonality - Whether these are personality (true) or design (false) activations.
 * @returns Array of GateActivation objects.
 */
function calculateAllBodies(
  jd: number,
  isPersonality: boolean
): GateActivation[] {
  const activations: GateActivation[] = [];

  for (const planet of HD_PLANETS) {
    const pos = calculatePlanetPosition(jd, planet.id);
    const longitude = normalizeLongitude(pos.longitude);
    const { gate, line } = longitudeToGate(longitude);

    activations.push({
      gate,
      line,
      longitude,
      planet: planet.name,
      isPersonality,
    });

    // Derive Earth from Sun (opposite point)
    if (planet.name === "Sun") {
      const earthLong = normalizeLongitude(longitude + 180);
      const earthGL = longitudeToGate(earthLong);
      activations.push({
        gate: earthGL.gate,
        line: earthGL.line,
        longitude: earthLong,
        planet: "Earth",
        isPersonality,
      });
    }

    // Derive South Node from North Node (opposite point)
    if (planet.name === "North Node") {
      const southLong = normalizeLongitude(longitude + 180);
      const southGL = longitudeToGate(southLong);
      activations.push({
        gate: southGL.gate,
        line: southGL.line,
        longitude: southLong,
        planet: "South Node",
        isPersonality,
      });
    }
  }

  return activations;
}

/**
 * Finds the Design date by searching backward from the birth JD to find
 * the moment when the Sun was exactly 88 degrees earlier in the zodiac.
 *
 * Uses Newton-Raphson iteration on the Sun's position. The Sun moves
 * approximately 1 degree per day, so 88 degrees is roughly 88 days before
 * birth, which provides a good initial estimate.
 *
 * @param birthJD - Julian Day of birth.
 * @param personalitySunLong - Ecliptic longitude of the Sun at birth.
 * @returns Julian Day of the design date.
 */
function findDesignDate(birthJD: number, personalitySunLong: number): number {
  // Target longitude is 88 degrees before the personality Sun
  const targetLong = normalizeLongitude(personalitySunLong - 88);

  // Initial estimate: ~88 days before birth (Sun moves ~1 deg/day)
  let jd = birthJD - 88;

  // Newton-Raphson iteration
  for (let i = 0; i < 50; i++) {
    const sunPos = calculatePlanetPosition(jd, SE_SUN);
    let diff = targetLong - normalizeLongitude(sunPos.longitude);

    // Normalize the difference to the range [-180, 180]
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    // Converged to within 0.0001 degrees (~0.36 arcseconds)
    if (Math.abs(diff) < 0.0001) break;

    // Adjust JD using the Sun's speed (degrees per day)
    jd += diff / sunPos.speed;
  }

  return jd;
}

/**
 * Formats a Julian Day as an ISO date string (YYYY-MM-DDTHH:MM:SSZ).
 */
function formatDesignDate(jd: number): string {
  const { year, month, day, hour } = julianDayToDate(jd);

  const totalMinutes = Math.round((hour % 1) * 60);
  const h = Math.floor(hour);
  const m = totalMinutes % 60;
  const s = 0;

  const pad = (n: number) => String(n).padStart(2, "0");
  const padYear = (n: number) => String(n).padStart(4, "0");

  return `${padYear(year)}-${pad(month)}-${pad(day)}T${pad(h)}:${pad(m)}:${pad(s)}Z`;
}

// ---------------------------------------------------------------------------
// Main calculator
// ---------------------------------------------------------------------------

/**
 * Calculates a complete Human Design chart.
 *
 * @param birthDate - ISO date string, e.g. "1990-06-15".
 * @param birthTime - Time string "HH:MM", or undefined for unknown.
 * @param latitude - Birth location latitude.
 * @param longitude - Birth location longitude (not used in HD calculation
 *   but included for API consistency).
 * @param timezone - IANA timezone string, e.g. "America/New_York".
 * @returns Complete HumanDesignChart.
 */
export function calculateHumanDesign(
  birthDate: string,
  birthTime: string | undefined,
  latitude: number,
  longitude: number,
  timezone: string
): HumanDesignChart {
  // -----------------------------------------------------------------------
  // 1. Parse birth date/time to Julian Day
  // -----------------------------------------------------------------------
  const [yearStr, monthStr, dayStr] = birthDate.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  let hours = 12; // Default to noon if time is unknown
  if (birthTime) {
    const [hStr, mStr] = birthTime.split(":");
    hours = parseInt(hStr, 10) + parseInt(mStr, 10) / 60;
  }

  // Convert local time to UTC using Intl.DateTimeFormat to determine the
  // timezone offset at the given date/time. This is reliable across all
  // server/browser environments unlike toLocaleString-based approaches.
  const minutes = birthTime ? parseInt(birthTime.split(":")[1], 10) : 0;
  const localDateStr = `${birthDate}T${String(Math.floor(hours)).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

  const utcGuess = new Date(`${localDateStr}Z`);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(utcGuess);
  const get = (type: string): number => {
    const part = parts.find((p) => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };

  const tzYear = get("year");
  const tzMonth = get("month");
  const tzDay = get("day");
  const tzHour = get("hour") === 24 ? 0 : get("hour");
  const tzMinute = get("minute");

  // Reconstruct what the formatter thinks is the local time for our UTC guess
  const localFromUtc = new Date(
    Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, 0)
  );

  // The offset is the difference between the UTC guess and what local time it mapped to
  const offsetMs = localFromUtc.getTime() - utcGuess.getTime();

  // Build the real UTC date by subtracting the offset from the intended local time
  const intendedLocal = new Date(
    Date.UTC(year, month - 1, day, Math.floor(hours), minutes, 0)
  );
  const utcDate = new Date(intendedLocal.getTime() - offsetMs);

  const utcHours =
    utcDate.getUTCHours() +
    utcDate.getUTCMinutes() / 60 +
    utcDate.getUTCSeconds() / 3600;

  const birthJD = dateToJulianDay(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate(),
    utcHours
  );

  // -----------------------------------------------------------------------
  // 2. Calculate Personality planets at birth
  // -----------------------------------------------------------------------
  const personalityActivations = calculateAllBodies(birthJD, true);

  // Extract personality Sun data
  const personalitySun = personalityActivations.find(
    (a) => a.planet === "Sun"
  )!;
  const personalityEarth = personalityActivations.find(
    (a) => a.planet === "Earth"
  )!;

  // -----------------------------------------------------------------------
  // 3. Find Design date (Sun at personalitySunLong - 88 degrees)
  // -----------------------------------------------------------------------
  const designJD = findDesignDate(birthJD, personalitySun.longitude);

  // -----------------------------------------------------------------------
  // 4. Calculate Design planets at the design date
  // -----------------------------------------------------------------------
  const designActivations = calculateAllBodies(designJD, false);

  const designSun = designActivations.find((a) => a.planet === "Sun")!;
  const designEarth = designActivations.find((a) => a.planet === "Earth")!;

  // -----------------------------------------------------------------------
  // 5. Combine all activations and collect activated gates
  // -----------------------------------------------------------------------
  const allActivations = [...personalityActivations, ...designActivations];

  const activatedGates = new Set<number>();
  for (const activation of allActivations) {
    activatedGates.add(activation.gate);
  }

  // -----------------------------------------------------------------------
  // 6. Derive channels
  // -----------------------------------------------------------------------
  const channels: HDChannel[] = getDefinedChannels(activatedGates);

  // -----------------------------------------------------------------------
  // 7. Derive centers
  // -----------------------------------------------------------------------
  const centers = getDefinedCenters(channels);
  const definedCenterNames = getDefinedCenterNames(channels);

  // -----------------------------------------------------------------------
  // 8. Derive type
  // -----------------------------------------------------------------------
  const type = deriveType(definedCenterNames, channels);

  // -----------------------------------------------------------------------
  // 9. Derive authority
  // -----------------------------------------------------------------------
  const authority = deriveAuthority(definedCenterNames, type, channels);

  // -----------------------------------------------------------------------
  // 10. Derive profile
  // -----------------------------------------------------------------------
  const profile = deriveProfile(personalitySun.line, designSun.line);

  // -----------------------------------------------------------------------
  // 11. Derive definition
  // -----------------------------------------------------------------------
  const definition = deriveDefinition(definedCenterNames, channels);

  // -----------------------------------------------------------------------
  // 12. Derive incarnation cross
  // -----------------------------------------------------------------------
  const incarnationCross = deriveIncarnationCross(
    personalitySun.gate,
    personalityEarth.gate,
    designSun.gate,
    designEarth.gate,
    profile
  );

  // -----------------------------------------------------------------------
  // 13. Format design date
  // -----------------------------------------------------------------------
  const designDate = formatDesignDate(designJD);

  // -----------------------------------------------------------------------
  // 14. Return the complete chart
  // -----------------------------------------------------------------------
  return {
    type,
    authority,
    profile,
    definition,
    incarnationCross,
    centers,
    channels,
    gates: allActivations,
    designDate,
  };
}
