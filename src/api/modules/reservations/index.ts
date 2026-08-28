import { Elysia } from "elysia";
import { ReservationService } from "@/api/effect/domain-services";
import { runApiService } from "@/api/effect/runtime";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import {
  AvailabilityQuerySchema,
  CalendarQuerySchema,
  ReservationCreateSchema,
  ReservationListQuerySchema,
  ReservationParamsSchema,
  ReservationStatusUpdateSchema,
} from "./model";

export const publicReservationRouter = new Elysia({
  name: "public-reservations",
  prefix: "/api/reservations",
})
  // Le formulaire interroge ces deux routes pour griser les jours fermés et
  // proposer des créneaux réels au lieu d'un champ heure libre.
  .get(
    "/calendar",
    ({ query, request }) =>
      runApiService(
        ReservationService,
        (service) => service.getCalendar(query.from, query.days),
        request.signal
      ),
    { query: CalendarQuerySchema }
  )
  .get(
    "/availability",
    ({ query, request }) =>
      runApiService(
        ReservationService,
        (service) => service.getAvailability(query.date),
        request.signal
      ),
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
      const result = await runApiService(
        ReservationService,
        (service) =>
          service.create(body, {
            idempotencyKey: headers["idempotency-key"] ?? crypto.randomUUID(),
            ip: headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? "unknown",
          }),
        request.signal
      );
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
  .get(
    "/",
    ({ query, request }) =>
      runApiService(
        ReservationService,
        (service) => service.list(query),
        request.signal
      ),
    {
      onlyAdmin: true,
      query: ReservationListQuerySchema,
    }
  )
  .get(
    "/today",
    ({ request }) =>
      runApiService(
        ReservationService,
        (service) => service.listForDay(),
        request.signal
      ),
    { onlyAdmin: true }
  )
  .get(
    "/:id",
    ({ params, request }) =>
      runApiService(
        ReservationService,
        (service) => service.getById(params.id),
        request.signal
      ),
    {
      onlyAdmin: true,
      params: ReservationParamsSchema,
    }
  )
  .patch(
    "/:id/status",
    ({ params, body, request, user }) =>
      runApiService(
        ReservationService,
        (service) =>
          service.updateStatus(params.id, body, {
            id: user.id,
            name: user.name,
          }),
        request.signal
      ),
    {
      body: ReservationStatusUpdateSchema,
      onlyAdmin: true,
      params: ReservationParamsSchema,
      sync: { invalidate: { tags: ["reservations"] } },
    }
  );
