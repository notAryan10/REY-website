// Run: npm test  (needs Node 22.18+ for TypeScript type stripping)
// Covers the registration gates that keep bad input and forged ranks out.
import assert from "node:assert/strict";

process.env.NEXTAUTH_SECRET = "test-secret";
process.env.RESPAWNER_ACCESS_CODE = "code-respawn";
process.env.ARCHITECT_ACCESS_CODE = "code-architect";

const { validateEmail, validatePassword, validateName } = await import("../lib/validate.ts");
const { rateLimit } = await import("../lib/ratelimit.ts");
const { checkAccessCode, signRole, verifyRoleCookie } = await import("../lib/rank.ts");

// --- input validation ---
assert.equal(validateEmail("a@b.co"), null);
assert.ok(validateEmail("nope"));
assert.ok(validateEmail("a@b"));
assert.ok(validateEmail(undefined));

assert.equal(validatePassword("passw0rdy"), null);
assert.ok(validatePassword("short1"), "under 8 chars must be rejected");
assert.ok(validatePassword("allletters"), "needs a digit");
assert.ok(validatePassword("12345678"), "needs a letter");
assert.ok(validatePassword("a1" + "x".repeat(80)), "over 72 bytes must be rejected");

assert.equal(validateName("Steve"), null);
assert.ok(validateName("S"));

// --- rate limiting ---
for (let i = 0; i < 3; i++) {
  assert.equal(rateLimit("k", 3, 60_000).ok, true, `call ${i} should pass`);
}
const blocked = rateLimit("k", 3, 60_000);
assert.equal(blocked.ok, false, "4th call in the window must be blocked");
assert.ok(blocked.retryAfter > 0);
assert.equal(rateLimit("other-key", 3, 60_000).ok, true, "limits are per key");
// A short window expires and lets traffic through again.
assert.equal(rateLimit("expiring", 1, 1).ok, true);
await new Promise((r) => setTimeout(r, 5));
assert.equal(rateLimit("expiring", 1, 1).ok, true, "window should have rolled over");

// --- access codes ---
assert.equal(checkAccessCode("spectator", undefined), true, "spectator is open");
assert.equal(checkAccessCode("respawner", "code-respawn"), true);
assert.equal(checkAccessCode("respawner", "wrong"), false);
assert.equal(checkAccessCode("architect", "code-respawn"), false, "codes are not interchangeable");
assert.equal(checkAccessCode("Founder", "anything"), false, "staff ranks are never self-assignable");

// --- signed rank cookie (the privilege-escalation fix) ---
const signed = signRole("architect");
assert.equal(verifyRoleCookie(signed), "architect");
assert.equal(verifyRoleCookie("architect"), null, "unsigned cookie must be rejected");
assert.equal(verifyRoleCookie("Founder." + signed.split(".")[1]), null, "staff rank must be rejected");
assert.equal(verifyRoleCookie(signed.slice(0, -1) + "0"), null, "tampered signature must be rejected");
assert.equal(verifyRoleCookie(undefined), null);

// --- email template escaping ---
const { emailLayout } = await import("../lib/mail.ts");
const mail = emailLayout({
  heading: 'Reset <your> "password"',
  body: "<p>trusted markup stays</p>",
  cta: { label: "Go", url: "https://rey.test/reset/abc?a=1&b=2" },
});
assert.ok(mail.includes("&lt;your&gt;"), "heading must be escaped");
assert.ok(mail.includes("<p>trusted markup stays</p>"), "body is trusted markup");
assert.ok(mail.includes("a=1&amp;b=2"), "url must be escaped");
assert.ok(!mail.includes('href="https://rey.test/reset/abc?a=1&b=2"'), "raw & must not survive");
assert.ok(emailLayout({ heading: "h", body: "b" }).includes("safely ignore"), "default footer");

console.log("auth checks passed");
