import "@teyik0/furin/server-only";
import { furinSync } from "@teyik0/furin";
import { Elysia } from "elysia";
import { sync } from "@/sync";
import { contentRouter } from "./modules/content";
import { contentService } from "./modules/content/service";
import { dashboardService } from "./modules/dashboard/service";
import { adminGalleryRouter, galleryRouter } from "./modules/gallery";
import { jobsRouter } from "./modules/jobs";
import { mediaRouter } from "./modules/media";
import { adminMenuRouter, publicMenuRouter } from "./modules/menu";
import {
  adminReservationRouter,
  publicReservationRouter,
} from "./modules/reservations";
import { seoRouter } from "./modules/seo";
import { adminUsersRouter } from "./modules/users";
import { betterAuthPlugin } from "./plugins/better-auth.plugin";
import { errorPlugin } from "./plugins/error.plugin";

export const apiPlugin = new Elysia({ name: "indian-coffee-api" })
  .use(errorPlugin)
  .use(betterAuthPlugin)
  .use(furinSync(sync))
  .get("/api/content", () => contentService.get())
  .get(
    "/api/admin/session",
    ({ user }) => ({
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
      },
    }),
    { onlyAdmin: true }
  )
  // Agrégats calculés en base : la version précédente chargeait la carte
  // entière et toutes les réservations pour en déduire quatre compteurs.
  .get("/api/admin/dashboard", () => dashboardService.get(), {
    onlyAdmin: true,
  })
  .get(
    "/api/admin/dashboard/unavailable",
    () => dashboardService.getUnavailableItems(),
    { onlyAdmin: true }
  )
  .use(publicMenuRouter)
  .use(galleryRouter)
  .use(publicReservationRouter)
  .use(seoRouter)
  .use(adminMenuRouter)
  .use(adminGalleryRouter)
  .use(adminReservationRouter)
  .use(adminUsersRouter)
  .use(contentRouter)
  .use(mediaRouter)
  .use(jobsRouter)
  .get("/api/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

export type Api = typeof apiPlugin;
