/**
 * Type Derivation
 *
 * Determines the Human Design type (Manifestor, Generator,
 * Manifesting Generator, Projector, Reflector) based on
 * defined centers and channels using BFS path-finding.
 */

import type { HDType, HDChannel } from "@/types/human-design";
import { MOTOR_CENTERS } from "./constants";

/**
 * Derives the Human Design type from the chart's defined centers
 * and channels.
 *
 * Decision tree:
 *   1. No defined centers -> Reflector
 *   2. Sacral defined + motor-to-throat path -> Manifesting Generator
 *   3. Sacral defined (no motor-to-throat) -> Generator
 *   4. Motor-to-throat path (sacral undefined) -> Manifestor
 *   5. Otherwise -> Projector
 *
 * @param definedCenters - Set of center names that are defined.
 * @param definedChannels - Array of all channels with their defined status.
 * @returns The derived HDType.
 */
export function deriveType(
  definedCenters: Set<string>,
  definedChannels: HDChannel[]
): HDType {
  // 1. No defined centers -> Reflector
  if (definedCenters.size === 0) {
    return "Reflector";
  }

  const sacralDefined = definedCenters.has("sacral");
  const motorToThroat = hasMotorToThroatPath(definedCenters, definedChannels);

  // 2. Sacral defined + motor-to-throat -> Manifesting Generator
  if (sacralDefined && motorToThroat) {
    return "Manifesting Generator";
  }

  // 3. Sacral defined, no motor-to-throat -> Generator
  if (sacralDefined) {
    return "Generator";
  }

  // 4. Motor-to-throat (sacral not defined) -> Manifestor
  if (motorToThroat) {
    return "Manifestor";
  }

  // 5. Fallthrough -> Projector
  return "Projector";
}

/**
 * Checks whether there is a path from any motor center to the throat
 * center through defined channels.
 *
 * Uses BFS on an adjacency graph built from defined channels.
 * Motor centers: heart, sacral, esp (solar plexus), root.
 *
 * @param definedCenters - Set of defined center names.
 * @param definedChannels - All channels with defined status.
 * @returns true if at least one motor center connects to throat.
 */
export function hasMotorToThroatPath(
  definedCenters: Set<string>,
  definedChannels: HDChannel[]
): boolean {
  // If throat is not defined, no path can exist
  if (!definedCenters.has("throat")) {
    return false;
  }

  // Build adjacency list from defined channels only
  const adjacency = new Map<string, Set<string>>();

  for (const channel of definedChannels) {
    if (!channel.defined) continue;

    const from = channel.centerFrom;
    const to = channel.centerTo;

    if (!adjacency.has(from)) adjacency.set(from, new Set());
    if (!adjacency.has(to)) adjacency.set(to, new Set());

    adjacency.get(from)!.add(to);
    adjacency.get(to)!.add(from);
  }

  // BFS from each motor center to see if we can reach "throat"
  for (const motor of MOTOR_CENTERS) {
    if (!definedCenters.has(motor)) continue;

    if (bfsReaches(adjacency, motor, "throat")) {
      return true;
    }
  }

  return false;
}

/**
 * BFS from `start` to `target` using the adjacency map.
 *
 * @returns true if target is reachable from start.
 */
function bfsReaches(
  adjacency: Map<string, Set<string>>,
  start: string,
  target: string
): boolean {
  if (start === target) return true;

  const visited = new Set<string>();
  const queue: string[] = [start];
  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacency.get(current);
    if (!neighbors) continue;

    for (const neighbor of neighbors) {
      if (neighbor === target) return true;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}
