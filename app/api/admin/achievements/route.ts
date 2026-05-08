import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Achievement from "@/models/Achievement";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const achievements = await Achievement.find({}).sort({ createdAt: -1 });
    return NextResponse.json(achievements);
  } catch (error) {
    console.error("DEBUG: Failed to fetch achievements:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
