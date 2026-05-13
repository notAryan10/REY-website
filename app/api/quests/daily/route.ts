import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import UserQuest from "@/models/UserQuest";
import User from "@/models/User";
import "@/models/Quest"; // Ensure Quest is registered
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
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
    let userQuests = await UserQuest.find({ userId: user._id })
      .populate({
        path: "questId",
        model: "Quest"
      })
      .sort({ createdAt: -1 });

    // Lazy Reset: Check if existing quests are from a previous day
    if (userQuests.length > 0) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const firstQuestDate = new Date(userQuests[0].createdAt);
      
      if (firstQuestDate < startOfToday) {
        await UserQuest.deleteMany({ userId: user._id });
        userQuests = [];
      }
    }

    // If no quests found, assign some initial ones (fallback for new users or after reset)
    if (userQuests.length === 0) {
      const availableQuests = await mongoose.model("Quest").find({ isActive: true });
      if (availableQuests.length > 0) {
        const selectedQuests = [...availableQuests]
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        
        const assignments = selectedQuests.map(q => ({
          userId: user._id,
          questId: q._id,
          progress: 0,
          completed: false,
          claimed: false
        }));

        await UserQuest.insertMany(assignments);
        
        // Fetch again to get populated data
        userQuests = await UserQuest.find({ userId: user._id })
          .populate({
            path: "questId",
            model: "Quest"
          })
          .sort({ createdAt: -1 });
      }
    }

    return NextResponse.json(userQuests);
  } catch (error) {
    console.error("Failed to fetch daily quests:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
        error: "Internal Server Error", 
        details: errorMessage 
    }, { status: 500 });
  }
}
