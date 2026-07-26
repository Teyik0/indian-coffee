import "@teyik0/furin/server-only";
import { furinSync } from "@teyik0/furin";
import { Elysia } from "elysia";
import { sync } from "@/sync";
import { contentRouter } from "./modules/content";
import { contentService } from "./modules/content/service";
import { galleryRouter } from "./modules/gallery";
import { galleryService } from "./modules/gallery/service";
import { jobsRouter } from "./modules/jobs";
import { mediaRouter } from "./modules/media";
import { adminMenuRouter, publicMenuRouter } from "./modules/menu";
import { menuService } from "./modules/menu/service";
import {
  adminReservationRouter,
  publicReservationRouter,
} from "./modules/reservations";
import { reservationService } from "./modules/reservations/service";
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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }),
    { onlyAdmin: true },
  )
  .get(
    "/api/admin/dashboard",
    async () => {
      const [menu, reservations] = await Promise.all([
        menuService.getPublic({}),
        reservationService.list(),
      ]);
      const items = menu.flatMap((category) =>
        category.sections.flatMap((section) => section.items),
      );
      return {
        stats: {
          dishes: items.length,
          unavailable: items.filter((item) => item.status === "UNAVAILABLE")
            .length,
          pending: reservations.filter(
            (reservation) => reservation.status === "PENDING",
          ).length,
          reservations: reservations.length,
        },
      };
    },
    { onlyAdmin: true },
  )
  .get("/api/admin/gallery", () => galleryService.getPage(1), {
    onlyAdmin: true,
  })
  .use(publicMenuRouter)
  .use(galleryRouter)
  .use(publicReservationRouter)
  .use(adminMenuRouter)
  .use(adminReservationRouter)
  .use(contentRouter)
  .use(mediaRouter)
  .use(jobsRouter)
  .get("/api/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

export type Api = typeof apiPlugin;
