import { Elysia } from "elysia";
import { contentRouter } from "./modules/content";
import { galleryRouter } from "./modules/gallery";
import { jobsRouter } from "./modules/jobs";
import { mediaRouter } from "./modules/media";
import { adminMenuRouter, publicMenuRouter } from "./modules/menu";
import { adminReservationRouter, publicReservationRouter } from "./modules/reservations";
import { betterAuthPlugin } from "./plugins/better-auth.plugin";
import { errorPlugin } from "./plugins/error.plugin";

export const apiPlugin = new Elysia({ name: "indian-coffee-api" })
  .use(errorPlugin)
  .use(betterAuthPlugin)
  .use(publicMenuRouter)
  .use(galleryRouter)
  .use(publicReservationRouter)
  .use(adminMenuRouter)
  .use(adminReservationRouter)
  .use(contentRouter)
  .use(mediaRouter)
  .use(jobsRouter)
  .get("/api/health", () => ({ status: "ok", timestamp: new Date().toISOString() }));
