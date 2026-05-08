import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    // 1. Check Database Connection
    await dbConnect();
    
    const dbStatus = mongoose.connection.readyState === 1;
    
    if (!dbStatus) {
      return NextResponse.json({ 
        status: "unhealthy", 
        message: "Database connection not ready" 
      }, { status: 503 });
    }

    // 2. Add other vital checks here if needed (e.g., Cloudinary, Socket server)

    return NextResponse.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "rey-network-core"
    }, { status: 200 });

  } catch (error: any) {
    console.error("Health Check Failure:", error);
    return NextResponse.json({ 
      status: "unhealthy", 
      error: error.message 
    }, { status: 500 });
  }
}
