import {
  dateToJulianDay,
  julianDayToDate,
  calculatePlanetPosition,
  SE_MARS,
  SE_JUPITER,
  SE_SATURN,
  SE_URANUS,
  SE_NEPTUNE,
  SE_PLUTO,
} from "@/lib/ephemeris";
import type { NatalChart, TransitEvent, AspectType } from "@/types/astrology";

// ---------------------------------------------------------------------------
// Transit planets — includes Mars for personal transits
// ---------------------------------------------------------------------------
const TRANSIT_PLANETS: { id: number; name: string }[] = [
  { id: SE_MARS, name: "Mars" },
  { id: SE_JUPITER, name: "Jupiter" },
  { id: SE_SATURN, name: "Saturn" },
  { id: SE_URANUS, name: "Uranus" },
  { id: SE_NEPTUNE, name: "Neptune" },
  { id: SE_PLUTO, name: "Pluto" },
];

// ---------------------------------------------------------------------------
// Transit aspect definitions — tighter orbs than natal
// ---------------------------------------------------------------------------
interface TransitAspectDef {
  type: AspectType;
  angle: number;
  orb: number;
}

const TRANSIT_ASPECTS: TransitAspectDef[] = [
  { type: "conjunction", angle: 0, orb: 3 },
  { type: "opposition", angle: 180, orb: 3 },
  { type: "square", angle: 90, orb: 3 },
  { type: "trine", angle: 120, orb: 3 },
  { type: "sextile", angle: 60, orb: 2.5 },
  { type: "quincunx", angle: 150, orb: 1.5 },
];

