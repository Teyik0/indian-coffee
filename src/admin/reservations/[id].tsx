import { createRoute } from "@teyik0/furin/client";
import * as Effect from "effect4/Effect";
import { t } from "elysia";
import { ArrowLeftIcon } from "lucide-react";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { AdminLink } from "@/components/admin/admin-link";
import { AdminPage } from "@/components/admin/page-shell";
import { ReservationDetail } from "@/components/admin/reservation-detail";
import { adminRoutes } from "@/components/admin/routes";
import { Button } from "@/components/ui/button";
import { apiEffect, getApi, runLoaderEffect } from "@/lib/api-client";
import { route as rootRoute } from "../root";

const reservationRoute = createRoute({
  params: t.Object({ id: t.String() }),
  parent: rootRoute,
});

export default reservationRoute.page({
  loader: ({ request, redirect, params }) =>
    runLoaderEffect(
      Effect.gen(function* () {
        yield* requireBackOfficeSession(
          request,
          redirect,
          "reservations:write"
        );
        const { reservation, events } = yield* apiEffect((signal) =>
          getApi()
            .api.admin.reservations({ id: (params as { id: string }).id })
            .get({ fetch: { signal }, headers: request.headers })
        );
        return { events, reservation };
      }),
      request.signal
    ),
  component: ({ reservation, events }) => (
    <AdminPage
      breadcrumbs={
        <Button
          className="-ml-2 self-start"
          nativeButton={false}
          render={<AdminLink to={adminRoutes.reservations} />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Retour aux réservations
        </Button>
      }
      description={`Demande ${reservation.reference}`}
      title={reservation.fullName}
    >
      <ReservationDetail events={events} reservation={reservation} />
    </AdminPage>
  ),
  head: ({ reservation }) => ({
    meta: [
      { title: `${reservation.reference} · Administration Indian Coffee` },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
