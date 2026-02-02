"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { StreamingText } from "@/components/reading/streaming-text";
import ProgressIndicator from "@/components/reading/progress-indicator";
import ReadingSection from "@/components/reading/reading-section";
import NatalWheel from "@/components/charts/astrology/natal-wheel";
import Bodygraph from "@/components/charts/human-design/bodygraph";
import DownloadReportButton from "@/components/reading/download-report-button";
import { HD_TYPE_STRATEGIES, HD_TYPE_SIGNATURES } from "@/types/human-design";
import type { BirthData } from "@/lib/validators/birth-data";
import type { ChartCalculationResult } from "@/types/astrology";
import type { HumanDesignChart } from "@/types/human-design";

type ReadingType = "natal" | "transit-2026" | "human-design" | "synthesis";

interface ReadingFlowProps {
  birthData: BirthData;
  astroData: ChartCalculationResult;
  hdData: HumanDesignChart | null;
}

const STEPS_WITH_HD = [
  { key: "natal", label: "Natal Chart" },
  { key: "transit-2026", label: "2026 Forecast" },
  { key: "human-design", label: "Human Design" },
  { key: "synthesis", label: "Synthesis" },
];

const STEPS_WITHOUT_HD = [
  { key: "natal", label: "Natal Chart" },
  { key: "transit-2026", label: "2026 Forecast" },
];

