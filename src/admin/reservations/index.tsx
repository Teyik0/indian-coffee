import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { AdminPage } from "@/components/admin/page-shell";
import { ReservationManager } from "@/components/admin/reservation-manager";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "reservations:write");
    // Les demandes à confirmer sont triées par échéance croissante : on traite
    // d'abord ce qui arrive le plus tôt.
    const result = unwrapApiResult(
      await getApi().api.admin.reservations.get({
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
  },
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
