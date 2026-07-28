import { getApi, unwrapApiResult } from "@/lib/api-client";
import type { AdminPermission } from "./permissions";
import { hasAdminPermission } from "./permissions";

type Redirect = (
  location: string,
  status?: 301 | 302 | 303 | 307 | 308
) => Response;

export type { AdminPermission } from "./permissions";
export { hasAdminPermission, isBackOfficeRole } from "./permissions";

export async function requireBackOfficeSession(
  request: Request,
  redirect: Redirect,
  permission: AdminPermission
) {
  const result = await getApi().api.admin.session.get({
    headers: request.headers,
  });
  if (result.error?.status === 401) {
    throw redirect("/admin/login", 302);
  }
  // Un compte créé par connexion sociale arrive avec le rôle `customer` : il
  // recevait un 403 en texte brut. On l'oriente vers un écran lisible.
  if (result.error?.status === 403) {
    throw redirect("/admin/forbidden", 302);
  }
  const current = unwrapApiResult(result);
  if (!hasAdminPermission(current.user.role, permission)) {
    throw redirect("/admin/forbidden", 302);
  }
  return current;
}
