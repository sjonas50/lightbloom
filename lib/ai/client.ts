import { anthropic } from "@ai-sdk/anthropic";

export const claudeOpus = anthropic("claude-opus-4-5-20251101");

export function formatNatalChartForAI(chartData: Record<string, unknown>): string {
  const natal = chartData.natal as Record<string, unknown> | undefined;
  const transits = chartData.transits2026 as unknown[] | undefined;

  let output = "## Natal Chart Data\n\n";

  if (natal) {
    const planets = natal.planets as Array<Record<string, unknown>>;
    if (planets) {
      output += "### Planetary Positions\n";
      for (const p of planets) {
        output += `- **${p.planet}**: ${p.degree}° ${p.sign} (${p.longitude}°) in House ${p.house}${p.retrograde ? " [Retrograde]" : ""}\n`;
      }
      output += "\n";
    }

    const houses = natal.houses as Array<Record<string, unknown>>;
    if (houses) {
      output += "### House Cusps\n";
      for (const h of houses) {
        output += `- House ${h.house}: ${h.degree}° ${h.sign}\n`;
      }
      output += "\n";
    }

    output += `### Angles\n`;
    output += `- Ascendant: ${natal.ascendant}°\n`;
    output += `- Midheaven: ${natal.midheaven}°\n\n`;

    const aspects = natal.aspects as Array<Record<string, unknown>>;
    if (aspects && aspects.length > 0) {
      output += "### Aspects\n";
      for (const a of aspects) {
        output += `- ${a.planet1} ${a.type} ${a.planet2} (orb: ${typeof a.orb === "number" ? a.orb.toFixed(1) : a.orb}°, ${a.applying ? "applying" : "separating"})\n`;
      }
      output += "\n";
    }
  }

  if (transits && transits.length > 0) {
    output += "### 2026 Transit Events\n";
    for (const t of transits as Array<Record<string, unknown>>) {
      output += `- **${t.date}**: ${t.transitPlanet} ${t.aspectType} natal ${t.natalPlanet} (${t.description})\n`;
    }
  }

  return output;
}

export function formatNatalSummaryForAI(astroData: Record<string, unknown>): string {
  const natal = astroData.natal as Record<string, unknown> | undefined;
  if (!natal) return "";

  const planets = natal.planets as Array<Record<string, unknown>> | undefined;
  if (!planets) return "";

  const find = (name: string) => planets.find((p) => p.planet === name);
  const sun = find("Sun");
  const moon = find("Moon");
  const mars = find("Mars");
  const ascendant = natal.ascendant;

  let output = "## Cross-Reference: Western Astrology\n";
  if (sun) output += `- Sun: ${sun.degree}\u00b0 ${sun.sign}, House ${sun.house}\n`;
  if (moon) output += `- Moon: ${moon.degree}\u00b0 ${moon.sign}, House ${moon.house}\n`;
  if (ascendant !== undefined) {
    const asc = planets.length > 0 ? `${Math.round(ascendant as number)}\u00b0` : "";
    output += `- Ascendant: ${asc}\n`;
  }
  if (mars) output += `- Mars: ${mars.degree}\u00b0 ${mars.sign}, House ${mars.house}\n`;

  const saturn = find("Saturn");
  if (saturn) output += `- Saturn: ${saturn.degree}\u00b0 ${saturn.sign}, House ${saturn.house}\n`;

  const northNode = find("North Node");
  if (northNode) output += `- North Node: ${northNode.degree}\u00b0 ${northNode.sign}, House ${northNode.house}\n`;

  return output;
}

export function formatHDSummaryForAI(hdData: Record<string, unknown>): string {
  let output = "## Cross-Reference: Human Design\n";
  output += `- Type: ${hdData.type}\n`;
  output += `- Authority: ${hdData.authority}\n`;

  const profile = hdData.profile as Record<string, unknown> | undefined;
  if (profile) output += `- Profile: ${profile.name}\n`;

  output += `- Definition: ${hdData.definition}\n`;

  const cross = hdData.incarnationCross as Record<string, unknown> | undefined;
  if (cross) output += `- Incarnation Cross: ${cross.name} (${cross.angle})\n`;

  const centers = hdData.centers as Array<Record<string, unknown>> | undefined;
  if (centers) {
    const defined = centers.filter((c) => c.defined).map((c) => c.name);
    if (defined.length > 0) output += `- Defined Centers: ${defined.join(", ")}\n`;
  }

  return output;
}

export function formatHDChartForAI(chartData: Record<string, unknown>): string {
  let output = "## Human Design Chart Data\n\n";

  output += `### Core Properties\n`;
  output += `- **Type**: ${chartData.type}\n`;
  output += `- **Authority**: ${chartData.authority}\n`;
  output += `- **Profile**: ${(chartData.profile as Record<string, unknown>)?.name || chartData.profile}\n`;
  output += `- **Definition**: ${chartData.definition}\n`;

  const cross = chartData.incarnationCross as Record<string, unknown>;
  if (cross) {
    output += `- **Incarnation Cross**: ${cross.name} (${cross.angle})\n`;
    output += `  - Personality Sun Gate: ${cross.personalitySunGate}\n`;
    output += `  - Personality Earth Gate: ${cross.personalityEarthGate}\n`;
    output += `  - Design Sun Gate: ${cross.designSunGate}\n`;
    output += `  - Design Earth Gate: ${cross.designEarthGate}\n`;
  }

  const centers = chartData.centers as Array<Record<string, unknown>>;
  if (centers) {
    output += "\n### Centers\n";
    const defined = centers.filter((c) => c.defined);
    const undefined_ = centers.filter((c) => !c.defined);
    output += `**Defined**: ${defined.map((c) => c.name).join(", ") || "None"}\n`;
    output += `**Undefined/Open**: ${undefined_.map((c) => c.name).join(", ") || "None"}\n`;
  }

  const channels = chartData.channels as Array<Record<string, unknown>>;
  if (channels) {
    const definedCh = channels.filter((c) => c.defined);
    if (definedCh.length > 0) {
      output += "\n### Defined Channels\n";
      for (const ch of definedCh) {
        const gates = ch.gates as number[];
        output += `- Channel ${gates[0]}-${gates[1]} (${ch.centerFrom} to ${ch.centerTo})\n`;
      }
    }
  }

  const gates = chartData.gates as Array<Record<string, unknown>>;
  if (gates) {
    output += "\n### Gate Activations\n";
    output += "**Personality (Conscious)**:\n";
    for (const g of gates.filter((g) => g.isPersonality)) {
      output += `- Gate ${g.gate}.${g.line} (${g.planet})\n`;
    }
    output += "\n**Design (Unconscious)**:\n";
    for (const g of gates.filter((g) => !g.isPersonality)) {
      output += `- Gate ${g.gate}.${g.line} (${g.planet})\n`;
    }
  }

  return output;
}
