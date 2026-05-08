import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, requireRole } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getUserFromSession();
    
    await dbConnect();
    const resource = await Resource.findById(id);

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const userRole = session?.user?.role || "spectator";

    if (resource.accessLevel === "members") {
      if (!session) {
        return NextResponse.json({ 
          error: "Authentication required for this resource.", 
        }, { status: 401 });
      }

      if (userRole === "spectator") {
        return NextResponse.json({ 
          error: "Forbidden: Higher clearance required.", 
          required: "Respawner+" 
        }, { status: 403 });
      }
    }

    console.log(`DOWNLOAD GRANTED: ${resource.title} to ${session?.user?.email || "anonymous"}`);

    return NextResponse.redirect(resource.fileUrl);
  } catch (error) {
    console.error("Download failure:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
