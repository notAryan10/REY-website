import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Resource from "@/models/Resource";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || "spectator";

    let query: any = {};

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
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "architect") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const eventId = formData.get("eventId") as string;
    const accessLevel = formData.get("accessLevel") as string || "public";
    const accent = formData.get("accent") as string || "sky";

    if (!file || !title) {
      return NextResponse.json({ error: "Missing file or title" }, { status: 400 });
    }

    // Convert file to buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult: any = await uploadToCloudinary(buffer, "rey-resources");

    const newResource = await Resource.create({
      title,
      fileUrl: uploadResult.secure_url,
      eventId: eventId || null,
      accessLevel,
      uploadedBy: session.user.id,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type.split("/")[1]?.toUpperCase() || "FILE",
      accent,
    });

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error("Error uploading resource:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
