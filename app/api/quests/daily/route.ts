import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserQuest from "@/models/UserQuest";
import Quest from "@/models/Quest";
import { getUserFromSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Find all user quests and populate quest details
    const userQuests = await UserQuest.find({ userId: session.user.id })
      .populate("questId")
      .sort({ createdAt: -1 });

    return NextResponse.json(userQuests);
  } catch (error) {
    console.error("Failed to fetch daily quests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
