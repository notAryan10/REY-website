import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession, hasPermission } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserFromSession();

    if (!session || !hasPermission(session, "DELETE_CONTENT")) {
      return NextResponse.json({ error: "Forbidden: Architect Clearance Required" }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Invalid or missing ID parameter" }, { status: 400 });
    }

    if (session.user.id === id) {
      return NextResponse.json({ error: "Cannot purge your own identity" }, { status: 400 });
    }

    await dbConnect();

    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return NextResponse.json({ error: "User identity not found in database" }, { status: 404 });
    }

    // Protect Founder
    if (userToDelete.role === "Founder") {
       return NextResponse.json({ error: "Cannot purge the Founder" }, { status: 400 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: "User identity purged successfully", 
      id: id 
    });
  } catch (error) {
    console.error("DEBUG: User deletion failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
