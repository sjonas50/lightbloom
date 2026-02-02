export interface PlanetPosition {
  planet: string;
  longitude: number;
  latitude: number;
  speed: number;
  sign: string;
  degree: number;
  minute: number;
  house: number;
  retrograde: boolean;
}

export interface HouseCusp {
  house: number;
  longitude: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  angle: number;
  orb: number;
  applying: boolean;
}

export type AspectType =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition"
  | "semi-sextile"
  | "quincunx";

export interface NatalChart {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  ascendant: number;
  midheaven: number;
}

export interface TransitEvent {
  date: string;
  transitPlanet: string;
  natalPlanet: string;
  aspectType: AspectType;
  transitLongitude: number;
  natalLongitude: number;
  orb: number;
  description: string;
}

export interface ChartCalculationResult {
  natal: NatalChart;
  transits2026: TransitEvent[];
}

export const ZODIAC_SIGNS = [
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
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "North Node",
  "South Node",
  "Chiron",
] as const;

export type Planet = (typeof PLANETS)[number];

export const ASPECT_CONFIG: Record<
  AspectType,
  { angle: number; orb: number; color: string }
> = {
  conjunction: { angle: 0, orb: 8, color: "#22d3ee" },
  sextile: { angle: 60, orb: 6, color: "#4ade80" },
  square: { angle: 90, orb: 7, color: "#f87171" },
  trine: { angle: 120, orb: 8, color: "#60a5fa" },
  opposition: { angle: 180, orb: 8, color: "#f87171" },
  "semi-sextile": { angle: 30, orb: 2, color: "#a78bfa" },
  quincunx: { angle: 150, orb: 2, color: "#a78bfa" },
};
