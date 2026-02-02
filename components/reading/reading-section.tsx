"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReadingSectionProps {
  title: string;
  chartSlot?: ReactNode;
  dataSlot?: ReactNode;
  readingSlot: ReactNode;
  isActive: boolean;
  isComplete: boolean;
  defaultExpanded?: boolean;
}

export default function ReadingSection({
  title,
  chartSlot,
  dataSlot,
  readingSlot,
  isActive,
  isComplete,
  defaultExpanded = true,
}: ReadingSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setExpanded(true);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isActive]);

  return (
    <div ref={sectionRef} className="scroll-mt-4">
      <Card
        className={`border-border/50 bg-card/80 backdrop-blur-sm transition-colors ${
          isActive ? "border-primary/50" : ""
        }`}
      >
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => isComplete && setExpanded((e) => !e)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center gap-2">
              {isActive && (
                <span className="flex items-center gap-1.5 text-xs text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  Generating
                </span>
              )}
              {isComplete && (
                <button
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={expanded ? "Collapse" : "Expand"}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="space-y-6">
                {chartSlot && (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>{chartSlot}</div>
                    {dataSlot && <div>{dataSlot}</div>}
                  </div>
                )}
                {!chartSlot && dataSlot && <div>{dataSlot}</div>}
                <div>{readingSlot}</div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
