import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { reservationService } from "@/api/modules/reservations/service";
import { ReservationManager } from "@/components/admin/reservation-manager";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "reservations:write");
    return { reservations: await reservationService.list() };
  },
  component: ({ reservations }) => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-muted-foreground">Demandes à confirmer</p>
        <h1 className="font-display text-4xl">Réservations</h1>
      </div>
      <ReservationManager initialReservations={reservations} />
    </div>
  ),
});
