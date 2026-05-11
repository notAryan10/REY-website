import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Access required" }, { status: 401 });
    }

    const { itchUsername, disconnect } = await req.json();

    await dbConnect();
    
    // Anchor by ID then Email for absolute consistency
    let user = await User.findById(session.user.id);
    if (!user) {
      user = await User.findOne({ email: session.user.email });
    }

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
       else {
         const profileMatch = processedUsername.match(/itch\.io\/profile\/(.*)/);
         if (profileMatch) processedUsername = profileMatch[1];
       }
    }
    processedUsername = processedUsername.replace(/\/$/, "").toLowerCase();

    // Handshake Sector Ping
    try {
      const subdomains = [processedUsername, processedUsername.replace(/_/g, "-")];
      let exists = false;
      for (const sub of subdomains) {
        const verifyRes = await fetch(`https://${sub}.itch.io`, { 
          method: "HEAD", 
          headers: { 'User-Agent': 'Mozilla/5.0 R.E.Y-Handshake-Scanner/1.0' } 
        });
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

    // Generate fresh token
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const token = `REY-VERIFY-${randomSuffix}`;

    // Direct field mutation + save — avoids $set/$inc operator conflicts
    const wasConnected = user.itchConnected;
    user.itchUsername = processedUsername;
    user.itchConnected = true;
    user.itchVerified = false;
    user.itchVerificationToken = token;
    if (!wasConnected) user.xp = (user.xp || 0) + 50;

    const savedUser = await user.save();
    console.log(`[ITCH_CONNECT] Saved user ${savedUser._id} | token: ${savedUser.itchVerificationToken} | username: ${savedUser.itchUsername}`);

    return NextResponse.json({ 
      message: "Itch.io profile linked. Verification required.",
      token,           // Direct token — guaranteed source of truth for UI
      user: savedUser
    });
  } catch (error) {
    console.error("Error connecting Itch.io:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
