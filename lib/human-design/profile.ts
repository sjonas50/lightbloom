/**
 * Profile, Incarnation Cross, and Definition Derivation
 *
 * Computes the profile (personality/design sun lines), the incarnation cross,
 * and the definition type (single, split, triple, quadruple, or none).
 */

import type {
  HDProfile,
  IncarnationCross,
  HDDefinition,
  HDChannel,
} from "@/types/human-design";
import {
  PROFILE_NAMES,
  PROFILE_ANGLES,
  getCrossName,
} from "./constants";

/**
 * Derives the profile from the personality Sun line and design Sun line.
 *
 * @param personalitySunLine - Line number (1-6) of the personality Sun gate.
 * @param designSunLine - Line number (1-6) of the design Sun gate.
 * @returns HDProfile with the line numbers, display name, and angle.
 */
export function deriveProfile(
  personalitySunLine: number,
  designSunLine: number
): HDProfile {
  const key = `${personalitySunLine}/${designSunLine}`;
  const name = PROFILE_NAMES[key] ?? `${personalitySunLine}/${designSunLine}`;
  const angle = PROFILE_ANGLES[key] ?? "Right Angle";

  return {
    personalityLine: personalitySunLine,
    designLine: designSunLine,
    name,
    angle,
  };
}

/**
 * Derives the incarnation cross from the four Sun/Earth gate numbers
 * and the profile.
 *
 * The cross is formed by:
 *   - Personality Sun gate
 *   - Personality Earth gate (Sun + 180 degrees)
 *   - Design Sun gate
 *   - Design Earth gate (Design Sun + 180 degrees)
 *
 * The name is determined by the personality Sun gate and the profile angle.
 *
 * @param pSunGate - Personality Sun gate number.
 * @param pEarthGate - Personality Earth gate number.
 * @param dSunGate - Design Sun gate number.
 * @param dEarthGate - Design Earth gate number.
 * @param profile - The derived HDProfile (needed for the angle).
 * @returns IncarnationCross object.
 */
export function deriveIncarnationCross(
  pSunGate: number,
  pEarthGate: number,
  dSunGate: number,
  dEarthGate: number,
  profile: HDProfile
): IncarnationCross {
  const crossName = getCrossName(pSunGate, profile.angle);

  return {
    name: crossName,
    angle: profile.angle,
    personalitySunGate: pSunGate,
    personalityEarthGate: pEarthGate,
    designSunGate: dSunGate,
    designEarthGate: dEarthGate,
  };
}

/**
 * Derives the definition type by counting connected components
 * among the defined centers.
 *
 * Uses BFS on an adjacency graph built from defined channels.
 *
 * - 0 components -> "No Definition"
 * - 1 component  -> "Single"
 * - 2 components -> "Split"
 * - 3 components -> "Triple Split"
 * - 4+ components -> "Quadruple Split"
 *
 * @param definedCenters - Set of center names that are defined.
 * @param definedChannels - All channels with their defined status.
 * @returns The HDDefinition value.
 */
export function deriveDefinition(
  definedCenters: Set<string>,
  definedChannels: HDChannel[]
): HDDefinition {
  if (definedCenters.size === 0) {
    return "No Definition";
  }

  // Build adjacency list from defined channels
  const adjacency = new Map<string, Set<string>>();

  for (const center of definedCenters) {
    adjacency.set(center, new Set());
  }

  for (const channel of definedChannels) {
    if (!channel.defined) continue;

    const from = channel.centerFrom;
    const to = channel.centerTo;

    if (adjacency.has(from) && adjacency.has(to)) {
      adjacency.get(from)!.add(to);
      adjacency.get(to)!.add(from);
    }
  }

  // Count connected components using BFS
  const visited = new Set<string>();
  let componentCount = 0;

  for (const center of definedCenters) {
    if (visited.has(center)) continue;

    componentCount++;
    const queue: string[] = [center];
    visited.add(center);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjacency.get(current);
      if (!neighbors) continue;

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }

  switch (componentCount) {
    case 0:
      return "No Definition";
    case 1:
      return "Single";
    case 2:
      return "Split";
    case 3:
      return "Triple Split";
    default:
      return "Quadruple Split";
  }
}
