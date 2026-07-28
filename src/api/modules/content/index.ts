import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import {
  HomeContentSchema,
  ReservationSettingsSchema,
  SiteSettingsSchema,
  SpecialHoursParamsSchema,
  SpecialHoursSchema,
  WeeklyHoursSchema,
} from "./model";
import { openingHoursService } from "./opening-hours.service";
import { contentService } from "./service";

const invalidateContent = { invalidate: { tags: ["content"] } } as const;

export const contentRouter = new Elysia({
  name: "content",
  prefix: "/api/admin/content",
})
  .use(betterAuthPlugin)
  .get("/", () => contentService.get(), { onlyAdmin: true })
  .patch("/settings", ({ body }) => contentService.updateSettings(body), {
    body: SiteSettingsSchema,
    onlyAdmin: true,
    sync: invalidateContent,
  })
  .patch("/home", ({ body }) => contentService.updateHome(body), {
    body: HomeContentSchema,
    onlyAdmin: true,
    sync: invalidateContent,
  })
  .patch(
    "/reservation-settings",
    ({ body }) => contentService.updateReservationSettings(body),
    {
      body: ReservationSettingsSchema,
      onlyAdmin: true,
      sync: invalidateContent,
    }
  )
  .get("/hours", () => openingHoursService.getWeek(), { onlyAdmin: true })
  .put(
    "/hours",
    ({ body }) =>
      openingHoursService.replaceWeek(
        body.days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          isClosed: day.isClosed,
          ranges: day.ranges,
        }))
      ),
    { body: WeeklyHoursSchema, onlyAdmin: true, sync: invalidateContent }
  )
  .get("/special-hours", () => openingHoursService.getUpcomingExceptions(), {
    onlyAdmin: true,
  })
  .put(
    "/special-hours",
    ({ body }) => openingHoursService.upsertException(body),
    { body: SpecialHoursSchema, onlyAdmin: true, sync: invalidateContent }
  )
  .delete(
    "/special-hours/:id",
    ({ params }) => openingHoursService.deleteException(params.id),
    {
      onlyAdmin: true,
      params: SpecialHoursParamsSchema,
      sync: invalidateContent,
    }
  );
