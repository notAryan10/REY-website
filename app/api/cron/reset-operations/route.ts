import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Quest from "@/models/Quest";
import UserQuest from "@/models/UserQuest";

export async function POST(req: NextRequest) {
  try {
    // Security check for Cron Secret
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1. Clear existing daily UserQuests
    // In a production app, you might want to archive them or only clear non-weekly ones.
    // For this prototype, we'll clear them all to reset the board.
    await UserQuest.deleteMany({});

    // 2. Fetch available active quests
    const availableQuests = await Quest.find({ isActive: true });
    
    if (availableQuests.length === 0) {
      return NextResponse.json({ message: "No active quests found in database to assign." });
    }

    // 3. Assign 4 random quests to every user
    const users = await User.find({});
    
    const assignments = [];
    for (const user of users) {
        // Shuffle and pick 4
        const selectedQuests = [...availableQuests]
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
        
        for (const quest of selectedQuests) {
            assignments.push({
                userId: user._id,
                questId: quest._id,
                progress: 0,
                completed: false,
                claimed: false
            });
        }
    }

    if (assignments.length > 0) {
        await UserQuest.insertMany(assignments);
    }

    return NextResponse.json({ 
        message: "System Reset Successful", 
        usersAffected: users.length,
        questsAssigned: assignments.length 
    });
  } catch (error) {
    console.error("Cron Reset Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
