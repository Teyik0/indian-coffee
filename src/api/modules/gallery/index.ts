import { Elysia } from "elysia";
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
import { galleryService } from "./service";

export const galleryRouter = new Elysia({
  name: "gallery",
  prefix: "/api/gallery",
}).get(
  "/",
  ({ query }) => galleryService.getPage(query.page, query.collection),
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
    ({ query }) =>
      galleryService.getAdminPage(query.page, query.pageSize, query.collection),
    { onlyAdmin: true, query: GalleryAdminQuerySchema }
  )
  .get("/media", () => galleryService.listAvailableMedia(), { onlyAdmin: true })
  .get("/collections", () => galleryService.listCollections(), {
    onlyAdmin: true,
  })
  .post("/collections", ({ body }) => galleryService.createCollection(body), {
    body: GalleryCollectionSchema,
    onlyAdmin: true,
    sync: invalidateGallery,
  })
  .post("/", ({ body }) => galleryService.createEntry(body), {
    body: GalleryEntryCreateSchema,
    onlyAdmin: true,
    sync: invalidateGallery,
  })
  .patch("/reorder", ({ body }) => galleryService.reorder(body.ids), {
    body: GalleryReorderSchema,
    onlyAdmin: true,
    sync: invalidateGallery,
  })
  .patch(
    "/:id",
    ({ params, body }) => galleryService.updateEntry(params.id, body),
    {
      body: GalleryEntryUpdateSchema,
      onlyAdmin: true,
      params: GalleryParamsSchema,
      sync: invalidateGallery,
    }
  )
  .delete("/:id", ({ params }) => galleryService.deleteEntry(params.id), {
    onlyAdmin: true,
    params: GalleryParamsSchema,
    sync: invalidateGallery,
  });
