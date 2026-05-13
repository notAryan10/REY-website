import React from "react";
import { getFrontierData } from "@/lib/data";
import { HomeClient } from "@/components/home/HomeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "R.E.Y — Home of Digital Architects",
  description: "Join the most ambitious collective of digital builders and pioneers. Explore game jams, megaprojects, and level up your skills in virtual world building.",
  openGraph: {
    title: "R.E.Y — Respawn Every Year",
    description: "The ultimate destination for digital architects and competitive pioneers.",
    images: ["/hero.png"],
  },
};

export default async function Home() {
  const data = await getFrontierData();

  return (
    <HomeClient 
      latestEvent={data.latestEvent}
      latestProject={data.latestProject}
      latestResource={data.latestResource}
    />
  );
}
