import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import {
  AvailabilityQuerySchema,
  CalendarQuerySchema,
  ReservationCreateSchema,
  ReservationListQuerySchema,
  ReservationParamsSchema,
  ReservationStatusUpdateSchema,
} from "./model";
import { reservationService } from "./service";

export const publicReservationRouter = new Elysia({
  name: "public-reservations",
  prefix: "/api/reservations",
})
  // Le formulaire interroge ces deux routes pour griser les jours fermés et
  // proposer des créneaux réels au lieu d'un champ heure libre.
  .get(
    "/calendar",
    ({ query }) => reservationService.getCalendar(query.from, query.days),
    { query: CalendarQuerySchema }
  )
  .get(
    "/availability",
    ({ query }) => reservationService.getAvailability(query.date),
    { query: AvailabilityQuerySchema }
  )
  .post(
    "/",
    async ({ body, headers, request, set, status }) => {
      const { origin } = headers;
      if (origin && URL.parse(origin)?.origin !== new URL(request.url).origin) {
        return status(403, {
          code: "INVALID_ORIGIN",
          message: "Origine de la requête refusée.",
        });
      }
      const result = await reservationService.create(body, {
        idempotencyKey: headers["idempotency-key"] ?? crypto.randomUUID(),
        ip: headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? "unknown",
      });
      set.status = 201;
      return result;
    },
    {
      body: ReservationCreateSchema,
      sync: { invalidate: { tags: ["reservations"] } },
    }
  );

export const adminReservationRouter = new Elysia({
  name: "admin-reservations",
  prefix: "/api/admin/reservations",
})
  .use(betterAuthPlugin)
  .get("/", ({ query }) => reservationService.list(query), {
    onlyAdmin: true,
    query: ReservationListQuerySchema,
  })
  .get("/today", () => reservationService.listForDay(), { onlyAdmin: true })
  .get("/:id", ({ params }) => reservationService.getById(params.id), {
    onlyAdmin: true,
    params: ReservationParamsSchema,
  })
  .patch(
    "/:id/status",
    ({ params, body, user }) =>
      reservationService.updateStatus(params.id, body, {
        id: user.id,
        name: user.name,
      }),
    {
      body: ReservationStatusUpdateSchema,
      onlyAdmin: true,
      params: ReservationParamsSchema,
      sync: { invalidate: { tags: ["reservations"] } },
    }
  );
