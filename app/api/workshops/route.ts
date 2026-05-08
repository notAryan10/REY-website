import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
  try {
    await dbConnect();
    // const session = await getUserFromSession();
    // const userRole = session?.user?.role || "spectator";

    const query: { type: string } = { type: "workshop" };

    // If spectator, they can only see workshops if they are public
    // AND the UI should show them as locked.
    // Business rule says workshops are always isPublic: false, 
    // but for the UI to show "locked" cards, we need to return them 
    // OR have a separate logic.
    
    // Requested Logic: Workshops Page for Spectators: Show cards BUT Locked UI.
    // So for the Workshops page specifically, we should return all workshops 
    // even to spectators, but the frontend will handle locking.

    const workshops = await Event.find(query).sort({ date: 1 });

    return NextResponse.json(workshops);
  } catch (error) {
    console.error("Error fetching workshops:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
