export const adminRoutes = {
  dashboard: "/",
  menu: "/menu",
  gallery: "/gallery",
  content: "/content",
  hours: "/hours",
  reservations: "/reservations",
  users: "/users",
  login: "/login",
  menuItem: (id: string) => `/menu/${id}` as const,
  reservation: (id: string) => `/reservations/${id}` as const,
} as const;

export type AdminPath =
  | (typeof adminRoutes)[Exclude<
      keyof typeof adminRoutes,
      "menuItem" | "reservation"
    >]
  | ReturnType<typeof adminRoutes.menuItem>
  | ReturnType<typeof adminRoutes.reservation>;
