import type { Metadata } from "next";
import { Inter } from "next/font/google";
import CosmicBackground from "@/components/layout/cosmic-background";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LightBloom Healing - Astrology & Human Design",
  description:
    "Generate your personalized natal chart, 2026 transit reading, and Human Design report powered by AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <div className="relative min-h-screen">
          <CosmicBackground />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
