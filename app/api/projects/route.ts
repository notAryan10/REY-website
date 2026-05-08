import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const projects = await Project.find({ status: "published" })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name role");
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, accent, tag, itchIoUrl } = await req.json();

    // Validation
    if (!title || !description || !accent || !tag || !itchIoUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (title.length < 3) {
      return NextResponse.json({ error: "Title too short" }, { status: 400 });
    }

    await dbConnect();
    const newProject = await Project.create({
      title,
      description,
      accent,
      tag,
      itchIoUrl,
      uploadedBy: session.user.id,
      status: "published", // Default to published for now
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
