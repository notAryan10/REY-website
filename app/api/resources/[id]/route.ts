import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const resource = await Resource.findById(params.id);

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "architect") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const deletedResource = await Resource.findByIdAndDelete(params.id);

    if (!deletedResource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
