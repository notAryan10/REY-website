import { NextResponse } from "next/server";
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
    const userQuests = await UserQuest.find({ userId: user._id })
      .populate({
        path: "questId",
        model: "Quest" // Explicitly name the model
      })
      .sort({ createdAt: -1 });

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
