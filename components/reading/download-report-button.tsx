"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateReport } from "@/lib/pdf/report-generator";
import type { BirthData } from "@/lib/validators/birth-data";
import type { ChartCalculationResult } from "@/types/astrology";
import type { HumanDesignChart } from "@/types/human-design";

interface DownloadReportButtonProps {
  birthData: BirthData;
  astroData: ChartCalculationResult;
  hdData: HumanDesignChart | null;
  readings: Record<string, string>;
  natalWheelRef: React.RefObject<HTMLDivElement | null>;
  bodygraphRef: React.RefObject<HTMLDivElement | null>;
}

export default function DownloadReportButton({
  birthData,
  astroData,
  hdData,
  readings,
  natalWheelRef,
  bodygraphRef,
}: DownloadReportButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      await generateReport({
        birthData,
        astroData,
        hdData,
        readings,
        natalWheelRef,
        bodygraphRef,
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handleDownload}
      disabled={generating}
      className="border-primary/50 hover:bg-primary/10"
    >
      {generating ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="32"
              strokeLinecap="round"
            />
          </svg>
          Generating PDF...
        </>
      ) : (
        <>
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF Report
        </>
      )}
    </Button>
  );
}
