import { z } from "zod";

export const birthDataSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  birthTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)")
    .optional(),
  birthTimeUnknown: z.boolean().default(false),
  location: z.string().min(2, "Location is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1, "Timezone is required"),
});

export type BirthData = z.infer<typeof birthDataSchema>;

export const geocodeRequestSchema = z.object({
  query: z.string().min(2, "Location query too short"),
});

export const calculateRequestSchema = z.object({
  birthDate: z.string(),
  birthTime: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  houseSystem: z.enum(["placidus", "whole_sign", "koch", "equal"]).default("placidus"),
});

export const readingRequestSchema = z.object({
  astroData: z.record(z.string(), z.unknown()).optional(),
  hdData: z.record(z.string(), z.unknown()).optional(),
  readingType: z.enum(["natal", "transit-2026", "human-design", "synthesis"]),
});
