import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession, hasPermission } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("🛠️ DELETE REQUEST RECEIVED for citizen ID lookup...");
    const session = await getUserFromSession();

    if (!session || !hasPermission(session, "DELETE_CONTENT")) {
      console.warn("🚫 Unauthorized purge attempt by:", session?.user?.email);
      return NextResponse.json({ error: "Forbidden: Architect Clearance Required" }, { status: 403 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    console.log(`🎯 Target ID for purging: ${id}`);

    if (!id) {
      return NextResponse.json({ error: "Invalid or missing ID parameter" }, { status: 400 });
    }

    if (session.user.id === id) {
      console.warn("🚫 Subject attempted self-purge protocol.");
      return NextResponse.json({ error: "Cannot purge your own identity" }, { status: 400 });
    }

    await dbConnect();
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      console.warn(`❓ Identity not found in database: ${id}`);
      return NextResponse.json({ error: "User identity not found in database" }, { status: 404 });
    }

    // Protect Founder
    if (userToDelete.role === "Founder") {
       console.warn("🚫 CRITICAL: Attempt to purge FOUNDER blocked.");
       return NextResponse.json({ error: "Cannot purge the Founder" }, { status: 400 });
    }

    await User.findByIdAndDelete(id);
    console.log(`✅ Identity ${id} (${userToDelete.email}) purged successfully.`);

    return NextResponse.json({ 
      message: "User identity purged successfully", 
      id: id 
    });
  } catch (error) {
    console.error("❌ FATAL: User deletion protocol failure:", error);
    return NextResponse.json({ error: "Internal Server Error: Core Breach during purge" }, { status: 500 });
  }
}
