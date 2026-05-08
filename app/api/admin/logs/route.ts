import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { getUserFromSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session || !["Founder", "Core Architect", "Moderator"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("DEBUG: Failed to fetch audit logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