export default function ReadingFlow({ birthData, astroData, hdData }: ReadingFlowProps) {
  const [readingText, setReadingText] = useState<Record<string, string>>({});
  const [readingLoading, setReadingLoading] = useState<Record<string, boolean>>({});
  const [readingError, setReadingError] = useState<Record<string, string>>({});
  const [activeReading, setActiveReading] = useState<ReadingType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const natalWheelRef = useRef<HTMLDivElement>(null);
  const bodygraphRef = useRef<HTMLDivElement>(null);

  const steps = hdData ? STEPS_WITH_HD : STEPS_WITHOUT_HD;
  const completedSteps = new Set(
    steps.filter((s) => readingText[s.key] && !readingLoading[s.key]).map((s) => s.key)
  );
  const allComplete = steps.every((s) => completedSteps.has(s.key));

  const generateSingleReading = useCallback(
    async (type: ReadingType, signal: AbortSignal) => {
      setActiveReading(type);
      setReadingLoading((prev) => ({ ...prev, [type]: true }));
      setReadingError((prev) => ({ ...prev, [type]: "" }));
      setReadingText((prev) => ({ ...prev, [type]: "" }));

      try {
        const response = await fetch("/api/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            astroData: astroData,
            hdData: hdData,
            readingType: type,
          }),
          signal,
        });

        if (!response.ok) {
          throw new Error("Failed to start reading generation");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No response stream");

        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setReadingText((prev) => ({ ...prev, [type]: accumulated }));
        }
      } catch (error) {
        if (signal.aborted) return;
        setReadingError((prev) => ({
          ...prev,
          [type]: error instanceof Error ? error.message : "Reading failed",
        }));
      } finally {
        setReadingLoading((prev) => ({ ...prev, [type]: false }));
      }
    },
    [astroData, hdData]
  );

  const generateAllReadings = useCallback(async () => {
    setIsGenerating(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const order: ReadingType[] = hdData
      ? ["natal", "transit-2026", "human-design", "synthesis"]
      : ["natal", "transit-2026"];

    for (const type of order) {
      if (controller.signal.aborted) break;
      await generateSingleReading(type, controller.signal);
    }

    setActiveReading(null);
    setIsGenerating(false);
  }, [hdData, generateSingleReading]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setActiveReading(null);
    setReadingLoading({});
  }, []);

  const hasStarted = Object.keys(readingText).length > 0 || isGenerating;

  return (
    <div className="space-y-6">
      {/* Hidden chart containers for PDF capture — always mounted regardless
          of section expand/collapse state so refs are never null.
          Positioned off-screen but with explicit dimensions so SVGs render. */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: 0, width: 800, height: 800, overflow: "hidden" }}
      >
        <div ref={natalWheelRef} style={{ width: 800, height: 800 }}>
          <NatalWheel chart={astroData.natal} />
        </div>
        {hdData && (
          <div ref={bodygraphRef} style={{ width: 400, height: 700 }}>
            <Bodygraph chart={hdData} />
          </div>
        )}
      </div>

      <ProgressIndicator
        steps={steps}
        completedSteps={completedSteps}
        activeStep={activeReading}
      />

      {!hasStarted && (
        <div className="text-center">
          <Button size="lg" onClick={generateAllReadings}>
            Generate Complete Reading
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            {hdData
              ? "Generates natal chart, 2026 forecast, Human Design, and synthesis readings"
              : "Generates natal chart and 2026 forecast readings"}
          </p>
        </div>
      )}

      {isGenerating && !activeReading && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={handleStop}>
            Stop Generation
          </Button>
        </div>
      )}

      {/* Natal Chart Section */}
      {(readingText["natal"] || readingLoading["natal"]) && (
        <ReadingSection
          title="Natal Chart Reading"
          isActive={activeReading === "natal"}
          isComplete={!!readingText["natal"] && !readingLoading["natal"]}
          chartSlot={
            <div>
              <NatalWheel chart={astroData.natal} />
            </div>
          }
          dataSlot={
            <div className="space-y-1 text-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Planetary Positions
              </h3>
              {astroData.natal.planets.map((p) => (
                <div key={p.planet} className="flex justify-between py-0.5">
                  <span className="text-foreground">
                    {p.planet}
                    {p.retrograde ? " (R)" : ""}
                  </span>
                  <span className="text-muted-foreground">
                    {p.degree}&deg; {p.sign} &middot; House {p.house}
                  </span>
                </div>
              ))}
            </div>
          }
          readingSlot={
            <StreamingText
              text={readingText["natal"] || ""}
              isLoading={readingLoading["natal"] || false}
              error={readingError["natal"]}
            />
          }
        />
      )}

      {/* Transit Section */}
      {(readingText["transit-2026"] || readingLoading["transit-2026"]) && (
        <ReadingSection
          title="2026 Transit Forecast"
          isActive={activeReading === "transit-2026"}
          isComplete={!!readingText["transit-2026"] && !readingLoading["transit-2026"]}
          dataSlot={
            <div className="space-y-3 text-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Key Transits
              </h3>
              {astroData.transits2026.slice(0, 12).map((t, i) => (
                <div key={i} className="rounded border border-border/30 p-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">
                      {t.transitPlanet} {t.aspectType} {t.natalPlanet}
                    </span>
                    <span className="text-xs text-muted-foreground">{t.date}</span>
                  </div>
                  {t.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          }
          readingSlot={
            <StreamingText
              text={readingText["transit-2026"] || ""}
              isLoading={readingLoading["transit-2026"] || false}
              error={readingError["transit-2026"]}
            />
          }
        />
      )}

      {/* Human Design Section */}
      {hdData && (readingText["human-design"] || readingLoading["human-design"]) && (
        <ReadingSection
          title="Human Design Reading"
          isActive={activeReading === "human-design"}
          isComplete={!!readingText["human-design"] && !readingLoading["human-design"]}
          chartSlot={
            <div>
              <Bodygraph chart={hdData} />
            </div>
          }
          dataSlot={
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="font-medium">{hdData.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Strategy:</span>{" "}
                  <span className="font-medium">
                    {HD_TYPE_STRATEGIES[hdData.type]}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Authority:</span>{" "}
                  <span className="font-medium">{hdData.authority}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Profile:</span>{" "}
                  <span className="font-medium">{hdData.profile.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Signature:</span>{" "}
                  <span className="font-medium">
                    {HD_TYPE_SIGNATURES[hdData.type]}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Definition:</span>{" "}
                  <span className="font-medium">{hdData.definition}</span>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Gate Activations
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="mb-1 font-medium text-foreground">
                      Personality
                    </h5>
                    {hdData.gates
                      .filter((g) => g.isPersonality)
                      .map((g, i) => (
                        <div key={i} className="flex justify-between py-0.5">
                          <span>
                            Gate {g.gate}.{g.line}
                          </span>
                          <span className="text-muted-foreground">{g.planet}</span>
                        </div>
                      ))}
                  </div>
                  <div>
                    <h5 className="mb-1 font-medium text-red-400">Design</h5>
                    {hdData.gates
                      .filter((g) => !g.isPersonality)
                      .map((g, i) => (
                        <div key={i} className="flex justify-between py-0.5">
                          <span>
                            Gate {g.gate}.{g.line}
                          </span>
                          <span className="text-muted-foreground">{g.planet}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          }
          readingSlot={
            <StreamingText
              text={readingText["human-design"] || ""}
              isLoading={readingLoading["human-design"] || false}
              error={readingError["human-design"]}
            />
          }
        />
      )}

      {/* Synthesis Section */}
      {hdData && (readingText["synthesis"] || readingLoading["synthesis"]) && (
        <ReadingSection
          title="Integrated Synthesis"
          isActive={activeReading === "synthesis"}
          isComplete={!!readingText["synthesis"] && !readingLoading["synthesis"]}
          readingSlot={
            <StreamingText
              text={readingText["synthesis"] || ""}
              isLoading={readingLoading["synthesis"] || false}
              error={readingError["synthesis"]}
            />
          }
        />
      )}

      {/* Consultation CTA */}
      {allComplete && (
        <div className="rounded-lg border border-border/50 bg-card/80 p-6 text-center backdrop-blur-sm">
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            Want Help Understanding Your Reading?
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Book a personal consultation to explore your chart in depth, get
            practical guidance, and ask questions about your unique blueprint.
          </p>
          <a
            href="https://www.lightbloomhealing.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            Book a Consultation
          </a>
        </div>
      )}

      {/* Download Report */}
      {allComplete && (
        <div className="text-center">
          <DownloadReportButton
            birthData={birthData}
            astroData={astroData}
            hdData={hdData}
            readings={readingText}
            natalWheelRef={natalWheelRef}
            bodygraphRef={bodygraphRef}
          />
        </div>
      )}
    </div>
  );
}
