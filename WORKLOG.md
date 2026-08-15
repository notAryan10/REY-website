# REY — Work Log & Architecture Notes

Context that isn't obvious from the code alone: why things are the way they
are, and what's still outstanding. Companion to `VISUAL-SYSTEM.md`
(effects, cursor, colours) and `docs/DEPLOYMENT.md (untracked)`.

---

## Deployment architecture

**Frontend on Vercel, backend on Render.** `rey-website-one.vercel.app` is the
public site; `rey-website.onrender.com` runs the same repo as the backend.

`next.config.ts` rewrites `/api/*` to Render — with deliberate exceptions that
stay on Vercel:

| Excluded | Why |
|---|---|
| `/api/auth/*` | NextAuth runs on Vercel; proxying would add a hop for nothing |
| `/api/forgot-password` | sends email — see SMTP below |
| `/api/register/*` | sends email — see SMTP below |

**Render's free tier blocks outbound SMTP** (ports 25/465/587). nodemailer
never connects, and without timeouts the request hangs until the socket gives
up — which looked exactly like a frozen button. Two fixes: mail routes moved
to Vercel, and `lib/mail.ts` sets connection/greeting/socket timeouts so a
blocked port errors in ~10s instead of hanging.

Consequence worth remembering: **anything that sends email must not run on
Render.** If you add a mail-sending route, exclude it from the rewrite too.

### Environment variables

Needed on **both** platforms unless noted:

- `MONGODB_URI` — Atlas must allow `0.0.0.0/0`; Vercel function IPs rotate
- `NEXTAUTH_SECRET` — also signs the rank claim cookie (see below)
- `NEXTAUTH_URL` — **must be the public Vercel URL on Render too**, since Render
  builds the password-reset link from it
- `EMAIL_HOST/PORT/USER/PASS`, `FROM_NAME`, `FROM_EMAIL` — Gmail needs a
  16-char App Password, not the account password
- `RESPAWNER_ACCESS_CODE`, `ARCHITECT_ACCESS_CODE` — **Vercel only** now that
  registration runs there. Fail closed: unset means that rank can't be claimed
- OAuth: Google / Discord / GitHub client IDs and secrets
- Cloudinary keys, `CRON_SECRET`

---

## Auth & registration

### The rank escalation that was fixed

`pending_role` used to be a plain cookie set by client JS, which `lib/auth.ts`
trusted on sign-in — and its allowlist included `Founder`. Setting
`document.cookie = "pending_role=Founder"` and signing in with any OAuth
provider granted full admin. The access-code check that was supposed to gate
this ran in the browser, so it was decorative.

Now: `/api/register/rank` checks the code **server-side** and returns an
HMAC-signed cookie (`lib/rank.ts`, signed with `NEXTAUTH_SECRET`).
`verifyRoleCookie` rejects anything unsigned, tampered, or naming a staff rank.

**Invariant: staff ranks (Founder, Core Architect, Moderator) are never
self-assignable.** They come only from the Founder-only
`/api/admin/permissions/grant`, which also writes the `AdminPermission` record.

### Registration flow

1. `POST /api/register/otp` → 6-digit code, sha256-hashed in `models/Otp.ts`,
   Mongo TTL index expires it (no cleanup job needed)
2. `POST /api/register` → validates name/email/password, checks the access code
   for non-spectator ranks, verifies the OTP, creates the user

Rules: password 8+ chars with a letter and a digit, rejected over 72 bytes
(bcrypt silently truncates there). 5 wrong OTP guesses burn the code. The OTP
endpoint returns the same message whether or not the address exists, so it
can't enumerate members.

**Access codes gate the rank; the OTP only proves the address is real.** Don't
collapse them — owning an inbox shouldn't grant a rank.

### Rate limiting

`lib/ratelimit.ts` — in-memory sliding window, applied per-address and per-IP
to register, OTP send, rank claim and forgot-password. **Per-instance**, so it
only holds on a single dyno. Multi-instance needs Redis/Upstash.

---

## Admin console (`/dashboard/architect`)

Sections and what each owns — keep them from overlapping:

| Section | Owns |
|---|---|
| Members | suspend / purge / **Config** (name, rank, level) |
| XP Control | XP add/remove/set |
| Achievements | granting achievements |
| Admin Management | staff tiers (Founder only) |
| System Logs | audit trail via socket.io |

Config uses `PATCH /api/admin/users/[id]` (name + rank, one request) and
`POST /api/admin/level` (writes XP as `(level - 1) * 500`). Both behind
`MODIFY_USERS`. The Founder record is uneditable everywhere.

Levels are derived from XP, not stored — `lib/xp.ts`, 500 XP per level.

---

## Testing

`npm test` → `tests/auth.test.mjs`. Plain `node:assert`, no framework. Covers
input validation, rate limiting, access codes, rank-cookie signing/forgery,
and email-template escaping.

**Needs Node 22.18+** for TypeScript type stripping (CI and the Dockerfile are
on 24). A local default of Node 20 will fail with `ERR_UNKNOWN_FILE_EXTENSION`.

`scripts/` is gitignored — put anything that must be committed elsewhere.

---

## Outstanding

- **Access codes are still the values that were committed to the public repo**
  (`REY-*-2026`). Anyone reading git history has them. Rotating means setting
  new values in Vercel; the code change is already done.
- `app/register/page.tsx` builds rank accent classes dynamically, so Tailwind
  likely emits nothing for them — see the Tailwind gotcha in VISUAL-SYSTEM.md.
- `rey-website.onrender.com` serves the full site publicly, so it can be
  indexed as duplicate content. Fixable with a canonical tag or by blocking
  crawlers on that host.
- Email is Gmail SMTP. An HTTP API (Resend/SendGrid) would be more reliable —
  port 443 is never blocked, deliverability is better, and mail routes could
  then move back to Render.
- Rate limiting is in-memory; revisit if the backend ever scales past one
  instance.
