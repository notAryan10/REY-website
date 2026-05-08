import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { getUserFromSession, requireRole } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const resource = await Resource.findById(id);

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const session = await getUserFromSession();
    const userRole = session?.user?.role || "spectator";

    // Access check: Spectators cannot access "members" level resources
    if (resource.accessLevel === "members" && userRole === "spectator") {
      return NextResponse.json({ error: "Forbidden: Members Only Artifcat" }, { status: 403 });
    }

    // Return the resource data (frontend will use the fileUrl for download)
    // In a real production system, we'd use a signed Cloudinary URL here 
    // or serve the file through a stream to prevent direct URL sharing.
    return NextResponse.json(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getUserFromSession();

    try {
      requireRole(session, ["architect"]);
    } catch {
      return NextResponse.json({ error: "Forbidden: Architect Clearance Required" }, { status: 403 });
    }

    await dbConnect();
    const deletedResource = await Resource.findByIdAndDelete(id);

    if (!deletedResource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
