import * as Effect from "effect4/Effect";
import {
  AlertTriangleIcon,
  CalendarCheckIcon,
  CircleOffIcon,
  ClockIcon,
  ImageIcon,
  SoupIcon,
  UsersIcon,
} from "lucide-react";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { AdminLink } from "@/components/admin/admin-link";
import { AdminPage, StatTile } from "@/components/admin/page-shell";
import { adminRoutes } from "@/components/admin/routes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { apiEffect, getApi, runLoaderEffect } from "@/lib/api-client";
import {
  formatIsoDay,
  formatRelative,
  formatTime,
  MENU_STATUS_LABELS,
  RESERVATION_STATUS_LABELS,
} from "@/lib/format";
import { route } from "./root";

export default route.page({
  loader: ({ request, redirect }) =>
    runLoaderEffect(
      Effect.gen(function* () {
        yield* requireBackOfficeSession(request, redirect, "dashboard:read");
        const { dashboard, unavailable } = yield* Effect.all(
          {
            dashboard: apiEffect((signal) =>
              getApi().api.admin.dashboard.get({
                fetch: { signal },
                headers: request.headers,
              })
            ),
            unavailable: apiEffect((signal) =>
              getApi().api.admin.dashboard.unavailable.get({
                fetch: { signal },
                headers: request.headers,
              })
            ),
          },
          { concurrency: "unbounded" }
        );
        return { dashboard, unavailable };
      }),
      request.signal
    ),
  component: ({ dashboard, unavailable }) => {
    const { stats, today, openState, upcomingExceptions, recentEvents } =
      dashboard;
    let openStateDescription = "Fermé aujourd’hui";
    if (openState.isOpen) {
      openStateDescription = `Service en cours · fermeture à ${openState.closesAt}`;
    } else if (openState.nextOpensAt) {
      openStateDescription = `Fermé · réouverture ${openState.nextOpensDay} à ${openState.nextOpensAt}`;
    }

    return (
      <AdminPage
        actions={
          <Button
            nativeButton={false}
            render={<AdminLink to={adminRoutes.reservations} />}
            size="sm"
          >
            <CalendarCheckIcon data-icon="inline-start" />
            Voir les réservations
          </Button>
        }
        description={openStateDescription}
        eyebrow="Tableau de bord"
        title="Le service, en un coup d’œil."
      >
        {stats.failedJobs > 0 ? (
          <Alert variant="destructive">
            <AlertTriangleIcon />
            <AlertTitle>
              {stats.failedJobs} envoi{stats.failedJobs > 1 ? "s" : ""} en échec
            </AlertTitle>
            <AlertDescription>
              Des courriels de réservation n’ont pas pu être envoyés après
              plusieurs tentatives. Vérifiez la configuration Resend.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="admin-dashboard-primary-stats grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            hint={`${today.covers} couvert${today.covers > 1 ? "s" : ""} attendu${today.covers > 1 ? "s" : ""}`}
            icon={<CalendarCheckIcon />}
            label="Réservations aujourd’hui"
            value={today.reservations.length}
          />
          <StatTile
            hint={
              stats.pending > 0
                ? "En attente de votre décision"
                : "Tout est traité"
            }
            icon={<ClockIcon />}
            label="Demandes à confirmer"
            tone={stats.pending > 0 ? "attention" : "positive"}
            value={stats.pending}
          />
          <StatTile
            hint={`${stats.available} disponible${stats.available > 1 ? "s" : ""} sur ${stats.dishes}`}
            icon={<SoupIcon />}
            label="Plats à la carte"
            value={stats.dishes}
          />
          <StatTile
            hint={
              stats.hidden > 0 ? `dont ${stats.hidden} masqué(s)` : undefined
            }
            icon={<CircleOffIcon />}
            label="Plats indisponibles"
            tone={stats.unavailable > 0 ? "attention" : "default"}
            value={stats.unavailable}
          />
        </div>

        <div className="admin-dashboard-service-grid grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card className="admin-dashboard-service-card">
            <CardHeader>
              <CardTitle>Service du jour</CardTitle>
              <CardDescription>{formatIsoDay(today.day)}</CardDescription>
            </CardHeader>
            <CardContent>
              {today.reservations.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CalendarCheckIcon />
                    </EmptyMedia>
                    <EmptyTitle>Aucune réservation aujourd’hui</EmptyTitle>
                    <EmptyDescription>
                      Les demandes reçues pour aujourd’hui apparaîtront ici.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul className="flex flex-col divide-y">
                  {today.reservations.map((reservation) => (
                    <li
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                      key={reservation.id}
                    >
                      <span className="numeric w-14 shrink-0 font-display text-lg">
                        {formatTime(reservation.requestedAt)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <AdminLink
                          className="block truncate font-medium hover:underline"
                          to={adminRoutes.reservation(reservation.id)}
                        >
                          {reservation.fullName}
                        </AdminLink>
                        <span className="block truncate text-muted-foreground text-xs">
                          {reservation.partySize} pers. ·{" "}
                          {reservation.reference}
                        </span>
                      </span>
                      <Badge
                        variant={
                          reservation.status === "PENDING"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {RESERVATION_STATUS_LABELS[reservation.status]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="admin-dashboard-side-card">
              <CardHeader>
                <CardTitle>À remettre à la carte</CardTitle>
                <CardDescription>
                  Plats retirés du service ou masqués.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unavailable.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Toute la carte est disponible.
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y">
                    {unavailable.map((item) => (
                      <li
                        className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                        key={item.id}
                      >
                        <AdminLink
                          className="min-w-0 truncate text-sm hover:underline"
                          to={adminRoutes.menuItem(item.id)}
                        >
                          {item.name}
                        </AdminLink>
                        <Badge variant="outline">
                          {MENU_STATUS_LABELS[item.status]}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="admin-dashboard-side-card">
              <CardHeader>
                <CardTitle>Fermetures à venir</CardTitle>
                <CardDescription>
                  Les réservations sont automatiquement refusées ces jours-là.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {upcomingExceptions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Aucune fermeture exceptionnelle programmée.
                  </p>
                ) : (
                  upcomingExceptions.map((exception) => (
                    <div
                      className="flex items-center justify-between gap-3 text-sm"
                      key={exception.id}
                    >
                      <span>{formatIsoDay(exception.day)}</span>
                      <span className="text-muted-foreground">
                        {exception.isClosed
                          ? (exception.label ?? "Fermé")
                          : `${exception.opensAt?.slice(0, 5)} — ${exception.closesAt?.slice(0, 5)}`}
                      </span>
                    </div>
                  ))
                )}
                <Button
                  className="mt-1 self-start"
                  nativeButton={false}
                  render={<AdminLink to={adminRoutes.hours} />}
                  size="sm"
                  variant="outline"
                >
                  Gérer les horaires
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="admin-dashboard-activity-card">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Qui a confirmé ou refusé quoi, et quand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucune décision enregistrée pour l’instant.
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {recentEvents.map((event) => (
                  <li
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-2.5 text-sm first:pt-0 last:pb-0"
                    key={event.id}
                  >
                    <span className="font-medium">
                      {event.actorName ?? "Site public"}
                    </span>
                    <span className="text-muted-foreground">
                      {event.toStatus === "PENDING"
                        ? "a reçu la demande"
                        : `a marqué la demande « ${RESERVATION_STATUS_LABELS[event.toStatus].toLocaleLowerCase("fr-FR")} »`}
                    </span>
                    <AdminLink
                      className="font-mono text-xs hover:underline"
                      to={adminRoutes.reservation(event.reservationId)}
                    >
                      {event.reference}
                    </AdminLink>
                    <span className="ml-auto text-muted-foreground text-xs">
                      {formatRelative(event.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            icon={<ImageIcon />}
            label="Images en galerie"
            value={stats.galleryImages}
          />
          <StatTile
            icon={<CalendarCheckIcon />}
            label="Réservations confirmées"
            value={stats.confirmed}
          />
          <StatTile
            icon={<UsersIcon />}
            label="Total des demandes"
            value={stats.reservations}
          />
        </div>
      </AdminPage>
    );
  },
  head: () => ({
    meta: [
      { title: "Administration · Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
