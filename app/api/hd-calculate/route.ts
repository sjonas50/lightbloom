/**
 * POST /api/hd-calculate
 *
 * API route for calculating a Human Design chart.
 *
 * Request body (JSON):
 *   - birthDate: string      (ISO date, e.g. "1990-06-15")
 *   - birthTime?: string     (HH:MM, e.g. "14:30")
 *   - latitude: number       (-90 to 90)
 *   - longitude: number      (-180 to 180)
 *   - timezone: string       (IANA, e.g. "America/New_York")
 *   - houseSystem?: string   (unused for HD, kept for API compatibility)
 *
 * Response (JSON):
 *   - Full HumanDesignChart object on success (200)
 *   - Error object on validation failure (400) or server error (500)
 */

import { NextRequest, NextResponse } from "next/server";
import { calculateRequestSchema } from "@/lib/validators/birth-data";
import { calculateHumanDesign } from "@/lib/human-design/calculator";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: unknown = await request.json();

    // Validate with Zod schema
    const parseResult = calculateRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { birthDate, birthTime, latitude, longitude, timezone } =
      parseResult.data;

    // Calculate the Human Design chart
    const chart = calculateHumanDesign(
      birthDate,
      birthTime,
      latitude,
      longitude,
      timezone
    );

    return NextResponse.json(chart, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    console.error("[hd-calculate] Error:", message);

    return NextResponse.json(
      {
        error: "Calculation failed",
        message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
