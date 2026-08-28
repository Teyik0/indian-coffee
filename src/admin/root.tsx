import { createRoute } from "@teyik0/furin/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { readThemeCookie } from "@/components/admin/theme-toggle";
import { PortalScope } from "@/components/ui/portal-scope";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getApi } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import "@/styles/admin.css";

export const route = createRoute({
  loader: async ({ request }) => {
    const { data } = await getApi().api.admin.session.get({
      headers: request.headers,
    });
    const theme = readThemeCookie(request.headers.get("cookie"));
    if (!data) {
      return { adminUser: null, pendingReservations: 0, theme };
    }

    const pending = await getApi().api.admin.reservations.get({
      headers: request.headers,
      query: { order: "desc", page: 1, pageSize: 1, status: ["PENDING"] },
    });

    return {
      adminUser: {
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      },
      pendingReservations: pending.data?.total ?? 0,
      theme,
    };
  },
  layout: ({ children, adminUser, theme, pendingReservations }) => (
    <>
      <script>{'document.documentElement.lang="fr";'}</script>
      <TooltipProvider>
        {/* La classe est posée au rendu serveur d'après le cookie : pas de flash
            clair avant l'hydratation. Le conteneur peint lui-même la surface,
            faute de contrôler la balise `html` depuis une mise en page Furin. */}
        <PortalScope
          className={cn(
            "admin-shell min-h-screen bg-background text-foreground",
            theme === "dark" && "dark"
          )}
        >
          {adminUser ? (
            <AdminShell
              pendingReservations={pendingReservations}
              theme={theme}
              user={adminUser}
            >
              {children}
            </AdminShell>
          ) : (
            children
          )}
          <Toaster position="top-right" />
        </PortalScope>
      </TooltipProvider>
    </>
  ),
});
