import { NextResponse } from "next/server";
import { checkAccessCode, signRole, SELF_ASSIGNABLE_ROLES } from "@/lib/rank";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/ratelimit";

/**
 * OAuth signups can't post an access code through the provider, so they claim
 * their rank here first. The code is checked on the server and the result comes
 * back as a signed cookie that lib/auth.ts verifies when the account is created.
 */
export async function POST(req: Request) {
  const limit = rateLimit(`rank:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const { role, accessCode } = await req.json();

  if (!SELF_ASSIGNABLE_ROLES.includes(role)) {
    return NextResponse.json({ error: "That rank cannot be self-assigned." }, { status: 400 });
  }

  if (!checkAccessCode(role, accessCode)) {
    return NextResponse.json(
      { error: `Invalid access code for the ${role} rank.` },
      { status: 403 }
    );
  }

  const res = NextResponse.json({ message: "Rank claim accepted." });
  res.cookies.set("pending_role", signRole(role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 300,
  });
  return res;
}
