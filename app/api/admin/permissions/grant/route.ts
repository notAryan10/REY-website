import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import AdminPermission from "@/models/AdminPermission";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession();
    if (!session || session.user.role !== "Founder") {
      return NextResponse.json({ error: "Unauthorized: Founder Access Required" }, { status: 401 });
    }

    const { email, tier, permissions } = await req.json();

    if (!email || !tier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const targetUser = await User.findOne({ email: email.toLowerCase() });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Update user role
    targetUser.role = tier;
    await targetUser.save();

    // Update or create permissions
    const updatedPerms = await AdminPermission.findOneAndUpdate(
      { userId: targetUser._id },
      {
        tier,
        permissions: permissions || [],
        grantedBy: session.user.id,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      message: `Admin access granted to ${email}`, 
      user: targetUser,
      permissions: updatedPerms 
    });
  } catch (error) {
    console.error("DEBUG: Failed to grant permissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
