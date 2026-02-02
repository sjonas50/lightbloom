import { NextResponse } from "next/server";
import { geocodeLocation } from "@/lib/geocoding";
import { geocodeRequestSchema } from "@/lib/validators/birth-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const parsed = geocodeRequestSchema.safeParse({ query });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const results = await geocodeLocation(parsed.data.query);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: `Geocoding failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
