import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Achievement from "@/models/Achievement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import { UserAchievement } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    const achievements = await Achievement.find({}).sort({ category: 1, title: 1 });
    
    if (!session) {
      return NextResponse.json(achievements.map(a => ({ ...a.toObject(), unlocked: false })));
    }

    const user = await User.findOne({ email: session.user?.email });
    if (!user) {
      return NextResponse.json(achievements.map(a => ({ ...a.toObject(), unlocked: false })));
    }

    const enrichedAchievements = achievements.map(a => {
      const userRecord = user.achievements?.find((ua: UserAchievement) => ua.achievementId?.toString() === a._id.toString());
      return {
        ...a.toObject(),
        unlocked: userRecord?.unlocked || false,
        progress: userRecord?.progress || 0,
        unlockedAt: userRecord?.unlockedAt || null
      };
    });

    return NextResponse.json(enrichedAchievements);
  } catch (err) {
    console.error("Failed to fetch achievements:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
