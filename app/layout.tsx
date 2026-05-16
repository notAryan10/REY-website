import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AchievementPopup } from "@/components/ui/AchievementPopup";
import CustomCursor from "@/components/ui/CustomCursor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pixel = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "REY - Game Dev Club",
    template: "%s | REY"
  },
  description: "A premium, game-inspired UI system for the REY community.",
  keywords: ["game dev", "minecraft", "architects", "digital builders", "game jams", "REY club"],
  authors: [{ name: "REY Collective" }],
  creator: "REY Collective",
  publisher: "REY Collective",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${pixel.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-text-primary overflow-x-hidden">
        <SessionProvider>
          <CustomCursor />
          {/* Retro Filter Layers */}
          <div className="retro-overlay" />
          <div className="retro-vignette" />
          <div className="retro-flicker" />
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('/textures/dark-matter.png')]" />
          
          <Navbar />
          <AchievementPopup />
          
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
