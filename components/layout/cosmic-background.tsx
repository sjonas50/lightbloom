"use client";

function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    left: `${((i * 37 + 13) % 100)}%`,
    top: `${((i * 53 + 7) % 100)}%`,
    size: (i % 3) + 1,
    duration: 2 + (i % 5),
    delay: (i % 7) * 0.5,
  }));

  return (
    <>
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            ["--duration" as string]: `${star.duration}s`,
            ["--delay" as string]: `${star.delay}s`,
          }}
        />
      ))}
    </>
  );
}

export default function CosmicBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <StarField />

      {/* Nebula blobs */}
      <div
        className="nebula"
        style={{
          width: 400,
          height: 400,
          left: "10%",
          top: "20%",
          background:
            "radial-gradient(circle, oklch(0.4 0.18 280 / 0.3), transparent 70%)",
          animationDelay: "0s",
        }}
      />
      <div
        className="nebula"
        style={{
          width: 350,
          height: 350,
          right: "5%",
          top: "50%",
          background:
            "radial-gradient(circle, oklch(0.45 0.15 55 / 0.2), transparent 70%)",
          animationDelay: "-5s",
        }}
      />
      <div
        className="nebula"
        style={{
          width: 300,
          height: 300,
          left: "40%",
          bottom: "10%",
          background:
            "radial-gradient(circle, oklch(0.35 0.12 200 / 0.2), transparent 70%)",
          animationDelay: "-10s",
        }}
      />

      {/* Orbital rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="cosmic-ring"
          style={{
            width: 360,
            height: 360,
            marginLeft: -180,
            marginTop: -180,
            borderColor: "oklch(0.72 0.15 55)",
            animationDelay: "0s",
          }}
        />
        <div
          className="cosmic-ring"
          style={{
            width: 520,
            height: 520,
            marginLeft: -260,
            marginTop: -260,
            borderColor: "oklch(0.55 0.18 280)",
            animationDelay: "-3s",
          }}
        />
        <div
          className="cosmic-ring"
          style={{
            width: 700,
            height: 700,
            marginLeft: -350,
            marginTop: -350,
            borderColor: "oklch(0.5 0.12 200)",
            animationDelay: "-6s",
          }}
        />
      </div>
    </div>
  );
}
