/**
 * Reference Implementation: Human Design Gate Mapping
 *
 * This module maps ecliptic longitudes to I Ching gates (hexagrams) as used
 * in the Human Design system. The 360-degree zodiac wheel is divided into
 * 64 gates, each occupying approximately 5.625 degrees.
 *
 * The gate order around the wheel does NOT follow the numerical I Ching
 * sequence (1, 2, 3...). Instead, it follows the Human Design mandala order,
 * which maps specific gates to specific zodiac degree ranges.
 *
 * Key architectural points:
 * - Gate mapping is a pure function (longitude -> gate number + line)
 * - The HD mandala order is a fixed lookup table
 * - Each gate has 6 lines (subdivisions of ~0.9375 degrees each)
 *
 * NOTE: This is a reference implementation for architectural documentation.
 */

// ─── Types ────────────────────────────────────────────────────────

export interface GateActivation {
  gate: number; // I Ching gate number (1-64)
  line: number; // Line within gate (1-6)
  longitude: number; // Original ecliptic longitude
  planet: string; // Planet that activates this gate
  isPersonality: boolean; // true = conscious, false = unconscious/design
}

export interface HDCenter {
  name: string;
  defined: boolean;
  gates: number[]; // Gates belonging to this center
}

export interface HDChannel {
  gates: [number, number];
  defined: boolean;
  centerFrom: string;
  centerTo: string;
}

export type HDType =
  | "Manifestor"
  | "Generator"
  | "Manifesting Generator"
  | "Projector"
  | "Reflector";

// ─── Gate Order on the Human Design Mandala ───────────────────────
// The 64 gates in order as they appear around the 360-degree wheel.
// Starting from 0 degrees Aries (Gate 25 at the Aries point).
// Each gate spans 360/64 = 5.625 degrees.

const MANDALA_GATE_ORDER: number[] = [
  25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39,
  53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19, 13,
  49, 30, 55, 37, 63, 22, 36,
];

// ─── Center Definitions ───────────────────────────────────────────
// Which gates belong to which center

const CENTER_GATES: Record<string, number[]> = {
  head: [64, 61, 63],
  ajna: [47, 24, 4, 17, 43, 11],
  throat: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
  g: [7, 1, 13, 25, 46, 2, 15, 10],
  heart: [21, 26, 51, 40],
  spleen: [48, 57, 44, 50, 32, 28, 18],
  sacral: [5, 14, 29, 59, 9, 3, 42, 27, 34],
  esp: [36, 22, 37, 6, 49, 55, 30],
  root: [53, 60, 52, 19, 39, 41, 58, 38, 54],
};

// ─── Channel Definitions ──────────────────────────────────────────
// Each channel connects two gates across two centers.
// Format: [gate1, gate2, center1, center2]

const CHANNELS: [number, number, string, string][] = [
  // Head to Ajna
  [64, 47, "head", "ajna"],
  [61, 24, "head", "ajna"],
  [63, 4, "head", "ajna"],
  // Ajna to Throat
  [17, 62, "ajna", "throat"],
  [43, 23, "ajna", "throat"],
  [11, 56, "ajna", "throat"],
  // Throat to G
  [31, 7, "throat", "g"],
  [8, 1, "throat", "g"],
  [33, 13, "throat", "g"],
  [20, 10, "throat", "g"],
  // Throat to Heart
  [45, 21, "throat", "heart"],
  [12, 22, "throat", "esp"],
  [35, 36, "throat", "esp"],
  // G to Sacral
  [46, 29, "g", "sacral"],
  [15, 5, "g", "sacral"],
  [2, 14, "g", "sacral"],
  [10, 34, "g", "sacral"],
  // G to Spleen
  [25, 51, "g", "heart"],
  [7, 31, "throat", "g"], // already listed, skip in real impl
  // Heart to Sacral
  [21, 45, "throat", "heart"], // already listed
  [26, 44, "heart", "spleen"],
  [40, 37, "heart", "esp"],
  // Spleen to Sacral
  [50, 27, "spleen", "sacral"],
  [57, 34, "spleen", "sacral"],
  [44, 26, "spleen", "heart"],
  [48, 16, "spleen", "throat"],
  [28, 38, "spleen", "root"],
  [18, 58, "spleen", "root"],
  [32, 54, "spleen", "root"],
  // Sacral to Root
  [42, 53, "sacral", "root"],
  [3, 60, "sacral", "root"],
  [9, 52, "sacral", "root"],
  [59, 6, "sacral", "esp"],
  [27, 50, "sacral", "spleen"],
  // ESP to Root
  [49, 19, "esp", "root"],
  [55, 39, "esp", "root"],
  [30, 41, "esp", "root"],
  // ESP to Sacral
  [6, 59, "esp", "sacral"],
];

// ─── Core Mapping Function ────────────────────────────────────────

/**
 * Map an ecliptic longitude (0-360 degrees) to a Human Design gate and line.
 *
 * The wheel starts at 0 degrees Aries. Each gate spans 5.625 degrees.
 * Each line within a gate spans 5.625/6 = 0.9375 degrees.
 */
