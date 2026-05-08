import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import { getUserFromSession, requireRole } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const session = await getUserFromSession();
    const userRole = session?.user?.role || "spectator";

    // Access control logic
    if (event.type === "workshop" || !event.isPublic) {
      if (!session) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      
      if (userRole === "spectator") {
        return NextResponse.json({ error: "Forbidden: Members only" }, { status: 403 });
      }
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getUserFromSession();

    try {
      requireRole(session, ["architect"]);
    } catch (err) {
      return NextResponse.json({ error: "Forbidden: Architect Clearance Required" }, { status: 403 });
    }

    await dbConnect();
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Also delete associated resources if needed?
    // For now, just delete the event.
    
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getUserFromSession();

    try {
      requireRole(session, ["architect"]);
    } catch (err) {
      return NextResponse.json({ error: "Forbidden: Architect Clearance Required" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    
    // Construct update object with only provided fields
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) {
      const d = new Date(body.date);
      if (!isNaN(d.getTime())) updateData.date = d;
    }

    if (body.type !== undefined) updateData.type = body.type;
    if (body.accent !== undefined) updateData.accent = body.accent;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.players !== undefined) updateData.players = body.players;
    
    if (body.submissionDate !== undefined) {
      if (body.submissionDate === "" || body.submissionDate === null) {
        updateData.submissionDate = null;
      } else {
        const d = new Date(body.submissionDate);
        if (!isNaN(d.getTime())) updateData.submissionDate = d;
      }
    }
    
    if (body.leaderboard !== undefined) updateData.leaderboard = body.leaderboard;

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
