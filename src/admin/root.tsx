import { createRoute } from "@teyik0/furin/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getApi } from "@/lib/api-client";
import "@/styles/admin.css";

export const route = createRoute({
  loader: async ({ request }) => {
    const { data } = await getApi().api.admin.session.get({
      headers: request.headers,
    });
    return {
      adminUser: data
        ? { name: data.user.name, email: data.user.email, role: data.user.role }
        : null,
    };
  },
  layout: ({ children, adminUser }) => (
    <TooltipProvider>
      <div className="admin-shell">
        {adminUser ? (
          <AdminShell user={adminUser}>{children}</AdminShell>
        ) : (
          children
        )}
      </div>
      <Toaster position="top-right" />
    </TooltipProvider>
  ),
});
