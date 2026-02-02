import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <div className="mb-8">
          <h1 className="mb-2 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Light<span className="text-primary">Bloom</span>
          </h1>
          <p className="text-xl font-light tracking-wide text-muted-foreground">
            Healing
          </p>
          <p className="mt-3 text-base text-muted-foreground">
            Astrology & Human Design, Illuminated by AI
          </p>
        </div>

        <p className="mb-10 leading-relaxed text-muted-foreground">
          Discover your natal chart, explore your 2026 cosmic forecast, and
          unlock your Human Design blueprint. Powered by precise astronomical
          calculations and Claude AI for deeply personalized readings.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/chart"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            Generate Your Chart
          </Link>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="group rounded-lg border border-border/50 bg-card/30 p-6 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-card/50">
            <div className="mb-3 text-2xl transition-transform group-hover:scale-110">
              &#9790;
            </div>
            <h3 className="mb-1 font-semibold text-foreground">Natal Chart</h3>
            <p className="text-sm text-muted-foreground">
              Precise planetary positions, houses, and aspects at the moment of
              your birth.
            </p>
          </div>
          <div className="group rounded-lg border border-border/50 bg-card/30 p-6 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-card/50">
            <div className="mb-3 text-2xl transition-transform group-hover:scale-110">
              &#9733;
            </div>
            <h3 className="mb-1 font-semibold text-foreground">
              2026 Forecast
            </h3>
            <p className="text-sm text-muted-foreground">
              Personalized transit reading for 2026 including eclipses,
              retrogrades, and major alignments.
            </p>
          </div>
          <div className="group rounded-lg border border-border/50 bg-card/30 p-6 backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-card/50">
            <div className="mb-3 text-2xl transition-transform group-hover:scale-110">
              &#9672;
            </div>
            <h3 className="mb-1 font-semibold text-foreground">
              Human Design
            </h3>
            <p className="text-sm text-muted-foreground">
              Your unique bodygraph with Type, Authority, Profile, and detailed
              channel analysis.
            </p>
          </div>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Personal consultations available &mdash;{" "}
          <a
            href="https://www.lightbloomhealing.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            book a session
          </a>{" "}
          for a deeper, guided reading.
        </p>
      </div>
    </main>
  );
}
