/**
 * Authority Derivation
 *
 * Determines the Human Design inner authority based on defined centers,
 * type, and channels. Follows the strict authority hierarchy.
 */

import type { HDAuthority, HDType, HDChannel } from "@/types/human-design";

/**
 * Derives the inner authority for a Human Design chart.
 *
 * Authority hierarchy (checked top to bottom):
 *   1. Emotional (Solar Plexus / esp defined)
 *   2. Sacral (sacral defined)
 *   3. Splenic (spleen defined)
 *   4. Ego Manifested (heart defined AND heart connects to throat)
 *   5. Ego Projected (heart defined, no direct heart-to-throat)
 *   6. Self-Projected (G center defined with connection to throat)
 *   7. Mental/Environmental (none of the above, not a Reflector)
 *   8. Lunar (Reflector -- no defined centers)
 *
 * @param definedCenters - Set of center names that are defined.
 * @param type - The already-derived HD type.
 * @param definedChannels - All channels with their defined status.
 * @returns The derived HDAuthority.
 */
export function deriveAuthority(
  definedCenters: Set<string>,
  type: HDType,
  definedChannels: HDChannel[]
): HDAuthority {
  // Reflectors always have Lunar authority
  if (type === "Reflector") {
    return "Lunar";
  }

  // 1. Emotional -- Solar Plexus (esp) defined
  if (definedCenters.has("esp")) {
    return "Emotional";
  }

  // 2. Sacral
  if (definedCenters.has("sacral")) {
    return "Sacral";
  }

  // 3. Splenic
  if (definedCenters.has("spleen")) {
    return "Splenic";
  }

  // 4 & 5. Ego (Heart center defined)
  if (definedCenters.has("heart")) {
    // Check if heart connects to throat through defined channels
    if (heartConnectsToThroat(definedChannels)) {
      return "Ego Manifested";
    }
    return "Ego Projected";
  }

  // 6. Self-Projected (G center defined, connects to throat)
  if (definedCenters.has("g") && gConnectsToThroat(definedChannels)) {
    return "Self-Projected";
  }

  // 7. Mental/Environmental (outer authority -- Projectors only in practice)
  return "Mental/Environmental";
}

/**
 * Checks if the heart center has a direct defined channel to the throat.
 *
 * The only channel between heart and throat is 45-21.
 */
function heartConnectsToThroat(definedChannels: HDChannel[]): boolean {
  return definedChannels.some(
    (ch) =>
      ch.defined &&
      ((ch.centerFrom === "heart" && ch.centerTo === "throat") ||
        (ch.centerFrom === "throat" && ch.centerTo === "heart"))
  );
}

/**
 * Checks if the G center has a direct defined channel to the throat.
 *
 * G-to-throat channels: 31-7, 8-1, 33-13, 20-10.
 */
function gConnectsToThroat(definedChannels: HDChannel[]): boolean {
  return definedChannels.some(
    (ch) =>
      ch.defined &&
      ((ch.centerFrom === "g" && ch.centerTo === "throat") ||
        (ch.centerFrom === "throat" && ch.centerTo === "g"))
  );
}
