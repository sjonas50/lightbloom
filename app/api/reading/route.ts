import { streamText } from "ai";
import {
  claudeOpus,
  formatNatalChartForAI,
  formatHDChartForAI,
  formatNatalSummaryForAI,
  formatHDSummaryForAI,
} from "@/lib/ai/client";
import { NATAL_READING_SYSTEM_PROMPT } from "@/lib/ai/prompts/natal-reading";
import { TRANSIT_READING_SYSTEM_PROMPT } from "@/lib/ai/prompts/transit-reading";
import { HD_READING_SYSTEM_PROMPT } from "@/lib/ai/prompts/hd-reading";
import { SYNTHESIS_READING_SYSTEM_PROMPT } from "@/lib/ai/prompts/synthesis-reading";
import { readingRequestSchema } from "@/lib/validators/birth-data";

export const maxDuration = 120;
export const runtime = "nodejs";

const SYSTEM_PROMPTS: Record<string, string> = {
  natal: NATAL_READING_SYSTEM_PROMPT,
  "transit-2026": TRANSIT_READING_SYSTEM_PROMPT,
  "human-design": HD_READING_SYSTEM_PROMPT,
  synthesis: SYNTHESIS_READING_SYSTEM_PROMPT,
};

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = readingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { astroData, hdData, readingType } = parsed.data;
  const systemPrompt = SYSTEM_PROMPTS[readingType];

  if (!systemPrompt) {
    return new Response(
      JSON.stringify({ error: `Unknown reading type: ${readingType}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let formattedData: string;

  if (readingType === "human-design") {
    formattedData = hdData ? formatHDChartForAI(hdData) : "";
    if (astroData) formattedData += "\n\n" + formatNatalSummaryForAI(astroData);
  } else if (readingType === "synthesis") {
    formattedData = "";
    if (astroData) formattedData += formatNatalChartForAI(astroData);
    if (hdData) formattedData += "\n\n" + formatHDChartForAI(hdData);
  } else {
    formattedData = astroData ? formatNatalChartForAI(astroData) : "";
    if (hdData) formattedData += "\n\n" + formatHDSummaryForAI(hdData);
  }

  const PROMPTS: Record<string, string> = {
    natal: `Please provide a comprehensive natal chart reading based on the following chart data.\n\n${formattedData}`,
    "transit-2026": `Please provide a comprehensive, personalized 2026 transit forecast based on the following natal chart data.\n\n${formattedData}`,
    "human-design": `Please provide a comprehensive Human Design reading based on the following bodygraph data.\n\n${formattedData}`,
    synthesis: `Please provide an integrative synthesis reading that connects the Western astrology natal chart and Human Design bodygraph data below into a unified life guide.\n\n${formattedData}`,
  };

  const prompt = PROMPTS[readingType];

  const result = streamText({
    model: claudeOpus,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
    maxOutputTokens: 16384,
  });

  return result.toTextStreamResponse();
}