// ---------------------------------------------------------------------------
// Major 2026 astrological events (contextual)
// ---------------------------------------------------------------------------
const MAJOR_2026_EVENTS: { date: string; description: string }[] = [
  { date: "2026-01-26", description: "Neptune enters Aries" },
  { date: "2026-02-13", description: "Saturn enters Aries" },
  { date: "2026-02-17", description: "Solar Eclipse at 28\u00b049' Aquarius" },
  { date: "2026-02-20", description: "Saturn conjunct Neptune at 0\u00b045' Aries" },
  { date: "2026-02-26", description: "Mercury retrograde begins in Pisces (through Mar 20)" },
  { date: "2026-03-03", description: "Lunar Eclipse at 12\u00b054' Virgo" },
  { date: "2026-04-25", description: "Uranus enters Gemini" },
  { date: "2026-06-29", description: "Mercury retrograde begins in Cancer (through Jul 23)" },
  { date: "2026-06-30", description: "Jupiter enters Leo" },
  { date: "2026-08-12", description: "Solar Eclipse at 20\u00b002' Leo" },
  { date: "2026-08-28", description: "Lunar Eclipse at 4\u00b054' Pisces" },
  { date: "2026-10-03", description: "Venus retrograde begins in Scorpio (through Nov 13)" },
  { date: "2026-10-24", description: "Mercury retrograde begins in Scorpio (through Nov 13)" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeAngle(a: number): number {
  return ((a % 360) + 360) % 360;
}

function angularSeparation(lon1: number, lon2: number): number {
  const diff = Math.abs(normalizeAngle(lon1) - normalizeAngle(lon2));
  return diff > 180 ? 360 - diff : diff;
}

function jdToDateStr(jd: number): string {
  const { year, month, day } = julianDayToDate(jd);
  return `${year}-${String(month).padStart(2, "0")}-${String(Math.floor(day)).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Find exact transit date via binary search refinement
//
// Given a JD range where we know the transit is within orb,
// narrow down to the day with minimum orb (closest to exact aspect).
// ---------------------------------------------------------------------------
function refineTransitDate(
  planetId: number,
  natalLongitude: number,
  aspectAngle: number,
  jdStart: number,
  jdEnd: number,
): { jd: number; orb: number; transitLon: number } {
  // Phase 1: daily scan within the range to find the day with minimum orb
  let bestJd = jdStart;
  let bestOrb = Infinity;
  let bestLon = 0;

  const step = 1; // 1 day
  for (let jd = jdStart; jd <= jdEnd; jd += step) {
    const { longitude } = calculatePlanetPosition(jd, planetId);
    const sep = angularSeparation(longitude, natalLongitude);
    const orb = Math.abs(sep - aspectAngle);
    if (orb < bestOrb) {
      bestOrb = orb;
      bestJd = jd;
      bestLon = longitude;
    }
  }

  // Phase 2: refine to within ~0.1 day by scanning around the best day
  const fineStart = bestJd - 1;
  const fineEnd = bestJd + 1;
  const fineStep = 0.1;
  for (let jd = fineStart; jd <= fineEnd; jd += fineStep) {
    const { longitude } = calculatePlanetPosition(jd, planetId);
    const sep = angularSeparation(longitude, natalLongitude);
    const orb = Math.abs(sep - aspectAngle);
    if (orb < bestOrb) {
      bestOrb = orb;
      bestJd = jd;
      bestLon = longitude;
    }
  }

  return { jd: bestJd, orb: bestOrb, transitLon: bestLon };
}

// ---------------------------------------------------------------------------
// calculate2026Transits
// ---------------------------------------------------------------------------
export function calculate2026Transits(natalChart: NatalChart): TransitEvent[] {
  const events: TransitEvent[] = [];

  // JD range for 2026
  const jdStart = dateToJulianDay(2026, 1, 1, 0);
  const jdEnd = dateToJulianDay(2026, 12, 31, 0);

  // Coarse scan: every 5 days for outer planets, every 3 days for Mars
  for (const tp of TRANSIT_PLANETS) {
    const scanStep = tp.name === "Mars" ? 3 : 5;

    // Track active transit windows to detect multiple passes
    // Key: "natalPlanet-aspectType", Value: { inOrb: boolean, lastJdInOrb }
    const activeWindows = new Map<string, { entering: number; bestOrb: number; bestJd: number }>();

    for (let jd = jdStart; jd <= jdEnd + scanStep; jd += scanStep) {
      const actualJd = Math.min(jd, jdEnd);
      let transitLon: number;

      try {
        transitLon = calculatePlanetPosition(actualJd, tp.id).longitude;
      } catch {
        continue;
      }

      for (const np of natalChart.planets) {
        const separation = angularSeparation(transitLon, np.longitude);

        for (const aspect of TRANSIT_ASPECTS) {
          const orb = Math.abs(separation - aspect.angle);
          const key = `${np.planet}-${aspect.type}`;

          if (orb <= aspect.orb) {
            // Inside orb window
            const existing = activeWindows.get(key);
            if (!existing) {
              // Entering a new transit window
              activeWindows.set(key, {
                entering: Math.max(jdStart, actualJd - scanStep),
                bestOrb: orb,
                bestJd: actualJd,
              });
            } else if (orb < existing.bestOrb) {
              existing.bestOrb = orb;
              existing.bestJd = actualJd;
            }
          } else {
            // Outside orb — if we were tracking a window, finalize it
            const existing = activeWindows.get(key);
            if (existing) {
              // Refine to exact date
              const searchStart = Math.max(jdStart, existing.entering);
              const searchEnd = Math.min(jdEnd, actualJd);
              const refined = refineTransitDate(
                tp.id,
                np.longitude,
                aspect.angle,
                searchStart,
                searchEnd,
              );

              events.push({
                date: jdToDateStr(refined.jd),
                transitPlanet: tp.name,
                natalPlanet: np.planet,
                aspectType: aspect.type,
                transitLongitude: Math.round(refined.transitLon * 10000) / 10000,
                natalLongitude: np.longitude,
                orb: Math.round(refined.orb * 100) / 100,
                description: `Transit ${tp.name} ${aspect.type} natal ${np.planet} (orb ${refined.orb.toFixed(2)}\u00b0)`,
              });

              activeWindows.delete(key);
            }
          }

          // Only one aspect per planet pair per sample
          if (orb <= aspect.orb) break;
        }
      }
    }

    // Flush any still-open windows at end of year
    for (const [key, window] of activeWindows.entries()) {
      const [natalPlanet, aspectType] = key.split("-") as [string, AspectType];
      const refined = refineTransitDate(
        tp.id,
        natalChart.planets.find((p) => p.planet === natalPlanet)!.longitude,
        TRANSIT_ASPECTS.find((a) => a.type === aspectType)!.angle,
        window.entering,
        jdEnd,
      );

      events.push({
        date: jdToDateStr(refined.jd),
        transitPlanet: tp.name,
        natalPlanet: natalPlanet,
        aspectType: aspectType,
        transitLongitude: Math.round(refined.transitLon * 10000) / 10000,
        natalLongitude: natalChart.planets.find((p) => p.planet === natalPlanet)!.longitude,
        orb: Math.round(refined.orb * 100) / 100,
        description: `Transit ${tp.name} ${aspectType} natal ${natalPlanet} (orb ${refined.orb.toFixed(2)}\u00b0)`,
      });
    }
  }

  // Append major 2026 events
  for (const evt of MAJOR_2026_EVENTS) {
    events.push({
      date: evt.date,
      transitPlanet: "Event",
      natalPlanet: "Event",
      aspectType: "conjunction",
      transitLongitude: 0,
      natalLongitude: 0,
      orb: 0,
      description: evt.description,
    });
  }

  // Sort chronologically
  events.sort((a, b) => a.date.localeCompare(b.date));

  return events;
}
