/**
 * Reference Implementation: /api/reading Route Handler
 *
 * This is the most architecturally significant endpoint in Lightbloom.
 * It demonstrates:
 * 1. Vercel AI SDK v6 integration with Claude Opus 4.5
 * 2. Streaming SSE responses to the client
 * 3. Tool use (web search) during generation
 * 4. Structured chart data passed as context to the AI
 *
 * NOTE: This is a reference implementation for architectural documentation.
 * The actual implementation may differ in details.
 */

import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

// Vercel serverless function configuration
export const maxDuration = 60; // 60 second timeout for streaming
export const runtime = "nodejs";

// Request validation schema
const ReadingRequestSchema = z.object({
  chartData: z.record(z.unknown()), // Natal or HD chart data
  readingType: z.enum(["natal", "transit-2026", "human-design"]),
});

// System prompts by reading type
const SYSTEM_PROMPTS: Record<string, string> = {
  natal: `You are an expert astrologer providing a detailed natal chart reading.
You have deep knowledge of planetary placements, house meanings, aspects, and their
psychological and life-path implications. Provide warm, insightful, and specific
interpretations based on the exact chart data provided. Structure your reading with
clear sections for Sun, Moon, Rising, and major planetary placements.`,

  "transit-2026": `You are an expert astrologer providing a 2026 transit forecast.
You have the user's natal chart positions and the major planetary transits occurring
in 2026. Provide month-by-month highlights focusing on the most significant transits
to their natal planets. Use your web search tool to find current astrological context
about 2026 planetary movements. Be specific about dates and what areas of life
each transit activates.`,

  "human-design": `You are an expert Human Design analyst providing a comprehensive
bodygraph reading. You understand the mechanics of Type, Authority, Profile, Definition,
Centers, Channels, and Gates. Provide a reading that covers: their Type and Strategy,
their Authority and how to use it for decision-making, their Profile and life theme,
their defined and undefined centers, and their most significant channel activations.
Be practical and actionable in your guidance.`,
};

export async function POST(request: Request) {
  const body = await request.json();
  const { chartData, readingType } = ReadingRequestSchema.parse(body);

  const systemPrompt = SYSTEM_PROMPTS[readingType];

  // Format chart data as structured context for the AI
  const userMessage = formatChartDataForAI(chartData, readingType);

  const result = streamText({
    model: anthropic("claude-opus-4-5-20251101"),
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
    tools: {
      web_search: {
        description:
          "Search the web for current astrological information, planetary transit dates, or astrological interpretive context for 2026.",
        parameters: z.object({
          query: z
            .string()
            .describe("The search query for astrological information"),
        }),
        // The Anthropic provider handles web search natively via Claude's
        // built-in web search tool. For custom search, you would implement
        // the execute function here.
      },
    },
    maxTokens: 4096,
    temperature: 0.7, // Slightly creative for interpretive readings
  });

  // Return streaming response using the AI SDK's built-in SSE formatting
  return result.toDataStreamResponse();
}

/**
 * Format chart calculation data into a clear, structured prompt for Claude.
 * This ensures the AI has precise data to interpret rather than guessing.
 */
function formatChartDataForAI(
  chartData: Record<string, unknown>,
  readingType: string
): string {
  if (readingType === "natal" || readingType === "transit-2026") {
    return `Please provide a ${readingType === "natal" ? "natal chart" : "2026 transit"} reading based on the following chart data:

## Natal Chart Positions
${JSON.stringify(chartData, null, 2)}

Please interpret these positions thoroughly, covering all major placements and aspects.`;
  }

  if (readingType === "human-design") {
    return `Please provide a Human Design reading based on the following bodygraph data:

## Human Design Chart Data
${JSON.stringify(chartData, null, 2)}

Please provide a comprehensive reading covering Type, Authority, Profile, Centers, and significant Channel activations.`;
  }

  return JSON.stringify(chartData);
}
