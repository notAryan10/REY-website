import React from "react";
import { getEvents } from "@/lib/data";
import { EventsClient } from "@/components/events/EventsClient";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Events — REY Community",
  description: "Join upcoming events, game jams, and workshops. Compete with other digital architects and earn XP.",
};

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "spectator";
  const events = await getEvents(userRole);

  return <EventsClient initialEvents={events} />;
}
