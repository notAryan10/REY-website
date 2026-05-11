import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
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

    const { 
      title, 
      description, 
      accent, 
      tag, 
      itchIoUrl,
      itchId,
      engine,
      tags,
      screenshots,
      coverImage,
      verified,
      source,
      devStatus,
      featured
    } = await req.json();

    // Validation
    if (!title || !accent || !tag || !itchIoUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (title.length < 3) {
      return NextResponse.json({ error: "Title too short" }, { status: 400 });
    }

    // Default description for Itch imports if missing
    const finalDescription = description || (source === "itch" ? "Synchronized build repository from Itch.io network." : "");

    if (!finalDescription) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    await dbConnect();
    
    // PROJECT OWNERSHIP LOCK: Prevent duplicate claims
    const existingProject = await Project.findOne({ itchIoUrl });
    if (existingProject) {
      return NextResponse.json({ 
        error: "DUPLICATE_CLAIM: This project has already been registered in the R.E.Y network.",
        details: "If you believe this is an error, please contact a Moderator."
      }, { status: 409 });
    }
    
    // Check if user is itch verified
    const user = await User.findOne({ email: session.user.email });
    const canBeVerified = user && user.itchVerified && source === "itch";
    
    let xpToAdd = 50; // Base XP for project upload
    if (canBeVerified && verified) xpToAdd += 50; // Extra XP for verified builds

    const newProject = await Project.create({
      title,
      description: finalDescription,
      accent,
      tag,
      itchIoUrl,
      itchId,
      engine,
      tags,
      screenshots,
      coverImage,
      verified: canBeVerified ? !!verified : false,
      source: source || "manual",
      syncStatus: (canBeVerified && verified) ? "synced" : "manual",
      devStatus: devStatus || "released",
      featured: !!featured,
      uploadedBy: session.user.id,
      status: "published", // Default to published for now
    });

    if (user) {
      user.xp = (user.xp || 0) + xpToAdd;
      await user.save();
    }

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
