import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmail, emailLayout } from "@/lib/mail";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Please provide an email" }, { status: 400 });
    }

    // Each request sends real mail, so cap it per address and per host.
    const perEmail = rateLimit(`reset:email:${String(email).toLowerCase()}`, 3, 15 * 60 * 1000);
    if (!perEmail.ok) return tooManyRequests(perEmail.retryAfter);

    const perIp = rateLimit(`reset:ip:${clientIp(req)}`, 10, 60 * 60 * 1000);
    if (!perIp.ok) return tooManyRequests(perIp.retryAfter);

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Long enough to survive checking email on a phone and coming back later.
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

    const message =
      `Someone asked to reset the password for your REY account.\n\n` +
      `Open this link to choose a new one — it expires in 1 hour:\n\n${resetUrl}\n\n` +
      `If that wasn't you, ignore this email. Your password stays as it is.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset your REY password",
        message,
        html: emailLayout({
          heading: "Reset your password",
          body: `<p style="margin:0">Someone asked to reset the password for your REY account.
                 Choose a new one with the button below — the link expires in <strong>1 hour</strong>.</p>`,
          cta: { label: "Choose a new password", url: resetUrl },
          footer: "If that wasn't you, ignore this email. Your password stays as it is.",
        }),
      });

      return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return NextResponse.json({ error: "Email could not be sent" }, { status: 500 });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
