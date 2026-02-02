"use client";

interface Step {
  key: string;
  label: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  completedSteps: Set<string>;
  activeStep: string | null;
}

export default function ProgressIndicator({
  steps,
  completedSteps,
  activeStep,
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {steps.map((step, i) => {
        const isCompleted = completedSteps.has(step.key);
        const isActive = activeStep === step.key;

        return (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "border-2 border-primary bg-primary/20 text-primary"
                      : "border border-muted-foreground/30 text-muted-foreground/50"
                }`}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`hidden text-xs sm:inline ${
                  isCompleted || isActive
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-4 sm:w-8 ${
                  isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
