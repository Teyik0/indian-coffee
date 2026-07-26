import {
  CalendarClockIcon,
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  NotebookTabsIcon,
  PanelsTopLeftIcon,
  SoupIcon,
  UsersIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { type AdminPath, adminRoutes } from "@/components/admin/routes";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { AdminLink } from "./admin-link";

const links: Array<{
  to: AdminPath;
  label: string;
  icon: typeof LayoutDashboardIcon;
  adminOnly?: boolean;
}> = [
  {
    to: adminRoutes.dashboard,
    label: "Vue d’ensemble",
    icon: LayoutDashboardIcon,
  },
  { to: adminRoutes.menu, label: "Carte", icon: SoupIcon },
  { to: adminRoutes.gallery, label: "Galerie", icon: GalleryVerticalEndIcon },
  { to: adminRoutes.content, label: "Contenu", icon: NotebookTabsIcon },
  { to: adminRoutes.hours, label: "Horaires", icon: CalendarClockIcon },
  {
    to: adminRoutes.reservations,
    label: "Réservations",
    icon: PanelsTopLeftIcon,
  },
  {
    to: adminRoutes.users,
    label: "Utilisateurs",
    icon: UsersIcon,
    adminOnly: true,
  },
];

export function AdminShell({
  children,
  user,
}: {
  children: ReactNode;
  user: { name: string; email: string; role?: string | null };
}) {
  async function signOut() {
    await authClient.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<AdminLink to={adminRoutes.dashboard} />}
                size="lg"
                tooltip="Indian Coffee"
              >
                <img
                  alt=""
                  className="size-8 rounded-lg"
                  src="/admin/public/indian-coffee-logo.webp"
                />
                <span className="font-display text-lg">Indian Coffee</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {links
                  .filter((item) => !item.adminOnly || user.role === "admin")
                  .map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        render={<AdminLink to={item.to} />}
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="min-w-0 px-2 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-medium text-sm">{user.name}</p>
            <p className="truncate text-sidebar-foreground/60 text-xs">
              {user.email}
            </p>
          </div>
          <Button onClick={signOut} size="sm" variant="ghost">
            <LogOutIcon data-icon="inline-start" /> Déconnexion
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-xl">
          <SidebarTrigger />
          <span className="text-muted-foreground text-sm">
            Back-office Indian Coffee
          </span>
          <Button
            className="ml-auto"
            nativeButton={false}
            render={
              <a aria-label="Voir le site public Indian Coffee" href="/" />
            }
            size="sm"
            variant="outline"
          >
            Voir le site
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-7">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
