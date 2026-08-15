import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Daily Operations",
  description: "Realtime daily objectives and quests. Keep your streak alive and climb the leaderboard.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
