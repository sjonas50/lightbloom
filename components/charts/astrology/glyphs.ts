// Unicode symbols for zodiac signs
export const ZODIAC_GLYPHS: Record<string, string> = {
  Aries: "\u2648",
  Taurus: "\u2649",
  Gemini: "\u264A",
  Cancer: "\u264B",
  Leo: "\u264C",
  Virgo: "\u264D",
  Libra: "\u264E",
  Scorpio: "\u264F",
  Sagittarius: "\u2650",
  Capricorn: "\u2651",
  Aquarius: "\u2652",
  Pisces: "\u2653",
};

// Unicode symbols for planets
export const PLANET_GLYPHS: Record<string, string> = {
  Sun: "\u2609",
  Moon: "\u263D",
  Mercury: "\u263F",
  Venus: "\u2640",
  Mars: "\u2642",
  Jupiter: "\u2643",
  Saturn: "\u2644",
  Uranus: "\u2645",
  Neptune: "\u2646",
  Pluto: "\u2647",
  "North Node": "\u260A",
  "South Node": "\u260B",
  Chiron: "\u26B7",
};

// Colors grouped by element:
// Fire signs (Aries, Leo, Sagittarius) - reds/oranges
// Earth signs (Taurus, Virgo, Capricorn) - greens
// Air signs (Gemini, Libra, Aquarius) - yellows/golds
// Water signs (Cancer, Scorpio, Pisces) - blues
export const ZODIAC_COLORS: Record<string, string> = {
  Aries: "#ef4444",
  Taurus: "#22c55e",
  Gemini: "#eab308",
  Cancer: "#3b82f6",
  Leo: "#f97316",
  Virgo: "#16a34a",
  Libra: "#facc15",
  Scorpio: "#2563eb",
  Sagittarius: "#dc2626",
  Capricorn: "#15803d",
  Aquarius: "#ca8a04",
  Pisces: "#1d4ed8",
};

// Aspect line colors matching the chart cosmic theme
export const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#22d3ee",
  sextile: "#4ade80",
  square: "#f87171",
  trine: "#60a5fa",
  opposition: "#f87171",
  "semi-sextile": "#a78bfa",
  quincunx: "#a78bfa",
};
