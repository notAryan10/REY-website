import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { issueOtp } from "@/lib/otp";
import { sendEmail, emailLayout } from "@/lib/mail";
import { validateEmail } from "@/lib/validate";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const address = (email as string).trim().toLowerCase();

    // Two limits: one so a single address can't be mail-bombed, one so a single
    // host can't spray codes at many addresses.
    const perEmail = rateLimit(`otp:email:${address}`, 3, 15 * 60 * 1000);
    if (!perEmail.ok) return tooManyRequests(perEmail.retryAfter);

    const perIp = rateLimit(`otp:ip:${clientIp(req)}`, 10, 60 * 60 * 1000);
    if (!perIp.ok) return tooManyRequests(perIp.retryAfter);

    await dbConnect();

    // Same response either way, so this can't be used to enumerate members.
    const existing = await User.findOne({ email: address });
    if (!existing) {
      const code = await issueOtp(address);
      await sendEmail({
        email: address,
        subject: `${code} is your REY verification code`,
        message:
          `Your REY verification code is ${code}\n\n` +
          `Enter it on the enlistment page to finish creating your account. ` +
          `It expires in 10 minutes.\n\n` +
          `If you didn't try to enlist, you can ignore this email.`,
        html: emailLayout({
          heading: "Verify your email",
          body: `<p style="margin:0 0 20px">Enter this code on the enlistment page to finish
                 creating your account. It expires in <strong>10 minutes</strong>.</p>
                 <div style="font-size:34px;font-weight:700;letter-spacing:10px;color:#ffffff;
                      background:#17171b;border:1px solid #2a2a30;border-radius:4px;
                      padding:20px;text-align:center">${code}</div>`,
          footer: "If you didn't try to enlist, you can ignore this email.",
        }),
      });
    }

    return NextResponse.json({
      message: "If that address can be enlisted, a verification code is on its way.",
    });
  } catch (error) {
    console.error("DEBUG: Failed to issue signup OTP:", error);
    return NextResponse.json({ error: "Could not send the code. Try again." }, { status: 500 });
  }
}
