import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || "spectator";

    let query: any = {};

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
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "architect") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { title, description, date, type, accent, location, players } = body;

    if (!title || !description || !date || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
      createdBy: session.user.id,
      location,
      players,
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
