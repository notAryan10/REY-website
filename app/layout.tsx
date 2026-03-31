import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { SessionProvider } from "@/components/providers/SessionProvider";

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
  title: "REY - Minecraft Inspired Website",
  description: "A premium, game-inspired UI system for the REY community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${pixel.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary overflow-x-hidden">
        <SessionProvider>
          {/* Global Texture Overlay */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
          
          <Navbar />
          
          <PageTransition>
            {children}
          </PageTransition>
        </SessionProvider>
      </body>
    </html>
  );
}
