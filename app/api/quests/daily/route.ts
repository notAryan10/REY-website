import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserQuest from "@/models/UserQuest";
import User from "@/models/User";
import Quest from "@/models/Quest";
import { getUserFromSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Get true user ID from DB using email to be safe
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find all user quests and populate quest details
    const userQuests = await UserQuest.find({ userId: user._id })
      .populate("questId")
      .sort({ createdAt: -1 });

    return NextResponse.json(userQuests);
  } catch (error) {
    console.error("Failed to fetch daily quests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
