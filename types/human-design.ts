export type HDType =
  | "Manifestor"
  | "Generator"
  | "Manifesting Generator"
  | "Projector"
  | "Reflector";

export type HDAuthority =
  | "Emotional"
  | "Sacral"
  | "Splenic"
  | "Ego Manifested"
  | "Ego Projected"
  | "Self-Projected"
  | "Mental/Environmental"
  | "Lunar";

export type HDDefinition =
  | "No Definition"
  | "Single"
  | "Split"
  | "Triple Split"
  | "Quadruple Split";

export interface GateActivation {
  gate: number;
  line: number;
  longitude: number;
  planet: string;
  isPersonality: boolean;
}

export interface HDCenter {
  name: string;
  defined: boolean;
}

export interface HDChannel {
  gates: [number, number];
  defined: boolean;
  centerFrom: string;
  centerTo: string;
}

export interface HDProfile {
  personalityLine: number;
  designLine: number;
  name: string;
  angle: "Right Angle" | "Juxtaposition" | "Left Angle";
}

export interface IncarnationCross {
  name: string;
  angle: string;
  personalitySunGate: number;
  personalityEarthGate: number;
  designSunGate: number;
  designEarthGate: number;
}

export interface HumanDesignChart {
  type: HDType;
  authority: HDAuthority;
  profile: HDProfile;
  definition: HDDefinition;
  incarnationCross: IncarnationCross;
  centers: HDCenter[];
  channels: HDChannel[];
  gates: GateActivation[];
  designDate: string;
}

export const HD_TYPE_STRATEGIES: Record<HDType, string> = {
  Manifestor: "To Inform",
  Generator: "To Respond",
  "Manifesting Generator": "To Respond",
  Projector: "Wait for the Invitation",
  Reflector: "Wait a Lunar Cycle",
};

export const HD_TYPE_SIGNATURES: Record<HDType, string> = {
  Manifestor: "Peace",
  Generator: "Satisfaction",
  "Manifesting Generator": "Satisfaction",
  Projector: "Success",
  Reflector: "Surprise",
};

export const HD_TYPE_NOT_SELF: Record<HDType, string> = {
  Manifestor: "Anger",
  Generator: "Frustration",
  "Manifesting Generator": "Frustration & Anger",
  Projector: "Bitterness",
  Reflector: "Disappointment",
};
