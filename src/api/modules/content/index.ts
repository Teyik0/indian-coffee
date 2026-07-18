import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import { SiteSettingsSchema } from "./model";
import { contentService } from "./service";

export const contentRouter = new Elysia({ name: "content", prefix: "/api/admin/content" })
  .use(betterAuthPlugin)
  .get("/", () => contentService.get(), { backOffice: true })
  .patch("/settings", ({ body }) => contentService.updateSettings(body), {
    backOffice: true,
    body: SiteSettingsSchema,
  });
