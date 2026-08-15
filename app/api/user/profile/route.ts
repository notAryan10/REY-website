import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { validateName, validatePassword } from "@/lib/validate";
import { rateLimit, tooManyRequests } from "@/lib/ratelimit";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function GET() {
  try {
    const session = await getUserFromSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized: Access required" }, { status: 401 });
    }

    await dbConnect();

    // EXPLICIT SELECTION of all critical fields to prevent "Ghost Record" issues
    const user = await User.findById(session.user.id).select(
      "name email image role xp eventWins projectsLed itchConnected itchUsername itchVerified itchVerificationToken itchVerificationExpires achievements quests +password"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Never ship the hash — Settings only needs to know whether a password
    // exists, so social-only accounts can hide the change-password fields.
    const { password, ...safe } = user.toObject();
    const response = NextResponse.json({ ...safe, hasPassword: !!password });
    
    // FORCE NO-CACHE to ensure latest token visibility
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Self-service profile edit: display name, avatar, password.
 * Multipart, because the avatar is a file — same shape as the resources upload.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getUserFromSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized: Access required" }, { status: 401 });
    }

    // Password attempts are guessable-adjacent, and avatar uploads cost bandwidth.
    const limit = rateLimit(`profile:${session.user.id}`, 10, 15 * 60 * 1000);
    if (!limit.ok) return tooManyRequests(limit.retryAfter);

    const form = await req.formData();
    const name = form.get("name");
    const currentPassword = form.get("currentPassword");
    const newPassword = form.get("newPassword");
    const avatar = form.get("avatar") as File | null;

    if (typeof name === "string") {
      const nameError = validateName(name);
      if (nameError) return NextResponse.json({ error: nameError }, { status: 400 });
    }

    await dbConnect();
    // Password comes back only when needed — it's select:false on the schema.
    const user = await User.findById(session.user.id).select(
      newPassword ? "+password" : ""
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (newPassword) {
      if (!user.password) {
        return NextResponse.json(
          { error: "This account signs in with a social provider, so it has no password to change." },
          { status: 400 }
        );
      }

      const passwordError = validatePassword(newPassword);
      if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });

      // Always verify the current password — a hijacked session shouldn't be
      // able to lock the real owner out.
      if (typeof currentPassword !== "string" || !currentPassword) {
        return NextResponse.json({ error: "Enter your current password." }, { status: 400 });
      }

      const matches = await bcrypt.compare(currentPassword, user.password);
      if (!matches) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
      }

      user.password = await bcrypt.hash(newPassword as string, 12);
    }

    if (avatar && avatar.size > 0) {
      if (!ALLOWED_AVATAR_TYPES.includes(avatar.type)) {
        return NextResponse.json({ error: "Avatar must be a JPEG, PNG, WebP or GIF." }, { status: 400 });
      }
      if (avatar.size > MAX_AVATAR_BYTES) {
        return NextResponse.json({ error: "Avatar must be 5MB or smaller." }, { status: 400 });
      }

      const buffer = Buffer.from(await avatar.arrayBuffer());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uploaded: any = await uploadToCloudinary(buffer, "rey-avatars");
      user.image = uploaded.secure_url;
    }

    if (typeof name === "string") user.name = name.trim();

    await user.save();

    return NextResponse.json({
      message: "Profile updated",
      user: { name: user.name, image: user.image },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