export function longitudeToGate(longitude: number): {
  gate: number;
  line: number;
} {
  // Normalize longitude to 0-360
  const normalized = ((longitude % 360) + 360) % 360;

  // Calculate gate index (which of the 64 segments)
  const gateWidth = 360 / 64; // 5.625 degrees
  const gateIndex = Math.floor(normalized / gateWidth);

  // Get the gate number from the mandala order
  const gate = MANDALA_GATE_ORDER[gateIndex];

  // Calculate line within gate (1-6)
  const positionInGate = (normalized % gateWidth) / gateWidth;
  const line = Math.floor(positionInGate * 6) + 1;

  return { gate, line: Math.min(line, 6) };
}

/**
 * Calculate the complete Human Design chart from planetary positions.
 *
 * Requires two sets of planetary positions:
 * - Personality (conscious): calculated at the moment of birth
 * - Design (unconscious): calculated ~88 degrees of solar arc before birth
 *   (approximately 88 days before birth, when the Sun was 88 degrees
 *   earlier in the zodiac)
 */
export function calculateHumanDesign(
  personalityPositions: Array<{ planet: string; longitude: number }>,
  designPositions: Array<{ planet: string; longitude: number }>
): {
  type: HDType;
  gates: GateActivation[];
  centers: HDCenter[];
  channels: HDChannel[];
} {
  // Step 1: Map all planetary positions to gates
  const gates: GateActivation[] = [];

  for (const pos of personalityPositions) {
    const { gate, line } = longitudeToGate(pos.longitude);
    gates.push({
      gate,
      line,
      longitude: pos.longitude,
      planet: pos.planet,
      isPersonality: true,
    });
  }

  for (const pos of designPositions) {
    const { gate, line } = longitudeToGate(pos.longitude);
    gates.push({
      gate,
      line,
      longitude: pos.longitude,
      planet: pos.planet,
      isPersonality: false,
    });
  }

  // Step 2: Collect all activated gate numbers
  const activatedGates = new Set(gates.map((g) => g.gate));

  // Step 3: Determine defined channels
  const definedChannels: HDChannel[] = [];
  for (const [gate1, gate2, center1, center2] of CHANNELS) {
    const isDefined = activatedGates.has(gate1) && activatedGates.has(gate2);
    definedChannels.push({
      gates: [gate1, gate2],
      defined: isDefined,
      centerFrom: center1,
      centerTo: center2,
    });
  }

  // Step 4: Determine defined centers
  const definedCenterNames = new Set<string>();
  for (const channel of definedChannels) {
    if (channel.defined) {
      definedCenterNames.add(channel.centerFrom);
      definedCenterNames.add(channel.centerTo);
    }
  }

  const centers: HDCenter[] = Object.entries(CENTER_GATES).map(
    ([name, gateList]) => ({
      name,
      defined: definedCenterNames.has(name),
      gates: gateList,
    })
  );

  // Step 5: Derive Type
  const type = deriveType(centers, definedChannels);

  return { type, gates, centers, channels: definedChannels };
}

/**
 * Derive the Human Design Type from center definitions.
 */
function deriveType(centers: HDCenter[], channels: HDChannel[]): HDType {
  const defined = new Set(centers.filter((c) => c.defined).map((c) => c.name));

  // Check if no centers are defined
  if (defined.size === 0) {
    return "Reflector";
  }

  const sacralDefined = defined.has("sacral");
  const throatDefined = defined.has("throat");

  // Check for motor-to-throat connection
  const motorCenters = ["heart", "esp", "sacral", "root"];
  const motorToThroat = hasPathBetween(
    motorCenters,
    "throat",
    channels,
    centers
  );

  if (sacralDefined && motorToThroat) {
    return "Manifesting Generator";
  }
  if (sacralDefined) {
    return "Generator";
  }
  if (motorToThroat) {
    return "Manifestor";
  }
  return "Projector";
}

/**
 * Check if there is a path of defined channels from any motor center to the throat.
 * This is a simplified graph traversal for type determination.
 */
function hasPathBetween(
  fromCenters: string[],
  toCenterName: string,
  channels: HDChannel[],
  centers: HDCenter[]
): boolean {
  const definedCenters = new Set(
    centers.filter((c) => c.defined).map((c) => c.name)
  );
  const definedChannelEdges = channels
    .filter((ch) => ch.defined)
    .map((ch) => [ch.centerFrom, ch.centerTo] as [string, string]);

  // BFS from motor centers to throat through defined channels
  for (const start of fromCenters) {
    if (!definedCenters.has(start)) continue;

    const visited = new Set<string>();
    const queue = [start];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === toCenterName) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      for (const [from, to] of definedChannelEdges) {
        if (from === current && !visited.has(to)) queue.push(to);
        if (to === current && !visited.has(from)) queue.push(from);
      }
    }
  }

  return false;
}
