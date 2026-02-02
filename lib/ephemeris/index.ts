// ---------------------------------------------------------------------------
// lib/ephemeris/index.ts -- public API for the ephemeris calculation layer
// ---------------------------------------------------------------------------

export {
  calculatePlanetPosition,
  dateToJulianDay,
  julianDayToDate,
  CALC_FLAGS,
  SE_GREG_CAL,
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

export type { PlanetCalcResult, JulianDayDate } from "./sweph-wrapper";

export { calculateAllPlanets } from "./planets";
export type { RawPlanetPosition } from "./planets";

export { calculateHouses } from "./houses";
export type { HouseCalcResult } from "./houses";

export { calculateAspects } from "./aspects";
