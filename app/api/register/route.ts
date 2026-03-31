import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const CODES = {
  respawner: "REY-RESPAWN-2026",
  architect: "REY-ARCHITECT-2026",
};

export async function POST(req: Request) {
  try {
    const { name, email, password, role, accessCode } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Role validation with access codes
    if (role === "respawner") {
      if (accessCode !== CODES.respawner) {
        return NextResponse.json({ error: "Invalid Access Code for Respawner rank" }, { status: 403 });
      }
    } else if (role === "architect") {
      if (accessCode !== CODES.architect) {
        return NextResponse.json({ error: "Invalid Access Code for Core Architect rank" }, { status: 403 });
      }
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Architect with this identity already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Initial gamification stats
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "spectator",
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
  } catch (error: any) {
    console.error("DEBUG: Registration failed:", error.message || error);
    return NextResponse.json({ error: "Enlistment failed", details: error.message }, { status: 500 });
  }
}
