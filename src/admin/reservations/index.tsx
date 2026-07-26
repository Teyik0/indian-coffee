// biome-ignore-all lint/performance/noJsxPropsBind: Furin composite slots are component factories
import { CompositeComponent } from "@teyik0/furin/rsc";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { createAdminPageShell } from "@/components/admin/admin-page-rsc";
import { ReservationManager } from "@/components/admin/reservation-manager";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "reservations:write");
    const reservations = unwrapApiResult(
      await getApi().api.admin.reservations.get({ headers: request.headers }),
    );
    return {
      reservations,
      shell: await createAdminPageShell("Demandes à confirmer", "Réservations"),
    };
  },
  component: ({ reservations, shell }) => (
    <CompositeComponent
      src={shell}
      Content={() => <ReservationManager initialReservations={reservations} />}
    />
  ),
});
