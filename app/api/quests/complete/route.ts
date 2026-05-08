import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserQuest from "@/models/UserQuest";
import User from "@/models/User";
import "@/models/Quest";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userQuestId, increment = 1 } = await req.json();

    if (!userQuestId) {
      return NextResponse.json({ error: "Missing userQuestId" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userQuest = await UserQuest.findById(userQuestId).populate({
        path: "questId",
        model: "Quest"
    });
    
    if (!userQuest || userQuest.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    if (userQuest.completed) {
      return NextResponse.json({ message: "Quest already completed" });
    }

    interface QuestDetails {
      requirement: number;
      xpReward: number;
    }
    const quest = userQuest.questId as unknown as QuestDetails;
    userQuest.progress += increment;

    if (userQuest.progress >= quest.requirement) {
      userQuest.progress = quest.requirement;
      userQuest.completed = true;
      userQuest.completedAt = new Date();

      // Add XP to user
      user.xp = (user.xp || 0) + quest.xpReward;
      await user.save();
    }

    await userQuest.save();

    return NextResponse.json({ 
      message: userQuest.completed ? "Mission Complete!" : "Progress recorded",
      userQuest 
    });
  } catch (error) {
    console.error("Failed to update quest progress:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
        error: "Internal Server Error",
        details: errorMessage 
    }, { status: 500 });
  }
}
