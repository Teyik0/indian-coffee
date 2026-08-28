import { useRouter } from "@teyik0/furin/link";
import * as Effect from "effect4/Effect";
import {
  CalendarClockIcon,
  ChevronsUpDownIcon,
  ExternalLinkIcon,
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  NotebookTabsIcon,
  SoupIcon,
  UsersIcon,
  UtensilsCrossedIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { AdminPermission } from "@/api/lib/permissions";
import { hasAdminPermission } from "@/api/lib/permissions";
import {
  type AdminPath,
  adminRoutes,
  isActiveAdminPath,
} from "@/components/admin/routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { type AdminTheme, ThemeToggle } from "./theme-toggle";

interface NavItem {
  icon: typeof LayoutDashboardIcon;
  label: string;
  permission: AdminPermission;
  to: AdminPath;
}

/**
 * Navigation groupée par métier : ce qui concerne le service du jour d'un côté,
 * la carte de l'autre, la configuration en dernier. La liste plate précédente
 * mélangeait « Réservations » et « Utilisateurs » au même niveau.
 */
const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    items: [
      {
        icon: LayoutDashboardIcon,
        label: "Vue d’ensemble",
        permission: "dashboard:read",
        to: adminRoutes.dashboard,
      },
      {
        icon: UtensilsCrossedIcon,
        label: "Réservations",
        permission: "reservations:write",
        to: adminRoutes.reservations,
      },
      {
        icon: CalendarClockIcon,
        label: "Horaires",
        permission: "hours:write",
        to: adminRoutes.hours,
      },
    ],
    label: "Service",
  },
  {
    items: [
      {
        icon: SoupIcon,
        label: "Carte",
        permission: "menu:write",
        to: adminRoutes.menu,
      },
      {
        icon: GalleryVerticalEndIcon,
        label: "Galerie",
        permission: "gallery:write",
        to: adminRoutes.gallery,
      },
      {
        icon: NotebookTabsIcon,
        label: "Contenu",
        permission: "content:write",
        to: adminRoutes.content,
      },
    ],
    label: "Carte & médias",
  },
  {
    items: [
      {
        icon: UsersIcon,
        label: "Utilisateurs",
        permission: "users:read",
        to: adminRoutes.users,
      },
    ],
    label: "Administration",
  },
];

const HREF_SUFFIX_PATTERN = /[?#]/;
const WHITESPACE_PATTERN = /\s+/;

function initials(name: string) {
  return name
    .split(WHITESPACE_PATTERN)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("fr-FR") ?? "")
    .join("");
}

function signOut() {
  Effect.runPromise(
    authClient.signOut().pipe(
      Effect.ensuring(
        Effect.sync(() => {
          window.location.href = "/admin/login";
        })
      )
    )
  );
}

export function AdminShell({
  children,
  user,
  theme,
  pendingReservations = 0,
}: {
  children: ReactNode;
  user: { name: string; email: string; role?: string | null };
  theme: AdminTheme;
  pendingReservations?: number;
}) {
  // `currentHref` est réactif et ne contient pas le préfixe `/admin` : le menu
  // reste donc synchronisé après chaque navigation côté client.
  const { currentHref } = useRouter();
  const pathname = currentHref.split(HREF_SUFFIX_PATTERN, 1)[0] || "/";

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      hasAdminPermission(user.role, item.permission)
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <SidebarProvider className="admin-comptoir">
      <Sidebar className="admin-sidebar" collapsible="icon">
        <SidebarHeader className="admin-sidebar-header">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<AdminLink to={adminRoutes.dashboard} />}
                size="lg"
                tooltip="Indian Coffee"
              >
                <img
                  alt=""
                  className="admin-brand-logo size-8 rounded-lg"
                  height={32}
                  src="/admin/public/indian-coffee-logo.webp"
                  width={32}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-display text-base leading-tight">
                    Indian Coffee
                  </span>
                  <span className="truncate text-sidebar-foreground/60 text-xs">
                    Back-office
                  </span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {visibleGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        // `isActive` était supporté mais jamais transmis : on ne
                        // pouvait pas savoir sur quel écran on se trouvait.
                        isActive={isActiveAdminPath(pathname, item.to)}
                        render={<AdminLink to={item.to} />}
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                        {item.to === adminRoutes.reservations &&
                        pendingReservations > 0 ? (
                          <Badge
                            className="ml-auto group-data-[collapsible=icon]:hidden"
                            variant="secondary"
                          >
                            {pendingReservations}
                          </Badge>
                        ) : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton size="lg" tooltip={user.name}>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground text-xs">
                        {initials(user.name)}
                      </span>
                      <span className="flex min-w-0 flex-col text-left">
                        <span className="truncate font-medium text-sm">
                          {user.name}
                        </span>
                        <span className="truncate text-sidebar-foreground/60 text-xs">
                          {user.email}
                        </span>
                      </span>
                      <ChevronsUpDownIcon className="ml-auto size-4" />
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent align="start" className="w-56" side="top">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <span className="block font-medium">{user.name}</span>
                      <span className="block text-muted-foreground text-xs">
                        {user.role === "admin"
                          ? "Administrateur"
                          : "Équipe de salle"}
                      </span>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} variant="destructive">
                    <LogOutIcon />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="admin-inset">
        <header className="admin-topbar sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-xl">
          <SidebarTrigger />
          {pendingReservations > 0 ? (
            <Button
              nativeButton={false}
              render={<AdminLink to={adminRoutes.reservations} />}
              size="sm"
              variant="secondary"
            >
              <span
                aria-hidden
                className="admin-status-dot admin-status-dot--attention"
              />
              {pendingReservations} demande
              {pendingReservations > 1 ? "s" : ""} à confirmer
            </Button>
          ) : (
            <span className="admin-service-status text-sm">
              <span aria-hidden className="admin-status-dot" />
              Service prêt · aucune demande en attente
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle initialTheme={theme} />
            <Button
              className="gap-2"
              nativeButton={false}
              render={
                <a
                  aria-label="Ouvrir le site public dans un nouvel onglet"
                  href="/"
                  rel="noreferrer"
                  target="_blank"
                />
              }
              size="sm"
              variant="outline"
            >
              Voir le site
              <ExternalLinkIcon />
            </Button>
          </div>
        </header>
        <main className="admin-main flex-1 p-4 md:p-7">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
