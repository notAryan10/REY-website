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

    await dbConnect();
    // Prioritized ID lookup mirror the logic in connect and profile
    let user = await User.findById(session.user.id);
    if (!user) {
       user = await User.findOne({ email: session.user.email });
    }
    
    if (!user) {
      return NextResponse.json({ error: "IDENTITY_NOT_FOUND: Subject record missing." }, { status: 404 });
    }

    console.log(`[ITCH_VERIFY] User ${user._id} | username: "${user.itchUsername}" | token: "${user.itchVerificationToken}"`);

    if (!user.itchUsername || !user.itchVerificationToken) {
      return NextResponse.json({ 
        error: "PROTOCOL_ERROR: Handshake not initialized.",
        details: `Token: ${user.itchVerificationToken ? "PRESENT" : "MISSING"}. User: ${user.itchUsername || "NONE"}. Please re-link in dashboard.`
      }, { status: 400 });
    }

    if (user.itchVerified) {
      return NextResponse.json({ 
        message: "Identity already verified.",
        user: { itchVerified: true }
      });
    }

    // MULTI-SECTOR SCANNING (Browser Emulation)
    const scanTargets = [
      `https://${user.itchUsername.replace(/_/g, "-")}.itch.io`,
      `https://${user.itchUsername}.itch.io`,
      `https://itch.io/profile/${user.itchUsername}`
    ];

    let verified = false;
    const tokenToMatch = user.itchVerificationToken.toUpperCase();
    let lastCommsError = "";

    // Iterate through all potential profile sectors
    for (const target of scanTargets) {
      try {
        const res = await fetch(target, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 R.E.Y-Handshake-Scanner/2.0'
          },
          cache: 'no-store'
        });

        if (!res.ok) continue;

        const html = await res.text();
        // FORCE CASE-INSENSITIVE SCAN
        if (html.toUpperCase().includes(tokenToMatch)) {
          verified = true;
          break;
        }
      } catch (err) {
        console.error("Fetch failed for target:", target, err);
        lastCommsError = "COMMS_FAILURE: Sector unreachable.";
      }
    }

    if (!verified) {
      return NextResponse.json({ 
        error: "VERIFICATION_FAILED: Token not detected in profile bio.",
        details: `Handshake scan found no match for ${tokenToMatch} at your Itch.io sectors. Ensure it's pasted exactly in your bio or description.`
      }, { status: 403 });
    }

    // Handshake Success!
    user.itchVerified = true;
    user.xp = (user.xp || 0) + 100;
    await user.save();

    return NextResponse.json({ 
      message: "ITCH_NETWORK_VERIFIED: Identity confirmed.",
      xpAwarded: 100,
      user: {
        itchVerified: true,
        xp: user.xp
      }
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
