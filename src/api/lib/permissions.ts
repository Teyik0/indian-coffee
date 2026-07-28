/**
 * Source unique des droits du back-office, volontairement sans dépendance : le
 * plugin Better Auth (API) et le garde de page (`protected-admin-page`) doivent
 * tous deux l'utiliser sans créer de cycle d'import.
 */

export type AdminPermission =
  | "dashboard:read"
  | "menu:write"
  | "gallery:write"
  | "content:write"
  | "hours:write"
  | "reservations:write"
  | "users:read"
  | "users:write";

const ROLE_PERMISSIONS: Record<string, readonly AdminPermission[]> = {
  admin: [
    "dashboard:read",
    "menu:write",
    "gallery:write",
    "content:write",
    "hours:write",
    "reservations:write",
    "users:read",
    "users:write",
  ],
  // L'équipe de salle gère le service et la carte, jamais les comptes.
  editor: [
    "dashboard:read",
    "menu:write",
    "gallery:write",
    "content:write",
    "hours:write",
    "reservations:write",
  ],
};

/**
 * `hasAdminPermission` ignorait auparavant son argument `permission` et
 * n'autorisait que le rôle `admin`, ce qui rendait `editor` — le rôle par défaut
 * de Better Auth — inutilisable partout.
 */
export function hasAdminPermission(
  role: string | null | undefined,
  permission: AdminPermission
) {
  if (!role) {
    return false;
  }
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Un compte sans aucun droit n'a rien à faire dans le back-office. */
export function isBackOfficeRole(role: string | null | undefined) {
  return Boolean(role && role in ROLE_PERMISSIONS);
}

export const BACK_OFFICE_ROLES = Object.keys(ROLE_PERMISSIONS);
