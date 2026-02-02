export interface CenterLayout {
  x: number;
  y: number;
  shape: "triangle-up" | "triangle-down" | "square" | "diamond";
  width: number;
  height: number;
}

export const CENTER_POSITIONS: Record<string, CenterLayout> = {
  head: { x: 200, y: 55, shape: "triangle-up", width: 50, height: 40 },
  ajna: { x: 200, y: 130, shape: "triangle-down", width: 50, height: 40 },
  throat: { x: 200, y: 215, shape: "square", width: 50, height: 50 },
  g: { x: 200, y: 315, shape: "diamond", width: 50, height: 50 },
  heart: { x: 115, y: 290, shape: "triangle-up", width: 40, height: 35 },
  spleen: { x: 75, y: 405, shape: "triangle-down", width: 40, height: 35 },
  sacral: { x: 200, y: 430, shape: "square", width: 50, height: 50 },
  esp: { x: 305, y: 370, shape: "triangle-down", width: 40, height: 35 },
  root: { x: 200, y: 535, shape: "square", width: 50, height: 50 },
};

export interface ChannelDefinition {
  gates: [number, number];
  centerFrom: string;
  centerTo: string;
}

// All 36 channels of the Human Design bodygraph
export const CHANNEL_PATHS: ChannelDefinition[] = [
  // Head to Ajna
  { gates: [64, 47], centerFrom: "head", centerTo: "ajna" },
  { gates: [61, 24], centerFrom: "head", centerTo: "ajna" },
  { gates: [63, 4], centerFrom: "head", centerTo: "ajna" },

  // Ajna to Throat
  { gates: [17, 62], centerFrom: "ajna", centerTo: "throat" },
  { gates: [43, 23], centerFrom: "ajna", centerTo: "throat" },
  { gates: [11, 56], centerFrom: "ajna", centerTo: "throat" },

  // Throat to G Center
  { gates: [16, 48], centerFrom: "throat", centerTo: "spleen" },
  { gates: [20, 10], centerFrom: "throat", centerTo: "g" },
  { gates: [31, 7], centerFrom: "throat", centerTo: "g" },
  { gates: [8, 1], centerFrom: "throat", centerTo: "g" },
  { gates: [33, 13], centerFrom: "throat", centerTo: "g" },

  // Throat to Heart (Ego)
  { gates: [45, 21], centerFrom: "throat", centerTo: "heart" },

  // Throat connections via Sacral/other
  { gates: [12, 22], centerFrom: "throat", centerTo: "esp" },
  { gates: [35, 36], centerFrom: "throat", centerTo: "esp" },

  // G Center to Sacral
  { gates: [5, 15], centerFrom: "g", centerTo: "sacral" },
  { gates: [14, 2], centerFrom: "g", centerTo: "sacral" },
  { gates: [29, 46], centerFrom: "g", centerTo: "sacral" },

  // G Center to Spleen
  { gates: [10, 57], centerFrom: "g", centerTo: "spleen" },

  // G Center to Heart
  { gates: [25, 51], centerFrom: "g", centerTo: "heart" },

  // Heart to Throat (additional)
  { gates: [26, 44], centerFrom: "heart", centerTo: "spleen" },

  // Heart to Sacral
  { gates: [40, 37], centerFrom: "heart", centerTo: "esp" },

  // Spleen to Sacral
  { gates: [34, 57], centerFrom: "sacral", centerTo: "spleen" },

  // Spleen to Root
  { gates: [48, 16], centerFrom: "spleen", centerTo: "throat" },
  { gates: [18, 58], centerFrom: "spleen", centerTo: "root" },
  { gates: [28, 38], centerFrom: "spleen", centerTo: "root" },
  { gates: [32, 54], centerFrom: "spleen", centerTo: "root" },
  { gates: [50, 27], centerFrom: "spleen", centerTo: "sacral" },
  { gates: [57, 20], centerFrom: "spleen", centerTo: "throat" },

  // Sacral to Root
  { gates: [42, 53], centerFrom: "sacral", centerTo: "root" },
  { gates: [3, 60], centerFrom: "sacral", centerTo: "root" },
  { gates: [9, 52], centerFrom: "sacral", centerTo: "root" },

  // Sacral to ESP (Solar Plexus)
  { gates: [59, 6], centerFrom: "sacral", centerTo: "esp" },

  // Sacral to Throat (direct)
  { gates: [34, 20], centerFrom: "sacral", centerTo: "throat" },

  // ESP (Solar Plexus) to Root
  { gates: [41, 30], centerFrom: "esp", centerTo: "root" },
  { gates: [36, 35], centerFrom: "esp", centerTo: "throat" },
  { gates: [19, 49], centerFrom: "root", centerTo: "esp" },
];
