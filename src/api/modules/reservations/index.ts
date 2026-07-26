import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import {
  ReservationCreateSchema,
  ReservationParamsSchema,
  ReservationStatusUpdateSchema,
} from "./model";
import { reservationService } from "./service";

export const publicReservationRouter = new Elysia({
  name: "public-reservations",
  prefix: "/api/reservations",
}).post(
  "/",
  async ({ body, headers, request, set, status }) => {
    const origin = headers.origin;
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
  },
);

export const adminReservationRouter = new Elysia({
  name: "admin-reservations",
  prefix: "/api/admin/reservations",
})
  .use(betterAuthPlugin)
  .get("/", () => reservationService.list(), { onlyAdmin: true })
  .patch(
    "/:id/status",
    ({ params, body }) => reservationService.updateStatus(params.id, body),
    {
      onlyAdmin: true,
      params: ReservationParamsSchema,
      body: ReservationStatusUpdateSchema,
      sync: { invalidate: { tags: ["reservations"] } },
    },
  );
