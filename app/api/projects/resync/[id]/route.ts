import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { getUserFromSession } from "@/lib/auth";
import { fetchItchProjectMetadata } from "@/lib/itch";

export async function POST(
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

    if (project.uploadedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized: You do not own this project" }, { status: 403 });
    }

    if (!project.itchIoUrl) {
      return NextResponse.json({ error: "Project is not linked to Itch.io" }, { status: 400 });
    }

    const metadata = await fetchItchProjectMetadata(project.itchIoUrl);
    
    // Update project with new metadata
    if (metadata.title) project.title = metadata.title;
    if (metadata.description) project.description = metadata.description;
    if (metadata.coverImage) project.coverImage = metadata.coverImage;
    if (metadata.engine) project.engine = metadata.engine;
    
    project.syncStatus = "synced";
    project.verified = true;
    
    await project.save();

    return NextResponse.json({ 
      message: "Project resynced successfully",
      project 
    });
  } catch (error) {
    console.error("Error resyncing project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
