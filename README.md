# LightBloom Healing

Astrology & Human Design readings powered by precise astronomical calculations and Claude AI.

Generate natal charts, 2026 transit forecasts, and Human Design bodygraphs from birth data, then receive deeply personalized AI-written readings that cross-reference both systems. Export everything as a styled PDF report.

## Features

- **Natal Chart** — Planetary positions, house placements, and aspects calculated via Swiss Ephemeris (Moshier method, ~1 arcsecond accuracy)
- **2026 Transit Forecast** — Personalized transit events with exact dates found via binary search refinement, including retrograde multi-pass detection
- **Human Design Bodygraph** — Type, Authority, Profile, Definition, Incarnation Cross, and all gate activations derived from the 88-degree solar arc
- **AI Readings** — Claude Opus 4.5 generates cross-referenced readings across all systems, culminating in an integrated synthesis
- **PDF Report** — Downloadable multi-page report with chart visualizations, data tables, and full reading text
- **Interactive Charts** — SVG natal wheel with collision-avoidant planet placement, and color-coded bodygraph with personality/design channel rendering

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui, Framer Motion
- **Ephemeris:** Swiss Ephemeris via `sweph` (native Node module, Moshier built-in)
- **AI:** Anthropic Claude Opus 4.5 via Vercel AI SDK v6 (streaming)
- **PDF:** jsPDF (client-side generation)
- **Validation:** Zod v4

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- (Optional) An [OpenCage API key](https://opencagedata.com/) for geocoding (falls back to Nominatim)

## Setup

```bash
git clone <repo-url>
cd lightbloom
npm install
```

Create `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENCAGE_API_KEY=...          # optional
NEXT_PUBLIC_CONTACT_EMAIL=... # optional, shown in PDF "Next Steps" page
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
  page.tsx                  # Landing page
  chart/page.tsx            # Chart input form + reading flow
  api/
    calculate/route.ts      # Natal chart + transit calculation
    hd-calculate/route.ts   # Human Design calculation
    reading/route.ts        # AI reading generation (streaming)
    geocode/route.ts        # Location search

lib/
  ephemeris/                # Swiss Ephemeris wrapper
    sweph-wrapper.ts        # Core sweph bindings, JD conversion
    planets.ts              # Planet position calculation
    houses.ts               # House cusp calculation
    aspects.ts              # Aspect detection with luminary-weighted orbs
  astrology/
    natal-chart.ts          # Natal chart orchestrator
    transits.ts             # 2026 transit engine with binary search
    zodiac.ts               # Sign and house derivation
  human-design/
    calculator.ts           # HD chart orchestrator (88-deg solar arc)
    gates.ts                # Longitude-to-gate mapping
    channels.ts             # Channel detection
    centers.ts              # Center definition
    type-derivation.ts      # Type from motor-to-Throat BFS
    authority.ts            # Authority derivation
    profile.ts              # Profile, definition, incarnation cross
    constants.ts            # Gate order, cross names, center-gate map
  ai/
    client.ts               # Prompt formatting + summary helpers
    prompts/                # System prompts for each reading type
  pdf/
    report-generator.ts     # Multi-page PDF with charts and readings
  validators/
    birth-data.ts           # Zod schemas for form + API input

components/
  charts/
    astrology/natal-wheel.tsx   # SVG natal chart wheel
    human-design/bodygraph.tsx  # SVG bodygraph with centers + channels
  reading/
    reading-flow.tsx        # Sequential reading orchestrator
    reading-section.tsx     # Collapsible section wrapper
    streaming-text.tsx      # Markdown streaming renderer
    progress-indicator.tsx  # Step progress bar
    download-report-button.tsx
  layout/
    cosmic-background.tsx   # Animated star field + nebula background

types/
  astrology.ts              # Natal chart, aspect, transit types
  human-design.ts           # HD chart, gate, channel, center types
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/calculate` | POST | Calculate natal chart + 2026 transits |
| `/api/hd-calculate` | POST | Calculate Human Design bodygraph |
| `/api/reading` | POST | Stream AI reading (120s max) |
| `/api/geocode` | GET | Geocode location query |

## Deployment Notes

The `sweph` package is a **native Node module** that compiles C bindings during `npm install`. This means:

- Requires **x86_64 architecture** (or the platform sweph provides binaries for)
- Must use **Node.js runtime** (not edge functions or Cloudflare Workers)
- The `/api/reading` route streams responses for up to **120 seconds** — ensure your hosting platform supports long-lived HTTP connections
- `next.config.ts` already includes `serverExternalPackages: ["sweph"]` to prevent bundling issues

Recommended platforms: **Vercel** (Pro for 120s timeout), **Railway**, **Render**, or any x86_64 VPS.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude AI readings |
| `OPENCAGE_API_KEY` | No | OpenCage geocoding API key (Nominatim fallback) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Displayed on PDF "Next Steps" page |
