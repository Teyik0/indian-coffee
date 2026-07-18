import type { AdminSession } from "@/api/plugins/better-auth.plugin";
import { getSession, isBackOfficeUser } from "@/api/plugins/better-auth.plugin";

type Redirect = (location: string, status?: 301 | 302 | 303 | 307 | 308) => Response;

export type AdminPermission =
  | "dashboard:read"
  | "menu:write"
  | "gallery:write"
  | "content:write"
  | "hours:write"
  | "reservations:write"
  | "users:read";

const editorPermissions: ReadonlySet<AdminPermission> = new Set([
  "dashboard:read",
  "menu:write",
  "gallery:write",
  "content:write",
  "hours:write",
  "reservations:write",
]);

export function hasAdminPermission(role: string | null | undefined, permission: AdminPermission) {
  return role === "admin" || (role === "editor" && editorPermissions.has(permission));
}

export async function requireBackOfficeSession(
  request: Request,
  redirect: Redirect,
  permission: AdminPermission = "dashboard:read",
): Promise<NonNullable<AdminSession>> {
  const current = await getSession(request);
  if (!current || !isBackOfficeUser(current)) {
    throw redirect("/login", 302);
  }
  if (!hasAdminPermission(current.user.role, permission)) {
    throw new Response("Accès refusé.", { status: 403 });
  }
  return current;
}
