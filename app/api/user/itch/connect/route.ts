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

    // Extraction logic improvement with strict sanitization
    let processedUsername = itchUsername.trim();
    if (processedUsername.includes("itch.io")) {
       const match = processedUsername.match(/(?:https?:\/\/)?(.*?)\.itch\.io/);
       if (match) processedUsername = match[1];
       else {
         const profileMatch = processedUsername.match(/itch\.io\/profile\/(.*)/);
         if (profileMatch) processedUsername = profileMatch[1];
       }
    }
    
    // Strict Sanitization: Convert underscores to hyphens and only allow alphanumeric/hyphens
    processedUsername = processedUsername.replace(/_/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();

    if (!processedUsername) {
      return NextResponse.json({ error: "VALIDATION_ERROR: Invalid Itch.io username format." }, { status: 400 });
    }

    // Handshake Sector Ping
    try {
      const subdomains = [processedUsername, processedUsername.replace(/_/g, "-")];
      let exists = false;
      for (const sub of subdomains) {
        // Strict domain validation: always HTTPS and .itch.io
        const targetUrl = `https://${sub}.itch.io`;
        const verifyRes = await fetch(targetUrl, { 
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
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    // Direct field mutation + save — avoids $set/$inc operator conflicts
    const wasConnected = user.itchConnected;
    user.itchUsername = processedUsername;
    user.itchConnected = true;
    user.itchVerified = false;
    user.itchVerificationToken = token;
    user.itchVerificationExpires = expires;
    if (!wasConnected) user.xp = (user.xp || 0) + 50;

    const savedUser = await user.save();
    console.log(`[ITCH_CONNECT] Saved user ${savedUser._id} | token: ${savedUser.itchVerificationToken} | expires: ${expires}`);

    return NextResponse.json({ 
      message: "Itch.io profile linked. Verification required (expires in 30m).",
      token,
      expires,
      user: savedUser
    });
  } catch (error) {
    console.error("Error connecting Itch.io:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
