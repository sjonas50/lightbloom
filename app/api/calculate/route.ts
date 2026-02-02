import { NextRequest, NextResponse } from "next/server";
import { calculateRequestSchema } from "@/lib/validators/birth-data";
import { calculateNatalChart } from "@/lib/astrology/natal-chart";
import { calculate2026Transits } from "@/lib/astrology/transits";
import type { ChartCalculationResult } from "@/types/astrology";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Parse and validate the request body
    const body: unknown = await request.json();
    const parsed = calculateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { birthDate, birthTime, latitude, longitude, timezone, houseSystem } =
      parsed.data;

    // 2. Calculate the natal chart
    const natal = calculateNatalChart(
      birthDate,
      birthTime,
      latitude,
      longitude,
      timezone,
      houseSystem
    );

    // 3. Calculate 2026 transits against the natal chart
    const transits2026 = calculate2026Transits(natal);

    // 4. Build and return the response
    const result: ChartCalculationResult = { natal, transits2026 };

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    console.error("[api/calculate] Error:", message);

    return NextResponse.json(
      { error: "Calculation failed", message },
      { status: 500 }
    );
  }
}
