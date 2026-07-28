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
    // La promesse était passée telle quelle à `status()` : le client recevait
    // une enveloppe non résolue et ne pouvait pas lire l'identifiant du média.
    async ({ body, status }) =>
      status(201, await mediaService.upload(body.file, body.alt)),
    {
      body: MediaUploadSchema,
      onlyAdmin: true,
      parse: "formdata",
      sync: false,
    }
  );
