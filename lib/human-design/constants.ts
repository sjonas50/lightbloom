/**
 * Human Design System Constants
 *
 * Contains all static data for the Human Design calculation engine:
 * gate ordering on the mandala, center-gate mappings, channel definitions,
 * profile names, and incarnation cross names.
 */

// ---------------------------------------------------------------------------
// A) Gate order around the mandala, starting from 0 degrees adjusted
//    (physical 358.25 degrees, i.e. 28d15' Pisces).
//    Index 0 = the first gate after MANDALA_START_DEGREE.
// ---------------------------------------------------------------------------
export const MANDALA_GATE_ORDER: readonly number[] = [
  25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39,
  53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19, 13,
  49, 30, 55, 37, 63, 22, 36,
] as const;

// ---------------------------------------------------------------------------
// B) The mandala's 0-point in ecliptic longitude (28 deg 15 min Pisces).
// ---------------------------------------------------------------------------
export const MANDALA_START_DEGREE = 358.25;

// ---------------------------------------------------------------------------
// C) Center -> Gates mapping for all 9 centers.
// ---------------------------------------------------------------------------
export const CENTER_GATES: Record<string, readonly number[]> = {
  head: [64, 61, 63],
  ajna: [47, 24, 4, 17, 43, 11],
  throat: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
  g: [7, 1, 13, 25, 46, 2, 15, 10],
  heart: [21, 26, 51, 40],
  spleen: [48, 57, 44, 50, 32, 28, 18],
  sacral: [5, 14, 29, 59, 9, 3, 42, 27, 34],
  esp: [36, 22, 37, 6, 49, 55, 30],
  root: [53, 60, 52, 19, 39, 41, 58, 38, 54],
} as const;

// ---------------------------------------------------------------------------
// D) Channel definitions: [gate1, gate2, centerFrom, centerTo]
//    All 36 channels in the Human Design bodygraph.
// ---------------------------------------------------------------------------
export interface ChannelDefinition {
  gate1: number;
  gate2: number;
  center1: string;
  center2: string;
}

export const CHANNEL_DEFINITIONS: readonly ChannelDefinition[] = [
  // Head - Ajna
  { gate1: 64, gate2: 47, center1: "head", center2: "ajna" },
  { gate1: 61, gate2: 24, center1: "head", center2: "ajna" },
  { gate1: 63, gate2: 4, center1: "head", center2: "ajna" },

  // Ajna - Throat
  { gate1: 17, gate2: 62, center1: "ajna", center2: "throat" },
  { gate1: 43, gate2: 23, center1: "ajna", center2: "throat" },
  { gate1: 11, gate2: 56, center1: "ajna", center2: "throat" },

  // Throat - G
  { gate1: 31, gate2: 7, center1: "throat", center2: "g" },
  { gate1: 8, gate2: 1, center1: "throat", center2: "g" },
  { gate1: 33, gate2: 13, center1: "throat", center2: "g" },
  { gate1: 20, gate2: 10, center1: "throat", center2: "g" },

  // Throat - Heart
  { gate1: 45, gate2: 21, center1: "throat", center2: "heart" },

  // Throat - ESP (Solar Plexus)
  { gate1: 12, gate2: 22, center1: "throat", center2: "esp" },
  { gate1: 35, gate2: 36, center1: "throat", center2: "esp" },

  // Throat - Spleen
  { gate1: 16, gate2: 48, center1: "throat", center2: "spleen" },
  { gate1: 20, gate2: 57, center1: "throat", center2: "spleen" },

  // Throat - Sacral
  { gate1: 20, gate2: 34, center1: "throat", center2: "sacral" },

  // G - Sacral
  { gate1: 46, gate2: 29, center1: "g", center2: "sacral" },
  { gate1: 15, gate2: 5, center1: "g", center2: "sacral" },
  { gate1: 2, gate2: 14, center1: "g", center2: "sacral" },
  { gate1: 10, gate2: 34, center1: "g", center2: "sacral" },

  // G - Heart
  { gate1: 25, gate2: 51, center1: "g", center2: "heart" },

  // G - Spleen
  { gate1: 10, gate2: 57, center1: "g", center2: "spleen" },

  // Heart - Spleen
  { gate1: 26, gate2: 44, center1: "heart", center2: "spleen" },

  // Heart - ESP
  { gate1: 40, gate2: 37, center1: "heart", center2: "esp" },

  // Spleen - Sacral
  { gate1: 50, gate2: 27, center1: "spleen", center2: "sacral" },
  { gate1: 57, gate2: 34, center1: "spleen", center2: "sacral" },

  // Spleen - Throat (duplicate listing from Throat-Spleen, already covered above)
  // These are already listed as Throat-Spleen; the 48-16 channel is the same as 16-48.

  // Spleen - Root
  { gate1: 28, gate2: 38, center1: "spleen", center2: "root" },
  { gate1: 18, gate2: 58, center1: "spleen", center2: "root" },
  { gate1: 32, gate2: 54, center1: "spleen", center2: "root" },

  // ESP - Sacral
  { gate1: 6, gate2: 59, center1: "esp", center2: "sacral" },

  // ESP - Root
  { gate1: 49, gate2: 19, center1: "esp", center2: "root" },
  { gate1: 55, gate2: 39, center1: "esp", center2: "root" },
  { gate1: 30, gate2: 41, center1: "esp", center2: "root" },

  // Sacral - Root
  { gate1: 42, gate2: 53, center1: "sacral", center2: "root" },
  { gate1: 3, gate2: 60, center1: "sacral", center2: "root" },
  { gate1: 9, gate2: 52, center1: "sacral", center2: "root" },
] as const;

