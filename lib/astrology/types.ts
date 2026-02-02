// ---------------------------------------------------------------------------
// Re-export all astrology types from the canonical type definitions.
// Consumers can import from "@/lib/astrology/types" or "@/types/astrology".
// ---------------------------------------------------------------------------

export type {
  PlanetPosition,
  HouseCusp,
  Aspect,
  AspectType,
  NatalChart,
  TransitEvent,
  ChartCalculationResult,
  ZodiacSign,
  Planet,
} from "@/types/astrology";

export {
  ZODIAC_SIGNS,
  PLANETS,
  ASPECT_CONFIG,
} from "@/types/astrology";
