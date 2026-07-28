export const adminRoutes = {
  content: "/content",
  dashboard: "/",
  designs: "/designs",
  forbidden: "/forbidden",
  gallery: "/gallery",
  hours: "/hours",
  login: "/login",
  menu: "/menu",
  menuItem: (id: string) => `/menu/${id}` as const,
  reservation: (id: string) => `/reservations/${id}` as const,
  reservations: "/reservations",
  users: "/users",
} as const;

export type AdminPath =
  | (typeof adminRoutes)[Exclude<
      keyof typeof adminRoutes,
      "menuItem" | "reservation"
    >]
  | ReturnType<typeof adminRoutes.menuItem>
  | ReturnType<typeof adminRoutes.reservation>;

const ADMIN_PREFIX_PATTERN = /^\/admin/;

/**
 * Une entrée de navigation est active sur sa propre page et sur ses écrans de
 * détail : `/menu/<id>` doit surligner « Carte ». Le tableau de bord est traité
 * à part, sinon `/` correspondrait à toutes les routes.
 */
export function isActiveAdminPath(current: string, target: AdminPath) {
  const path = current.replace(ADMIN_PREFIX_PATTERN, "") || "/";
  if (target === adminRoutes.dashboard) {
    return path === "/";
  }
  return path === target || path.startsWith(`${target}/`);
}
