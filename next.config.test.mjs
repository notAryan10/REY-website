// ponytail: one check for the only non-obvious bit of next.config.ts —
// that the /api rewrite forwards everything to Render EXCEPT /api/auth/*.
// Run: node next.config.test.mjs
import assert from "node:assert";
import ptr from "next/dist/compiled/path-to-regexp/index.js";

const SOURCE = "/api/:path((?!auth/).*)";
const matched = ptr.pathToRegexp(SOURCE);
const regexp = matched.regexp ?? matched;

const proxied = [
  "/api/user/profile",
  "/api/admin/users/123",
  "/api/health",
  "/api/quests/complete",
  "/api/authors/list", // "auth" prefix but not the auth route
];
const local = [
  "/api/auth/session",
  "/api/auth/signin",
  "/api/auth/callback/google",
];

for (const p of proxied) {
  assert.ok(regexp.test(p), `expected ${p} to be proxied to the backend`);
}
for (const p of local) {
  assert.ok(!regexp.test(p), `expected ${p} to stay on Vercel`);
}

console.log(`ok — ${proxied.length} paths proxied, ${local.length} kept local`);
