import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import GameJam from "@/models/GameJam";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const jams = await GameJam.find({}).sort({ createdAt: -1 });
    return NextResponse.json(jams);
  } catch (error) {
    console.error("Error fetching game jams:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
