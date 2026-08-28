import * as Effect from "effect4/Effect";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { HoursManager } from "@/components/admin/hours-manager";
import { AdminPage } from "@/components/admin/page-shell";
import { Badge } from "@/components/ui/badge";
import { apiEffect, getApi, runLoaderEffect } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: ({ request, redirect }) =>
    runLoaderEffect(
      Effect.gen(function* () {
        yield* requireBackOfficeSession(request, redirect, "hours:write");
        const { content, exceptions, week } = yield* Effect.all(
          {
            week: apiEffect((signal) =>
              getApi().api.admin.content.hours.get({
                fetch: { signal },
                headers: request.headers,
              })
            ),
            exceptions: apiEffect((signal) =>
              getApi().api.admin.content["special-hours"].get({
                fetch: { signal },
                headers: request.headers,
              })
            ),
            content: apiEffect((signal) =>
              getApi().api.admin.content.get({
                fetch: { signal },
                headers: request.headers,
              })
            ),
          },
          { concurrency: "unbounded" }
        );
        return { exceptions, openState: content.openState, week };
      }),
      request.signal
    ),
  component: ({ week, exceptions, openState }) => {
    let statusLabel = "Fermé";
    if (openState.isOpen) {
      statusLabel = `Ouvert · ferme à ${openState.closesAt}`;
    } else if (openState.nextOpensAt) {
      statusLabel = `Fermé · réouvre ${openState.nextOpensDay} à ${openState.nextOpensAt}`;
    }

    return (
      <AdminPage
        actions={
          <Badge variant={openState.isOpen ? "secondary" : "outline"}>
            {statusLabel}
          </Badge>
        }
        description="Ces horaires pilotent l’affichage public, le badge « ouvert maintenant » et les créneaux de réservation proposés aux clients."
        title="Horaires"
      >
        <HoursManager initialExceptions={exceptions} initialWeek={week} />
      </AdminPage>
    );
  },
  head: () => ({
    meta: [
      { title: "Horaires · Administration Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
