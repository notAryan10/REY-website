import crypto from "crypto";
import Otp from "@/models/Otp";

export const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const hash = (code: string) => crypto.createHash("sha256").update(code).digest("hex");

/** Six digits, uniformly random. Replaces any code already outstanding for this email. */
export async function issueOtp(email: string) {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  await Otp.findOneAndUpdate(
    { email: email.toLowerCase() },
    { codeHash: hash(code), attempts: 0, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    { upsert: true }
  );
  return code;
}

/**
 * Consumes the code on success. Wrong guesses are counted so a 6-digit code
 * can't be walked through by brute force.
 */
export async function verifyOtp(email: string, code: unknown): Promise<string | null> {
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return "Enter the 6-digit code from your email.";
  }

  const record = await Otp.findOne({ email: email.toLowerCase() });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    return "That code has expired. Request a new one.";
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id });
    return "Too many incorrect codes. Request a new one.";
  }

  if (record.codeHash !== hash(code)) {
    await Otp.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    return "That code is incorrect.";
  }

  await Otp.deleteOne({ _id: record._id });
  return null;
}
