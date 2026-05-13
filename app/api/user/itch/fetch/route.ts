import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";
import { fetchUserItchGames } from "@/lib/itch";

export async function GET() {
  try {
    const session = await getUserFromSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Access required" }, { status: 401 });
    }

    await dbConnect();
    
    // Anchor by ID then Email for absolute consistency
    let user = await User.findById(session.user.id);
    if (!user) {
      user = await User.findOne({ email: session.user.email });
    }
    
    if (!user) {
      return NextResponse.json({ error: "IDENTITY_NOT_FOUND: Subject record missing." }, { status: 404 });
    }

    if (!user.itchUsername) {
      return NextResponse.json({ error: "PROFILE_NOT_LINKED: Itch.io username not synchronized." }, { status: 400 });
    }

    console.log(`[ITCH_FETCH] User: ${user.email} | itchUsername: ${user.itchUsername}`);
    const games = await fetchUserItchGames(user.itchUsername);

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching Itch.io games:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
