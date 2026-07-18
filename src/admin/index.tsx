import { Clock3Icon, ImageIcon, SoupIcon, UsersIcon } from "lucide-react";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { menuService } from "@/api/modules/menu/service";
import { reservationService } from "@/api/modules/reservations/service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { route } from "./root";

export default route.page({
  head: () => ({
    meta: [
      { title: "Administration · Indian Coffee" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect);
    const [menu, reservations] = await Promise.all([
      menuService.getPublic({}),
      reservationService.list(),
    ]);
    const items = menu.flatMap((category) => category.sections.flatMap((section) => section.items));
    return {
      stats: {
        dishes: items.length,
        unavailable: items.filter((item) => item.status === "UNAVAILABLE").length,
        pending: reservations.filter((reservation) => reservation.status === "PENDING").length,
        reservations: reservations.length,
      },
    };
  },
  component: ({ stats }) => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-muted-foreground">Aujourd’hui chez Indian Coffee</p>
        <h1 className="font-display text-4xl">Vue d’ensemble</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Plats publiés", value: stats.dishes, icon: SoupIcon },
          { label: "Indisponibles", value: stats.unavailable, icon: Clock3Icon },
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
            Les modifications de la carte et les réservations sont centralisées dans ce back-office.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
});
