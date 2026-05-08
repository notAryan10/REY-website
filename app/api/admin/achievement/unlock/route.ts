import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Achievement from "@/models/Achievement";
import { getUserFromSession, hasPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session || !hasPermission(session, "MANAGE_ACHIEVEMENTS")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, achievementId } = await req.json();

    if (!userId || !achievementId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    const achievement = await Achievement.findById(achievementId);

    if (!user || !achievement) {
      return NextResponse.json({ error: "User or Achievement not found" }, { status: 404 });
    }

    // Check if already unlocked
    const alreadyUnlocked = user.achievements.find(
      (a: any) => a.achievementId.toString() === achievementId && a.unlocked
    );

    if (alreadyUnlocked) {
      return NextResponse.json({ error: "Achievement already unlocked" }, { status: 400 });
    }

    // Update or push achievement
    const achIndex = user.achievements.findIndex(
      (a: any) => a.achievementId.toString() === achievementId
    );

    if (achIndex > -1) {
      user.achievements[achIndex].unlocked = true;
      user.achievements[achIndex].unlockedAt = new Date();
      user.achievements[achIndex].progress = achievement.requirementValue || 1;
    } else {
      user.achievements.push({
        achievementId,
        unlocked: true,
        unlockedAt: new Date(),
        progress: achievement.requirementValue || 1,
      });
    }

    // Reward XP
    user.xp = (user.xp || 0) + (achievement.xpReward || 0);

    await user.save();

    return NextResponse.json({ message: "Achievement unlocked successfully", achievements: user.achievements });
  } catch (error) {
    console.error("DEBUG: Failed to unlock achievement:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
