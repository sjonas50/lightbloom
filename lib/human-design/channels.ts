/**
 * Channel Logic
 *
 * Determines which Human Design channels are defined based on
 * the set of activated gates.
 */

import type { HDChannel } from "@/types/human-design";
import { CHANNEL_DEFINITIONS } from "./constants";

/**
 * Examines every one of the 36 channels and returns the full list,
 * marking each channel as defined (both gates activated) or undefined.
 *
 * @param activatedGates - Set of gate numbers that have at least one
 *   planetary activation (personality or design).
 * @returns Array of all 36 channels with their defined status.
 */
export function getDefinedChannels(activatedGates: Set<number>): HDChannel[] {
  return CHANNEL_DEFINITIONS.map((channel) => {
    const defined =
      activatedGates.has(channel.gate1) && activatedGates.has(channel.gate2);

    return {
      gates: [channel.gate1, channel.gate2] as [number, number],
      defined,
      centerFrom: channel.center1,
      centerTo: channel.center2,
    };
  });
}
