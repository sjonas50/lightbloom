import {
  dateToJulianDay,
  calculateAllPlanets,
  calculateHouses,
  calculateAspects,
} from "@/lib/ephemeris";
import { longitudeToSign, longitudeToHouse } from "./zodiac";
import type {
  NatalChart,
  PlanetPosition,
  HouseCusp,
} from "@/types/astrology";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse an ISO-style date string "YYYY-MM-DD" and optional time "HH:MM" into
 * a UTC Date, accounting for the given IANA timezone.
 *
 * Strategy: build a date-time string that JavaScript's Date constructor can
 * interpret in the target timezone, then extract the UTC components.
 */
function parseBirthDateTime(
  birthDate: string,
  birthTime: string | undefined,
  timezone: string
): { year: number; month: number; day: number; utcHours: number } {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hours, minutes] = birthTime ? birthTime.split(":").map(Number) : [12, 0];

  // Build a reference date in the target timezone, then derive the UTC offset.
  // We construct a Date from known UTC values, format it in the target TZ, and
  // compare to find the offset.
  const localDateStr = `${birthDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

  // Use Intl to determine the UTC offset for the target timezone at the given
  // local date/time.  We create a Date assuming UTC, format it in the target
  // TZ, then compare.
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

  // Now build the real UTC date by subtracting the offset from the intended local time
  const intendedLocal = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, 0)
  );
  const utcDate = new Date(intendedLocal.getTime() - offsetMs);

  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
    utcHours:
      utcDate.getUTCHours() +
      utcDate.getUTCMinutes() / 60 +
      utcDate.getUTCSeconds() / 3600,
  };
}

// ---------------------------------------------------------------------------
// calculateNatalChart
// ---------------------------------------------------------------------------

/**
 * Calculate a complete natal (birth) chart.
 *
 * @param birthDate    ISO date string "YYYY-MM-DD"
 * @param birthTime    Time string "HH:MM" or undefined for unknown birth time
 * @param latitude     Geographic latitude (north positive)
 * @param longitude    Geographic longitude (east positive)
 * @param timezone     IANA timezone string (e.g. "America/New_York")
 * @param houseSystem  House system identifier (default "placidus")
 * @returns            Complete NatalChart object
 */
export function calculateNatalChart(
  birthDate: string,
  birthTime: string | undefined,
  latitude: number,
  longitude: number,
  timezone: string,
  houseSystem: string = "placidus"
): NatalChart {
  // 1. Parse birth date/time into UTC components
  const { year, month, day, utcHours } = parseBirthDateTime(
    birthDate,
    birthTime,
    timezone
  );

  // 2. Convert to Julian Day
  const jd = dateToJulianDay(year, month, day, utcHours);

  // 3. Calculate all planet positions (raw: longitude, latitude, speed)
  const rawPlanets = calculateAllPlanets(jd);

  // 4. Calculate house cusps
  const houseResult = calculateHouses(jd, latitude, longitude, houseSystem);

  // 5. Enrich each planet with zodiac sign, degree/minute, and house placement
  //    Derive sign/degree/minute from the same rounded longitude that's stored
  //    to avoid display inconsistencies at precision boundaries.
  const planets: PlanetPosition[] = rawPlanets.map((rp) => {
    const roundedLng = Math.round(rp.longitude * 10000) / 10000;
    const zodiac = longitudeToSign(roundedLng);
    const house = longitudeToHouse(rp.longitude, houseResult.cusps);

    return {
      planet: rp.planet,
      longitude: roundedLng,
      latitude: Math.round(rp.latitude * 10000) / 10000,
      speed: Math.round(rp.speed * 10000) / 10000,
      sign: zodiac.sign,
      degree: zodiac.degree,
      minute: zodiac.minute,
      house,
      retrograde: rp.retrograde,
    };
  });

  // 6. Build house cusps with zodiac positions
  const houseCusps: HouseCusp[] = houseResult.cusps.map((cuspLon, idx) => {
    const zodiac = longitudeToSign(cuspLon);
    return {
      house: idx + 1,
      longitude: Math.round(cuspLon * 10000) / 10000,
      sign: zodiac.sign,
      degree: zodiac.degree,
    };
  });

  // 7. Calculate aspects between planets
  const aspects = calculateAspects(rawPlanets);

  return {
    planets,
    houses: houseCusps,
    aspects,
    ascendant: Math.round(houseResult.ascendant * 10000) / 10000,
    midheaven: Math.round(houseResult.midheaven * 10000) / 10000,
  };
}
