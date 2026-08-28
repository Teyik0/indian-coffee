import * as Context from "effect4/Context";
import * as Layer from "effect4/Layer";
import { openingHoursService } from "@/api/modules/content/opening-hours.service";
import { contentService } from "@/api/modules/content/service";
import { dashboardService } from "@/api/modules/dashboard/service";
import { galleryService } from "@/api/modules/gallery/service";
import { jobService } from "@/api/modules/jobs/service";
import { mediaService } from "@/api/modules/media/service";
import { menuService } from "@/api/modules/menu/service";
import { reservationService } from "@/api/modules/reservations/service";
import { userService } from "@/api/modules/users/service";
import { type EffectService, effectService } from "./service-adapter";

export class OpeningHoursService extends Context.Service<
  OpeningHoursService,
  EffectService<typeof openingHoursService>
>()("@indian-coffee/OpeningHoursService") {}

export class ContentService extends Context.Service<
  ContentService,
  EffectService<typeof contentService>
>()("@indian-coffee/ContentService") {}

export class MenuService extends Context.Service<
  MenuService,
  EffectService<typeof menuService>
>()("@indian-coffee/MenuService") {}

export class MediaService extends Context.Service<
  MediaService,
  EffectService<typeof mediaService>
>()("@indian-coffee/MediaService") {}

export class GalleryService extends Context.Service<
  GalleryService,
  EffectService<typeof galleryService>
>()("@indian-coffee/GalleryService") {}

export class ReservationService extends Context.Service<
  ReservationService,
  EffectService<typeof reservationService>
>()("@indian-coffee/ReservationService") {}

export class DashboardService extends Context.Service<
  DashboardService,
  EffectService<typeof dashboardService>
>()("@indian-coffee/DashboardService") {}

export class UserService extends Context.Service<
  UserService,
  EffectService<typeof userService>
>()("@indian-coffee/UserService") {}

export class JobService extends Context.Service<
  JobService,
  EffectService<typeof jobService>
>()("@indian-coffee/JobService") {}

export const DomainServicesLive = Layer.mergeAll(
  Layer.succeed(
    OpeningHoursService,
    effectService("OpeningHoursService", openingHoursService)
  ),
  Layer.succeed(
    ContentService,
    effectService("ContentService", contentService)
  ),
  Layer.succeed(MenuService, effectService("MenuService", menuService)),
  Layer.succeed(MediaService, effectService("MediaService", mediaService)),
  Layer.succeed(
    GalleryService,
    effectService("GalleryService", galleryService)
  ),
  Layer.succeed(
    ReservationService,
    effectService("ReservationService", reservationService)
  ),
  Layer.succeed(
    DashboardService,
    effectService("DashboardService", dashboardService)
  ),
  Layer.succeed(UserService, effectService("UserService", userService)),
  Layer.succeed(JobService, effectService("JobService", jobService))
);
