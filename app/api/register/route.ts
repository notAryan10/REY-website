import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyOtp } from "@/lib/otp";
import { checkAccessCode, SELF_ASSIGNABLE_ROLES } from "@/lib/rank";
import { validateEmail, validateName, validatePassword } from "@/lib/validate";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`register:${clientIp(req)}`, 5, 60 * 60 * 1000);
    if (!limit.ok) return tooManyRequests(limit.retryAfter);

    const { name, email, password, role, accessCode, otp } = await req.json();

    const inputError = validateName(name) || validateEmail(email) || validatePassword(password);
    if (inputError) {
      return NextResponse.json({ error: inputError }, { status: 400 });
    }

    if (!SELF_ASSIGNABLE_ROLES.includes(role)) {
      return NextResponse.json({ error: "That rank cannot be self-assigned." }, { status: 400 });
    }

    if (!checkAccessCode(role, accessCode)) {
      return NextResponse.json(
        { error: `Invalid access code for the ${role} rank.` },
        { status: 403 }
      );
    }

    const address = (email as string).trim().toLowerCase();

    await dbConnect();

    const existingUser = await User.findOne({ email: address });
    if (existingUser) {
      return NextResponse.json(
        { error: "Architect with this identity already exists" },
        { status: 400 }
      );
    }

    // Proves the address belongs to whoever is signing up.
    const otpError = await verifyOtp(address, otp);
    if (otpError) {
      return NextResponse.json({ error: otpError }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Initial gamification stats
    const user = await User.create({
      name: (name as string).trim(),
      email: address,
      password: hashedPassword,
      role,
      xp: 0,
      eventWins: 0,
      projectsLed: 0,
      quests: []
    });

    return NextResponse.json(
      {
        message: "Rank assigned successfully",
        user: { name: user.name, email: user.email, role: user.role }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("DEBUG: Registration failed:", error);
    return NextResponse.json({ error: "Enlistment failed" }, { status: 500 });
  }
}
