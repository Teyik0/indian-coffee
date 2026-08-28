import { Elysia } from "elysia";
import { GalleryService } from "@/api/effect/domain-services";
import { runApiService } from "@/api/effect/runtime";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import {
  GalleryAdminQuerySchema,
  GalleryCollectionSchema,
  GalleryEntryCreateSchema,
  GalleryEntryUpdateSchema,
  GalleryParamsSchema,
  GalleryQuerySchema,
  GalleryReorderSchema,
} from "./model";

export const galleryRouter = new Elysia({
  name: "gallery",
  prefix: "/api/gallery",
}).get(
  "/",
  ({ query, request }) =>
    runApiService(
      GalleryService,
      (service) => service.getPage(query.page, query.collection),
      request.signal
    ),
  { query: GalleryQuerySchema }
);

const invalidateGallery = { invalidate: { tags: ["gallery"] } } as const;

export const adminGalleryRouter = new Elysia({
  name: "admin-gallery",
  prefix: "/api/admin/gallery",
})
  .use(betterAuthPlugin)
  // Paginé : la route précédente forçait la page 1 et rendait 28 des 40 images
  // inatteignables depuis le back-office.
  .get(
    "/",
    ({ query, request }) =>
      runApiService(
        GalleryService,
        (service) =>
          service.getAdminPage(query.page, query.pageSize, query.collection),
        request.signal
      ),
    { onlyAdmin: true, query: GalleryAdminQuerySchema }
  )
  .get(
    "/media",
    ({ request }) =>
      runApiService(
        GalleryService,
        (service) => service.listAvailableMedia(),
        request.signal
      ),
    { onlyAdmin: true }
  )
  .get(
    "/collections",
    ({ request }) =>
      runApiService(
        GalleryService,
        (service) => service.listCollections(),
        request.signal
      ),
    {
      onlyAdmin: true,
    }
  )
  .post(
    "/collections",
    ({ body, request }) =>
      runApiService(
        GalleryService,
        (service) => service.createCollection(body),
        request.signal
      ),
    {
      body: GalleryCollectionSchema,
      onlyAdmin: true,
      sync: invalidateGallery,
    }
  )
  .post(
    "/",
    ({ body, request }) =>
      runApiService(
        GalleryService,
        (service) => service.createEntry(body),
        request.signal
      ),
    {
      body: GalleryEntryCreateSchema,
      onlyAdmin: true,
      sync: invalidateGallery,
    }
  )
  .patch(
    "/reorder",
    ({ body, request }) =>
      runApiService(
        GalleryService,
        (service) => service.reorder(body.ids),
        request.signal
      ),
    {
      body: GalleryReorderSchema,
      onlyAdmin: true,
      sync: invalidateGallery,
    }
  )
  .patch(
    "/:id",
    ({ params, body, request }) =>
      runApiService(
        GalleryService,
        (service) => service.updateEntry(params.id, body),
        request.signal
      ),
    {
      body: GalleryEntryUpdateSchema,
      onlyAdmin: true,
      params: GalleryParamsSchema,
      sync: invalidateGallery,
    }
  )
  .delete(
    "/:id",
    ({ params, request }) =>
      runApiService(
        GalleryService,
        (service) => service.deleteEntry(params.id),
        request.signal
      ),
    {
      onlyAdmin: true,
      params: GalleryParamsSchema,
      sync: invalidateGallery,
    }
  );
