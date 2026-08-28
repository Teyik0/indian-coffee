import { Elysia } from "elysia";
import { MediaService } from "@/api/effect/domain-services";
import { runApiService } from "@/api/effect/runtime";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import { MediaUploadSchema } from "./model";

export const mediaRouter = new Elysia({
  name: "admin-media",
  prefix: "/api/admin/media",
})
  .use(betterAuthPlugin)
  .post(
    "/",
    // La promesse était passée telle quelle à `status()` : le client recevait
    // une enveloppe non résolue et ne pouvait pas lire l'identifiant du média.
    async ({ body, request, status }) =>
      status(
        201,
        await runApiService(
          MediaService,
          (service) => service.upload(body.file, body.alt),
          request.signal
        )
      ),
    {
      body: MediaUploadSchema,
      onlyAdmin: true,
      parse: "formdata",
      sync: false,
    }
  );
