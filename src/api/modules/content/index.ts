import { Elysia } from "elysia";
import {
  ContentService,
  OpeningHoursService,
} from "@/api/effect/domain-services";
import { runApiService } from "@/api/effect/runtime";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import {
  HomeContentSchema,
  ReservationSettingsSchema,
  SiteSettingsSchema,
  SpecialHoursParamsSchema,
  SpecialHoursSchema,
  WeeklyHoursSchema,
} from "./model";

const invalidateContent = { invalidate: { tags: ["content"] } } as const;

export const contentRouter = new Elysia({
  name: "content",
  prefix: "/api/admin/content",
})
  .use(betterAuthPlugin)
  .get(
    "/",
    ({ request }) =>
      runApiService(ContentService, (service) => service.get(), request.signal),
    { onlyAdmin: true }
  )
  .patch(
    "/settings",
    ({ body, request }) =>
      runApiService(
        ContentService,
        (service) => service.updateSettings(body),
        request.signal
      ),
    {
      body: SiteSettingsSchema,
      onlyAdmin: true,
      sync: invalidateContent,
    }
  )
  .patch(
    "/home",
    ({ body, request }) =>
      runApiService(
        ContentService,
        (service) => service.updateHome(body),
        request.signal
      ),
    {
      body: HomeContentSchema,
      onlyAdmin: true,
      sync: invalidateContent,
    }
  )
  .patch(
    "/reservation-settings",
    ({ body, request }) =>
      runApiService(
        ContentService,
        (service) => service.updateReservationSettings(body),
        request.signal
      ),
    {
      body: ReservationSettingsSchema,
      onlyAdmin: true,
      sync: invalidateContent,
    }
  )
  .get(
    "/hours",
    ({ request }) =>
      runApiService(
        OpeningHoursService,
        (service) => service.getWeek(),
        request.signal
      ),
    { onlyAdmin: true }
  )
  .put(
    "/hours",
    ({ body, request }) =>
      runApiService(
        OpeningHoursService,
        (service) =>
          service.replaceWeek(
            body.days.map((day) => ({
              dayOfWeek: day.dayOfWeek,
              isClosed: day.isClosed,
              ranges: day.ranges,
            }))
          ),
        request.signal
      ),
    { body: WeeklyHoursSchema, onlyAdmin: true, sync: invalidateContent }
  )
  .get(
    "/special-hours",
    ({ request }) =>
      runApiService(
        OpeningHoursService,
        (service) => service.getUpcomingExceptions(),
        request.signal
      ),
    {
      onlyAdmin: true,
    }
  )
  .put(
    "/special-hours",
    ({ body, request }) =>
      runApiService(
        OpeningHoursService,
        (service) => service.upsertException(body),
        request.signal
      ),
    { body: SpecialHoursSchema, onlyAdmin: true, sync: invalidateContent }
  )
  .delete(
    "/special-hours/:id",
    ({ params, request }) =>
      runApiService(
        OpeningHoursService,
        (service) => service.deleteException(params.id),
        request.signal
      ),
    {
      onlyAdmin: true,
      params: SpecialHoursParamsSchema,
      sync: invalidateContent,
    }
  );
