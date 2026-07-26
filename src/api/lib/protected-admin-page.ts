import { getApi, unwrapApiResult } from "@/lib/api-client";

type Redirect = (
  location: string,
  status?: 301 | 302 | 303 | 307 | 308,
) => Response;

export type AdminPermission =
  | "dashboard:read"
  | "menu:write"
  | "gallery:write"
  | "content:write"
  | "hours:write"
  | "reservations:write"
  | "users:read";

export function hasAdminPermission(
  role: string | null | undefined,
  _permission: AdminPermission,
) {
  return role === "admin";
}

export async function requireBackOfficeSession(
  request: Request,
  redirect: Redirect,
  permission: AdminPermission,
) {
  const result = await getApi().api.admin.session.get({
    headers: request.headers,
  });
  if (result.error?.status === 401) {
    throw redirect("/admin/login", 302);
  }
  const current = unwrapApiResult(result);
  if (!hasAdminPermission(current.user.role, permission)) {
    throw new Response("Accès refusé.", { status: 403 });
  }
  return current;
}
