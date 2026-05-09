import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import { getUserFromSession, requireRole } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const session = await getUserFromSession();
    const userRole = session?.user?.role || "spectator";

    const query: { isPublic?: boolean; type?: string | { $ne: string } } = {};

    // If spectator, only show public events and filter out workshops (which are always private)
    if (userRole === "spectator") {
      query.isPublic = true;
      query.type = { $ne: "workshop" };
    }

    const events = await Event.find(query).sort({ date: 1 });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession();

    try {
      requireRole(session, ["Founder", "Core Architect", "architect"]);
    } catch {
      return NextResponse.json({ error: "Forbidden: Elevated Clearance Required" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { title, description, date, type, accent, location, players, submissionDate, leaderboard } = body;

    if (!title || !description || !date || !type) {
      return NextResponse.json({ error: "Missing required fields: title, description, date, type" }, { status: 400 });
    }

    if (title.length < 3) {
      return NextResponse.json({ error: "Invalid title: Min 3 characters required." }, { status: 400 });
    }

    // Business Logic: Workshops are always private
    const isPublic = type === "workshop" ? false : (body.isPublic !== undefined ? body.isPublic : true);

    const newEvent = await Event.create({
      title,
      description,
      date,
      type,
      accent: accent || "sky",
      isPublic,
      createdBy: session?.user?.id,
      location,
      players,
      submissionDate,
      leaderboard,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
