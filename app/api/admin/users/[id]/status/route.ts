import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession, hasPermission } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserFromSession();
    if (!session || !hasPermission(session, "MODIFY_USERS")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't allow suspending the Founder
    if (user.role === "Founder") {
      return NextResponse.json({ error: "Cannot modify status of the Founder" }, { status: 400 });
    }

    user.status = status;
    await user.save();

    return NextResponse.json({ message: "User status updated successfully", status: user.status });
  } catch (error) {
    console.error("DEBUG: Failed to update user status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
