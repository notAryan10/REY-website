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

    await dbConnect();
    // Anchor by ID - the most reliable unique identifier
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "IDENTITY_NOT_FOUND: Subject record missing." }, { status: 404 });
    }

    if (!user.itchUsername || !user.itchVerificationToken) {
      return NextResponse.json({ 
        error: "PROTOCOL_ERROR: Handshake not initialized.",
        details: `ID: ${session.user.id}. Email: ${session.user.email}. Token: ${user.itchVerificationToken ? "PRESENT" : "MISSING"}. User: ${user.itchUsername || "NONE"}. Please re-link.`
      }, { status: 400 });
    }

    if (user.itchVerified) {
      return NextResponse.json({ 
        message: "Identity already verified.",
        user: { itchVerified: true }
      });
    }

    const subdomains = [
      user.itchUsername.toLowerCase(),
      user.itchUsername.toLowerCase().replace(/_/g, "-")
    ];

    let verified = false;
    const tokenToMatch = user.itchVerificationToken.toUpperCase();

    // Check itch.io profile for the token
    for (const sub of subdomains) {
      try {
        const res = await fetch(`https://${sub}.itch.io`);
        if (!res.ok) continue;

        const html = await res.text();
        // Force case-insensitive match for maximum resilience
        if (html.toUpperCase().includes(tokenToMatch)) {
          verified = true;
          break;
        }
      } catch (err) {
        console.error("Fetch failed for subdomain:", sub, err);
      }
    }

    if (!verified) {
      return NextResponse.json({ 
        error: "VERIFICATION_FAILED: Token not detected in profile bio.",
        details: `Handshake scan found no match for ${tokenToMatch}. Ensure it's pasted exactly in your bio.`
      }, { status: 403 });
    }

    // Success! Update user
    user.itchVerified = true;
    user.xp = (user.xp || 0) + 100; // Award XP for verified developer status
    
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
