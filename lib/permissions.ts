import type { Session } from "next-auth";

// Pure authorization logic, deliberately free of runtime imports so it can be
// unit-tested without booting next-auth or Mongo. Re-exported from lib/auth.ts,
// which is where routes import it from.

export function hasPermission(session: Session | null, permission: string): boolean {
  if (!session || !session.user) return false;
  if (session.user.role === "Founder") return true;
  const held = session.user.permissions;
  return !!held && (held.includes(permission) || held.includes("FULL_ACCESS"));
}

/** Roles that could manage events before MANAGE_EVENTS was enforced. */
const LEGACY_EVENT_ROLES = ["Founder", "Core Architect", "architect"];

/**
 * Event create/edit/delete. Accepts an explicit MANAGE_EVENTS grant *or* the
 * roles that could already do this, so granting the permission starts working
 * without taking access away from anyone who had it.
 *
 * `architect` is the member rank, which has no AdminPermission record — it can
 * only ever be matched by role.
 */
export function canManageEvents(session: Session | null): boolean {
  if (hasPermission(session, "MANAGE_EVENTS")) return true;
  return LEGACY_EVENT_ROLES.includes(session?.user?.role ?? "");
}