// ---------------------------------------------------------------------------
// E) Motor centers -- used for type derivation (motor-to-throat connection).
// ---------------------------------------------------------------------------
export const MOTOR_CENTERS: readonly string[] = [
  "heart",
  "sacral",
  "esp",
  "root",
] as const;

// ---------------------------------------------------------------------------
// F) Profile names -- all 12 valid profile combinations.
// ---------------------------------------------------------------------------
export const PROFILE_NAMES: Record<string, string> = {
  "1/3": "Investigator / Martyr",
  "1/4": "Investigator / Opportunist",
  "2/4": "Hermit / Opportunist",
  "2/5": "Hermit / Heretic",
  "3/5": "Martyr / Heretic",
  "3/6": "Martyr / Role Model",
  "4/6": "Opportunist / Role Model",
  "4/1": "Opportunist / Investigator",
  "5/1": "Heretic / Investigator",
  "5/2": "Heretic / Hermit",
  "6/2": "Role Model / Hermit",
  "6/3": "Role Model / Martyr",
};

/**
 * Profile angle classification.
 * Right Angle profiles: 1/3, 1/4, 2/4, 2/5, 3/5, 3/6
 * Juxtaposition profiles: 4/1
 * Left Angle profiles: 4/6, 5/1, 5/2, 6/2, 6/3
 */
export const PROFILE_ANGLES: Record<string, "Right Angle" | "Juxtaposition" | "Left Angle"> = {
  "1/3": "Right Angle",
  "1/4": "Right Angle",
  "2/4": "Right Angle",
  "2/5": "Right Angle",
  "3/5": "Right Angle",
  "3/6": "Right Angle",
  "4/1": "Juxtaposition",
  "4/6": "Left Angle",
  "5/1": "Left Angle",
  "5/2": "Left Angle",
  "6/2": "Left Angle",
  "6/3": "Left Angle",
};

// ---------------------------------------------------------------------------
// G) Incarnation Cross names, keyed by Personality Sun gate.
//    There are 64 possible Right Angle crosses (one per gate), and the
//    corresponding Left Angle / Juxtaposition names follow a pattern.
//    This map provides the base cross name per gate; the full name is
//    prefixed by the angle.
// ---------------------------------------------------------------------------
export const CROSS_NAMES: Record<number, string> = {
  1: "The Sphinx",
  2: "The Sphinx",
  7: "The Sphinx",
  13: "The Sphinx",
  3: "Laws",
  60: "Laws",
  50: "Laws",
  56: "Laws",
  4: "Explanation",
  49: "Explanation",
  43: "Explanation",
  23: "Explanation",
  5: "Consciousness",
  35: "Consciousness",
  15: "Consciousness",
  10: "Consciousness",
  6: "Eden",
  36: "Eden",
  12: "Eden",
  11: "Eden",
  8: "Contagion",
  14: "Contagion",
  29: "Contagion",
  30: "Contagion",
  9: "Planning",
  16: "Planning",
  40: "Planning",
  37: "Planning",
  17: "Service",
  18: "Service",
  58: "Service",
  52: "Service",
  19: "The Four Ways",
  33: "The Four Ways",
  44: "The Four Ways",
  24: "The Four Ways",
  20: "The Sleeping Phoenix",
  34: "The Sleeping Phoenix",
  57: "The Sleeping Phoenix",
  51: "The Sleeping Phoenix",
  21: "Tension",
  38: "Tension",
  39: "Tension",
  48: "Tension",
  22: "Rulership",
  47: "Rulership",
  26: "Rulership",
  45: "Rulership",
  25: "The Vessel of Love",
  46: "The Vessel of Love",
  55: "The Vessel of Love",
  59: "The Vessel of Love",
  28: "The Unexpected",
  27: "The Unexpected",
  31: "The Unexpected",
  32: "Maya",
  41: "The Unexpected",
  42: "Maya",
  53: "Doubt",
  54: "Doubt",
  61: "Maya",
  62: "Maya",
  63: "Doubt",
  64: "Doubt",
};

/**
 * Builds the full incarnation cross name from the profile angle and
 * the personality Sun gate.
 */
export function getCrossName(
  personalitySunGate: number,
  angle: "Right Angle" | "Juxtaposition" | "Left Angle"
): string {
  const baseName = CROSS_NAMES[personalitySunGate] ?? "Unknown";

  switch (angle) {
    case "Right Angle":
      return `Right Angle Cross of ${baseName}`;
    case "Juxtaposition":
      return `Juxtaposition Cross of ${baseName}`;
    case "Left Angle":
      return `Left Angle Cross of ${baseName}`;
  }
}
