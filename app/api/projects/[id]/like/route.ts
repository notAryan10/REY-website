import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { getUserFromSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getUserFromSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const likedIndex = project.likes.indexOf(userId);

    if (likedIndex === -1) {
      // Like
      project.likes.push(userId);
    } else {
      // Unlike
      project.likes.splice(likedIndex, 1);
    }

    await project.save();

    return NextResponse.json({ 
      likes: project.likes.length,
      isLiked: likedIndex === -1 
    });
  } catch (error) {
    console.error("Error toggling project like:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
