import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Project from "@/models/Project";
import { getUserFromSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const comments = await Comment.find({ projectId: id })
      .sort({ createdAt: 1 }) // Show oldest first to maintain thread logic
      .populate("userId", "name role");

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    const { content, parentId } = await req.json();

    if (!content || content.trim().length < 2) {
      return NextResponse.json({ error: "Comment too short" }, { status: 400 });
    }

    await dbConnect();
    
    // Verify project exists
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const newComment = await Comment.create({
      content,
      projectId: id,
      userId: session.user.id,
      parentId: parentId || null,
    });

    // Populate user info for immediate frontend feedback
    const populatedComment = await Comment.findById(newComment._id).populate("userId", "name role");

    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error) {
    console.error("Error posting comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
