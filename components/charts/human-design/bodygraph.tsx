"use client";

import { HumanDesignChart, HD_TYPE_STRATEGIES } from "@/types/human-design";
import { CENTER_POSITIONS, CHANNEL_PATHS } from "./layout-constants";
import Center from "./center";
import Channel from "./channel";

interface BodygraphProps {
  chart: HumanDesignChart;
}

export default function Bodygraph({ chart }: BodygraphProps) {
  const { centers, channels, gates, type, authority, profile, definition } = chart;

  // Build a lookup: center name -> defined boolean
  const centerDefined: Record<string, boolean> = {};
  for (const c of centers) {
    centerDefined[c.name.toLowerCase()] = c.defined;
  }

  // Build a lookup: channel gate pair key -> channel data
  const channelLookup: Record<string, typeof channels[number]> = {};
  for (const ch of channels) {
    const key = [...ch.gates].sort((a, b) => a - b).join("-");
    channelLookup[key] = ch;
  }

  // Build gate activation lookups for personality/design coloring
  const personalityGates = new Set<number>();
  const designGates = new Set<number>();
  for (const g of gates) {
    if (g.isPersonality) {
      personalityGates.add(g.gate);
    } else {
      designGates.add(g.gate);
    }
  }

  /**
   * Check whether a channel (by gate pair) has personality or design activations.
   * A channel is activated when both of its gates are activated.
   * We check if at least one gate in the pair has personality, and if at least one has design.
   */
  function getChannelActivation(gateA: number, gateB: number) {
    const hasPersonality =
      personalityGates.has(gateA) || personalityGates.has(gateB);
    const hasDesign = designGates.has(gateA) || designGates.has(gateB);
    return { hasPersonality, hasDesign };
  }

  const strategy = HD_TYPE_STRATEGIES[type] ?? "";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* SVG Bodygraph */}
      <svg
        viewBox="0 0 400 620"
        className="w-full h-full max-w-[400px] max-h-[620px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="centerGlow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="400" height="620" fill="#0c0a1a" rx="8" />

        {/* Title text */}
        <text
          x="200"
          y="20"
          textAnchor="middle"
          fill="#c084fc"
          fontSize="13"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          Bodygraph
        </text>

        {/* Render channels first (behind centers) */}
        {CHANNEL_PATHS.map((chDef, i) => {
          const key = [...chDef.gates].sort((a, b) => a - b).join("-");
          const chartChannel = channelLookup[key];
          const isDefined = chartChannel?.defined ?? false;

          const fromCenter = CENTER_POSITIONS[chDef.centerFrom];
          const toCenter = CENTER_POSITIONS[chDef.centerTo];

          if (!fromCenter || !toCenter) return null;

          const { hasPersonality, hasDesign } = getChannelActivation(
            chDef.gates[0],
            chDef.gates[1]
          );

          return (
            <Channel
              key={`channel-${i}`}
              fromX={fromCenter.x}
              fromY={fromCenter.y}
              toX={toCenter.x}
              toY={toCenter.y}
              defined={isDefined}
              hasPersonality={isDefined ? hasPersonality : false}
              hasDesign={isDefined ? hasDesign : false}
            />
          );
        })}

        {/* Render all 9 centers */}
        {Object.entries(CENTER_POSITIONS).map(([name, layout]) => {
          const isDefined = centerDefined[name] ?? false;

          return (
            <Center
              key={name}
              name={name}
              x={layout.x}
              y={layout.y}
              shape={layout.shape}
              width={layout.width}
              height={layout.height}
              defined={isDefined}
            />
          );
        })}
      </svg>

      {/* Info panel below the chart */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm w-full max-w-[400px]">
        <InfoRow label="Type" value={type} />
        <InfoRow label="Strategy" value={strategy} />
        <InfoRow label="Authority" value={authority} />
        <InfoRow
          label="Profile"
          value={`${profile.personalityLine}/${profile.designLine} ${profile.name}`}
        />
        <InfoRow label="Definition" value={definition} />
        {chart.incarnationCross && (
          <div className="col-span-2">
            <InfoRow
              label="Incarnation Cross"
              value={chart.incarnationCross.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-gray-100 font-medium">{value}</span>
    </div>
  );
}
