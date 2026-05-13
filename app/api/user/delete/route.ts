import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";

export async function DELETE() {
  try {
    const session = await getUserFromSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Access required" }, { status: 401 });
    }

    await dbConnect();

    let deletedUser = await User.findByIdAndDelete(session.user.id);
    if (!deletedUser) {
      deletedUser = await User.findOneAndDelete({ email: session.user.email });
    }

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
