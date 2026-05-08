import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession, hasPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session || !hasPermission(session, "MODIFY_XP")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, amount, action } = await req.json();

    if (!userId || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "set") {
      user.xp = amount;
    } else {
      user.xp = (user.xp || 0) + amount;
    }

    await user.save();

    return NextResponse.json({ message: "XP updated successfully", xp: user.xp });
  } catch (error) {
    console.error("DEBUG: Failed to update XP:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
