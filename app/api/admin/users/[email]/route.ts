import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession, requireRole } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const session = await getUserFromSession();

    try {
      requireRole(session, ["architect"]);
    } catch (err) {
      return NextResponse.json({ error: "Forbidden: Architect Clearance Required" }, { status: 403 });
    }

    const { email } = await params;

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    await dbConnect();

    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return NextResponse.json({ error: "User identity not found in database" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "User identity purged successfully", 
      email: deletedUser.email 
    });
  } catch (error) {
    console.error("DEBUG: User deletion failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
