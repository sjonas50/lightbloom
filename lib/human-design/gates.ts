/**
 * Gate Mapping Functions
 *
 * Converts ecliptic longitude to Human Design gate and line,
 * and resolves which center a gate belongs to.
 */

import { MANDALA_GATE_ORDER, MANDALA_START_DEGREE, CENTER_GATES } from "./constants";

/** Width of a single gate in degrees (360 / 64). */
const GATE_WIDTH = 360 / 64; // 5.625

/** Number of lines per gate. */
const LINES_PER_GATE = 6;

/**
 * Converts an ecliptic longitude (0-360) to the corresponding
 * Human Design gate and line.
 *
 * The mandala begins at MANDALA_START_DEGREE (358.25, i.e. 28d15' Pisces).
 * We subtract that offset, normalize to 0-360, then divide by the gate width
 * (5.625 degrees) to find the gate index and line within the gate.
 *
 * @param longitude - Ecliptic longitude in degrees (0-360).
 * @returns Object with gate number and line number (1-6).
 */
export function longitudeToGate(longitude: number): { gate: number; line: number } {
  // Adjust longitude relative to the mandala start point
  const adjusted = ((longitude - MANDALA_START_DEGREE) + 360) % 360;

  // Determine gate index (0-63)
  const gateIndex = Math.floor(adjusted / GATE_WIDTH);
  const gate = MANDALA_GATE_ORDER[gateIndex % 64];

  // Determine line within the gate (1-6)
  const positionWithinGate = adjusted % GATE_WIDTH;
  let line = Math.floor((positionWithinGate / GATE_WIDTH) * LINES_PER_GATE) + 1;

  // Clamp to valid range 1-6 (handles floating-point edge cases)
  if (line > 6) line = 6;
  if (line < 1) line = 1;

  return { gate, line };
}

/**
 * Pre-computed reverse lookup: gate number -> center name.
 * Built once at module load from CENTER_GATES.
 */
const gateToCenterMap: Map<number, string> = new Map();

for (const [center, gates] of Object.entries(CENTER_GATES)) {
  for (const gate of gates) {
    gateToCenterMap.set(gate, center);
  }
}

/**
 * Returns the center that a given gate belongs to.
 *
 * @param gate - Gate number (1-64).
 * @returns The center name (e.g. "sacral", "throat"), or "unknown" if
 *          the gate number is not recognized.
 */
export function gateToCenter(gate: number): string {
  return gateToCenterMap.get(gate) ?? "unknown";
}
