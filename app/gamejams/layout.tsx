import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Game Jams",
  description: "Create, compete, and win. Upcoming and past game jams hosted by the REY collective.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
