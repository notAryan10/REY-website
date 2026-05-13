import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";

// Basic Rate Limiting (In-memory for persistent environments)
// Recommended: Replace with Upstash Redis for distributed environments
const verifyAttempts = new Map<string, { count: number, lastReset: number }>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export async function POST() {
  try {
    const session = await getUserFromSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Access required" }, { status: 401 });
    }

    // Rate Limit Check
    const userId = session.user.id;
    const now = Date.now();
    const userAttempts = verifyAttempts.get(userId) || { count: 0, lastReset: now };
    
    if (now - userAttempts.lastReset > RATE_LIMIT_WINDOW) {
      userAttempts.count = 0;
      userAttempts.lastReset = now;
    }

    if (userAttempts.count >= MAX_ATTEMPTS) {
      return NextResponse.json({ 
        error: "RATE_LIMIT_EXCEEDED: Sector locked.",
        details: `Too many verification attempts. Please wait ${Math.ceil((RATE_LIMIT_WINDOW - (now - userAttempts.lastReset)) / 60000)} minutes.`
      }, { status: 429 });
    }
    
    userAttempts.count++;
    verifyAttempts.set(userId, userAttempts);

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

    // Check expiration
    if (user.itchVerificationExpires && new Date() > user.itchVerificationExpires) {
       return NextResponse.json({ 
        error: "TOKEN_EXPIRED: Handshake window closed.",
        details: "Verification token expired (30m limit). Please regenerate in dashboard."
      }, { status: 403 });
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
      `https://itch.io/profile/${user.itchUsername}`,
      `https://itch.io/profile/${user.itchUsername.replace(/-/g, "_")}`
    ];

    let verified = false;
    const tokenToMatch = user.itchVerificationToken.toUpperCase();

    // Iterate through all potential profile sectors
    for (const target of scanTargets) {
      try {
        console.log(`[ITCH_SCAN] Checking target: ${target}`);
        const res = await fetch(target, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          },
          cache: 'no-store'
        });

        console.log(`[ITCH_SCAN] Target: ${target} | Status: ${res.status}`);

        if (!res.ok) continue;

        const html = await res.text();
        console.log(`[ITCH_SCAN] HTML Length: ${html.length} | Searching for: ${tokenToMatch}`);

        // FORCE CASE-INSENSITIVE SCAN
        if (html.toUpperCase().includes(tokenToMatch)) {
          console.log(`[ITCH_SCAN] MATCH FOUND at ${target}`);
          verified = true;
          break;
        }
      } catch (err) {
        console.error("Fetch failed for target:", target, err);
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
    user.itchVerifiedAt = new Date();
    user.itchVerificationToken = ""; // EXPIRE TOKEN AFTER VERIFICATION
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
