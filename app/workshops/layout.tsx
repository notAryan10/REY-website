import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Workshops",
  description: "Hands-on game dev workshops run by the REY collective. Level up your skills and earn XP.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
