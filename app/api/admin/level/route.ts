import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession, hasPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session || !hasPermission(session, "MODIFY_LEVELS")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, level } = await req.json();

    if (!userId || level === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const xpPerLevel = 500;
    user.xp = (level - 1) * xpPerLevel;

    await user.save();

    return NextResponse.json({ message: "Level updated successfully", xp: user.xp, level });
  } catch (error) {
    console.error("DEBUG: Failed to update level:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
