import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getUserFromSession, requireRole } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const session = await getUserFromSession();
    const userRole = session?.user?.role || "spectator";

    const query: { accessLevel?: string } = {};

    // Spectators only see public resources
    if (userRole === "spectator") {
      query.accessLevel = "public";
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession();

    try {
      requireRole(session, ["architect"]);
    } catch {
      console.warn("UPLOAD DENIED: Unauthorized or missing rank.", { session: !!session, role: session?.user?.role });
      return NextResponse.json({ error: "Forbidden: Architect Clearance Required" }, { status: 403 });
    }

    console.log("UPLOAD INITIATED: Processing multipart form data.");
    await dbConnect();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const eventId = formData.get("eventId") as string;
    const accessLevel = (formData.get("accessLevel") as string) || "public";
    const accent = (formData.get("accent") as string) || "sky";

    console.log("UPLOAD META:", { title, fileName: file?.name, fileSize: file?.size, eventId });

    if (!file || !title) {
      return NextResponse.json({ error: "Missing required fields: 'file' and 'title' are mandatory." }, { status: 400 });
    }

    if (title.length < 3) {
      return NextResponse.json({ error: "Invalid title: Min 3 characters required." }, { status: 400 });
    }

    // Convert file to buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("CLOUDINARY: Sending buffer to cloud storage...");
    // Upload to Cloudinary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadResult: any = await uploadToCloudinary(buffer, "rey-resources");
    console.log("CLOUDINARY: Transfer secure.", { url: uploadResult.secure_url });

    const newResource = await Resource.create({
      title,
      fileUrl: uploadResult.secure_url,
      type: file.type || "application/octet-stream",
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      eventId: eventId || null,
      accessLevel,
      accent,
      uploadedBy: session?.user?.id,
    });

    console.log("DATABASE: Entry logged.", { id: newResource._id });
    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error("Error uploading resource:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
