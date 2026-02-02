"use client";

import { useState, useCallback } from "react";
import { BirthDataForm } from "@/components/forms/birth-data-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReadingFlow from "@/components/reading/reading-flow";
import type { BirthData } from "@/lib/validators/birth-data";
import type { ChartCalculationResult } from "@/types/astrology";
import type { HumanDesignChart } from "@/types/human-design";

export default function ChartPage() {
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [astroData, setAstroData] = useState<ChartCalculationResult | null>(null);
  const [hdData, setHdData] = useState<HumanDesignChart | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: BirthData) => {
    setBirthData(data);
    setIsCalculating(true);
    setCalcError(null);
    setAstroData(null);
    setHdData(null);

    try {
      const requestBody = {
        birthDate: data.birthDate,
        birthTime: data.birthTime,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      };

      const [astroRes, hdRes] = await Promise.all([
        fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }),
        fetch("/api/hd-calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }),
      ]);

      if (!astroRes.ok) {
        const err = await astroRes.json().catch(() => ({ error: "Chart calculation failed" }));
        throw new Error(err.error || "Chart calculation failed");
      }

      const astro = await astroRes.json();
      setAstroData(astro);

      if (hdRes.ok) {
        const hd = await hdRes.json();
        setHdData(hd);
      }
    } catch (error) {
      setCalcError(error instanceof Error ? error.message : "Calculation failed");
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Light<span className="text-primary">Bloom</span>{" "}
            <span className="text-muted-foreground font-normal text-xl">Healing</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Astrology & Human Design, Illuminated by AI
          </p>
        </div>

        {/* Form */}
        {!astroData && (
          <div className="mx-auto max-w-md">
            <BirthDataForm onSubmit={handleSubmit} isLoading={isCalculating} />
            {calcError && (
              <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{calcError}</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {astroData && (
          <div className="space-y-6">
            {/* Birth Data Summary */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">{birthData?.birthDate}</Badge>
              {birthData?.birthTime && (
                <Badge variant="secondary">{birthData.birthTime}</Badge>
              )}
              <Badge variant="secondary">{birthData?.location}</Badge>
              {hdData && (
                <Badge variant="outline">{hdData.type}</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAstroData(null);
                  setHdData(null);
                  setBirthData(null);
                }}
              >
                New Chart
              </Button>
            </div>

            {/* Reading Flow */}
            <ReadingFlow birthData={birthData!} astroData={astroData} hdData={hdData} />
          </div>
        )}
      </div>
    </main>
  );
}
