import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { getUserFromSession } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserFromSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Role-based access control
    const isAdmin = ["Founder", "Core Architect", "Moderator"].includes(session.user.role);
    const isOwner = project.uploadedBy.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ 
        error: "FORBIDDEN: Insufficient clearance level.",
        details: "Only the project architect or an Administrator can purge this record."
      }, { status: 403 });
    }

    await Project.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: "ARCHIVE_PURGED: Project has been removed from the R.E.Y network.",
      id 
    });
  } catch (error) {
    console.error("Error purging project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
