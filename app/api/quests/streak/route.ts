import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Streak from "@/models/Streak";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getUserFromSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Force model registration
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _User = User;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let streak = await Streak.findOne({ userId: user._id });

    if (!streak) {
      streak = await Streak.create({
        userId: user._id,
        currentStreak: 1,
        highestStreak: 1,
        lastLoginDate: new Date(),
      });
    } else {
      const lastLogin = new Date(streak.lastLoginDate);
      const today = new Date();
      
      // Normalize dates to midnight for comparison
      const lastLoginMidnight = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const diffTime = Math.abs(todayMidnight.getTime() - lastLoginMidnight.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive login
        streak.currentStreak += 1;
        if (streak.currentStreak > streak.highestStreak) {
          streak.highestStreak = streak.currentStreak;
        }
        streak.lastLoginDate = today;
        await streak.save();
      } else if (diffDays > 1) {
        // Streak broken
        streak.currentStreak = 1;
        streak.lastLoginDate = today;
        await streak.save();
      }
      // If diffDays === 0, already synced today
    }

    return NextResponse.json(streak);
  } catch (error) {
    console.error("Failed to fetch streak data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
        error: "Internal Server Error", 
        details: errorMessage 
    }, { status: 500 });
  }
}
