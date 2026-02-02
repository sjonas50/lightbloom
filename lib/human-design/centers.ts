/**
 * Center Logic
 *
 * Determines which of the 9 Human Design centers are defined
 * based on defined channels.
 */

import type { HDCenter, HDChannel } from "@/types/human-design";

/** All nine center names in bodygraph order. */
const ALL_CENTERS: readonly string[] = [
  "head",
  "ajna",
  "throat",
  "g",
  "heart",
  "spleen",
  "sacral",
  "esp",
  "root",
] as const;

/**
 * Returns the full list of 9 centers, each marked as defined or undefined.
 *
 * A center is defined when at least one channel that passes through it
 * is itself defined (both gates activated).
 *
 * @param definedChannels - Array of all channels (only those with
 *   `defined === true` are considered).
 * @returns Array of 9 HDCenter objects.
 */
export function getDefinedCenters(definedChannels: HDChannel[]): HDCenter[] {
  // Collect all centers that participate in at least one defined channel.
  const definedCenterNames = new Set<string>();

  for (const channel of definedChannels) {
    if (channel.defined) {
      definedCenterNames.add(channel.centerFrom);
      definedCenterNames.add(channel.centerTo);
    }
  }

  return ALL_CENTERS.map((name) => ({
    name,
    defined: definedCenterNames.has(name),
  }));
}

/**
 * Convenience: returns just the Set of defined center names.
 * Useful for type and authority derivation.
 */
export function getDefinedCenterNames(definedChannels: HDChannel[]): Set<string> {
  const names = new Set<string>();
  for (const channel of definedChannels) {
    if (channel.defined) {
      names.add(channel.centerFrom);
      names.add(channel.centerTo);
    }
  }
  return names;
}
