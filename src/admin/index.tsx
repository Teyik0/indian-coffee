// biome-ignore-all lint/performance/noJsxPropsBind: Furin composite slots are component factories
import { Await, defer } from "@teyik0/furin/client";
import {
  CompositeComponent,
  createCompositeComponent,
} from "@teyik0/furin/rsc";
import { Clock3Icon, ImageIcon, SoupIcon, UsersIcon } from "lucide-react";
import { type ComponentType, Suspense } from "react";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "./root";

interface DashboardStats {
  dishes: number;
  pending: number;
  reservations: number;
  unavailable: number;
}

type IconComponent = ComponentType<{ className?: string }>;

function createDashboardContent(stats: DashboardStats) {
  return createCompositeComponent<{
    ClockIcon: IconComponent;
    ImageIcon: IconComponent;
    SoupIcon: IconComponent;
    UsersIcon: IconComponent;
  }>(({ ClockIcon, ImageIcon, SoupIcon, UsersIcon }) => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-muted-foreground">Aujourd’hui chez Indian Coffee</p>
        <h1 className="font-display text-4xl">Vue d’ensemble</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Plats publiés", value: stats.dishes, icon: SoupIcon },
          {
            label: "Indisponibles",
            value: stats.unavailable,
            icon: ClockIcon,
          },
          { label: "À confirmer", value: stats.pending, icon: UsersIcon },
          { label: "Réservations", value: stats.reservations, icon: ImageIcon },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-4xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <stat.icon className="text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Prêt pour le service</CardTitle>
          <CardDescription>
            Les modifications de la carte et les réservations sont centralisées
            dans ce back-office.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  ));
}

export default route.page({
  head: () => ({
    meta: [
      { title: "Administration · Indian Coffee" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "dashboard:read");
    const content = getApi()
      .api.admin.dashboard.get({ headers: request.headers })
      .then(unwrapApiResult)
      .then(({ stats }) => createDashboardContent(stats));
    return defer({ content });
  },
  component: ({ content }) => (
    <Suspense
      fallback={
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["a", "b", "c", "d"].map((key) => (
            <div className="h-36 animate-pulse rounded-xl bg-muted" key={key} />
          ))}
        </div>
      }
    >
      <Await resolve={content}>
        {(src) => (
          <CompositeComponent
            ClockIcon={(props) => <Clock3Icon {...props} />}
            ImageIcon={(props) => <ImageIcon {...props} />}
            SoupIcon={(props) => <SoupIcon {...props} />}
            UsersIcon={(props) => <UsersIcon {...props} />}
            src={src}
          />
        )}
      </Await>
    </Suspense>
  ),
});
