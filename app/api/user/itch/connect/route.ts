import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized: Access required" }, { status: 401 });
    }

    const { itchUsername, disconnect } = await req.json();

    await dbConnect();
    // Anchor by ID - the most reliable unique identifier
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "IDENTITY_NOT_FOUND: Subject record missing." }, { status: 404 });
    }

    if (disconnect) {
      user.itchUsername = "";
      user.itchConnected = false;
      user.itchVerified = false;
      user.itchVerificationToken = "";
      await user.save();
      return NextResponse.json({ message: "Profile decoupled successfully" });
    }

    if (!itchUsername) {
      return NextResponse.json({ error: "Itch.io username is required" }, { status: 400 });
    }

    // Extraction logic improvement
    let processedUsername = itchUsername.trim();
    if (processedUsername.includes("itch.io")) {
       const match = processedUsername.match(/(?:https?:\/\/)?(.*?)\.itch\.io/);
       if (match) processedUsername = match[1];
    }
    processedUsername = processedUsername.replace(/\/$/, "").toLowerCase();

    // Verification check for existence
    try {
      const subdomains = [processedUsername, processedUsername.replace(/_/g, "-")];
      let exists = false;
      for (const sub of subdomains) {
        const verifyRes = await fetch(`https://${sub}.itch.io`, { method: "HEAD" });
        if (verifyRes.ok) {
          exists = true;
          break;
        }
      }
      
      if (!exists) {
        return NextResponse.json({ error: "IDENTITY_NOT_FOUND: No profile detected at this sector." }, { status: 404 });
      }
    } catch (err) {
      console.error("Itch verification failed:", err);
      return NextResponse.json({ error: "COMMS_ERROR: Itch.io network unreachable." }, { status: 503 });
    }

    // Award XP only if not already connected
    const xpReward = user.itchConnected ? 0 : 50;
    
    // Force fresh token generation
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const token = `REY-VERIFY-${randomSuffix}`;

    user.itchUsername = processedUsername;
    user.itchConnected = true;
    user.itchVerified = false; 
    user.itchVerificationToken = token;
    user.xp = (user.xp || 0) + xpReward;
    
    await user.save();

    return NextResponse.json({ 
      message: "Itch.io profile linked. Verification required.",
      xpAwarded: xpReward,
      user: {
        itchUsername: user.itchUsername,
        itchConnected: user.itchConnected,
        itchVerified: user.itchVerified,
        itchVerificationToken: user.itchVerificationToken,
        xp: user.xp
      }
    });
  } catch (error) {
    console.error("Error connecting Itch.io:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
