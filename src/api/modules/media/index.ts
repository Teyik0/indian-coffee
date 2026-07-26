import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import { MediaUploadSchema } from "./model";
import { mediaService } from "./service";

export const mediaRouter = new Elysia({
  name: "admin-media",
  prefix: "/api/admin/media",
})
  .use(betterAuthPlugin)
  .post(
    "/",
    ({ body, status }) => status(201, mediaService.upload(body.file, body.alt)),
    {
      onlyAdmin: true,
      parse: "formdata",
      body: MediaUploadSchema,
      sync: false,
    },
  );
