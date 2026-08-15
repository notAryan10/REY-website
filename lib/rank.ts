import crypto from "crypto";

// Ranks someone may claim for themselves at signup. Staff ranks (Founder, Core
// Architect, Moderator) are never self-assignable — an admin grants those.
export const SELF_ASSIGNABLE_ROLES = ["spectator", "respawner", "architect"];

const CODES: Record<string, string | undefined> = {
  respawner: process.env.RESPAWNER_ACCESS_CODE,
  architect: process.env.ARCHITECT_ACCESS_CODE,
};

function secret() {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is required to sign rank claims");
  return s;
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** True if `code` unlocks `role`. Spectator is open; unconfigured ranks stay locked. */
export function checkAccessCode(role: string, code: unknown): boolean {
  if (role === "spectator") return true;
  if (!SELF_ASSIGNABLE_ROLES.includes(role)) return false;
  const expected = CODES[role];
  if (!expected) return false;
  return typeof code === "string" && safeEqual(code, expected);
}

/**
 * Signed value for the pending_role cookie. Without the signature the cookie is
 * just user-supplied text, and anyone could hand themselves any rank.
 */
export function signRole(role: string): string {
  const mac = crypto.createHmac("sha256", secret()).update(role).digest("hex");
  return `${role}.${mac}`;
}

/** The role inside a pending_role cookie, or null if it is missing/forged. */
export function verifyRoleCookie(value: string | undefined): string | null {
  if (!value) return null;
  const idx = value.lastIndexOf(".");
  if (idx < 1) return null;
  const role = value.slice(0, idx);
  const mac = value.slice(idx + 1);
  if (!SELF_ASSIGNABLE_ROLES.includes(role)) return null;
  const expected = crypto.createHmac("sha256", secret()).update(role).digest("hex");
  return safeEqual(mac, expected) ? role : null;
}
