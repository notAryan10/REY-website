import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getUserFromSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized: Access required" }, { status: 401 });
    }

    await dbConnect();

    // EXPLICIT SELECTION of all critical fields to prevent "Ghost Record" issues
    const user = await User.findById(session.user.id).select(
      "name email role xp eventWins projectsLed itchConnected itchUsername itchVerified itchVerificationToken itchVerificationExpires achievements quests"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = NextResponse.json(user);
    
    // FORCE NO-CACHE to ensure latest token visibility
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
