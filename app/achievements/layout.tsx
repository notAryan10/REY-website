import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Achievement Vault",
  description: "Track your progression, unlocked achievements, and history across the REY collective.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
