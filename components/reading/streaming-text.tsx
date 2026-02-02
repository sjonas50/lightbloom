"use client";

import { useEffect, useRef } from "react";

interface StreamingTextProps {
  text: string;
  isLoading: boolean;
  error?: string;
}

export function StreamingText({ text, isLoading, error }: StreamingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Failed to generate reading: {error}
        </p>
      </div>
    );
  }

  if (!text && isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">
            Generating your reading...
          </span>
        </div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-muted/50"
              style={{ width: `${70 + Math.random() * 30}%`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!text && !isLoading) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="max-h-[600px] overflow-y-auto rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
    >
      <div className="prose prose-invert prose-sm max-w-none">
        <MarkdownRenderer text={text} />
      </div>
      {isLoading && (
        <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary" />
      )}
    </div>
  );
}

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="mt-6 mb-3 text-base font-semibold text-primary"
        >
          {processInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="mt-8 mb-4 text-lg font-bold text-foreground"
        >
          {processInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={i}
          className="mt-8 mb-4 text-xl font-bold text-foreground"
        >
          {processInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="ml-4 mb-1 list-disc text-foreground/90">
          {processInline(line.slice(2))}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="mb-2 leading-relaxed text-foreground/90">
          {processInline(line)}
        </p>
      );
    }
  }

  return <>{elements}</>;
}

function processInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-semibold text-foreground">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}
