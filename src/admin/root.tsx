import { createRoute } from "@teyik0/furin/client";
import { getSession } from "@/api/plugins/better-auth.plugin";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/styles/admin.css";

export const route = createRoute({
  loader: async ({ request }) => {
    const current = await getSession(request);
    return {
      adminUser: current
        ? { name: current.user.name, email: current.user.email, role: current.user.role }
        : null,
    };
  },
  layout: ({ children, adminUser }) => (
    <TooltipProvider>
      <div className="admin-shell">
        {adminUser ? <AdminShell user={adminUser}>{children}</AdminShell> : children}
      </div>
      <Toaster position="top-right" />
    </TooltipProvider>
  ),
});
