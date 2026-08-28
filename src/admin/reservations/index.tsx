import * as Effect from "effect4/Effect";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { AdminPage } from "@/components/admin/page-shell";
import { ReservationManager } from "@/components/admin/reservation-manager";
import { apiEffect, getApi, runLoaderEffect } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: ({ request, redirect }) =>
    runLoaderEffect(
      Effect.gen(function* () {
        yield* requireBackOfficeSession(
          request,
          redirect,
          "reservations:write"
        );
        // Les demandes à confirmer sont triées par échéance croissante : on traite
        // d'abord ce qui arrive le plus tôt.
        const result = yield* apiEffect((signal) =>
          getApi().api.admin.reservations.get({
            fetch: { signal },
            headers: request.headers,
            query: {
              order: "asc",
              page: 1,
              pageSize: 25,
              status: ["PENDING"],
            },
          })
        );
        return { result };
      }),
      request.signal
    ),
  component: ({ result }) => (
    <AdminPage
      description="Confirmez ou refusez les demandes. Chaque décision envoie un courriel au client et reste tracée dans le journal."
      title="Réservations"
    >
      <ReservationManager initialResult={result} />
    </AdminPage>
  ),
  head: () => ({
    meta: [
      { title: "Réservations · Administration Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
