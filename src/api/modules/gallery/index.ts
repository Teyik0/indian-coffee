import { Elysia } from "elysia";
import { GalleryQuerySchema } from "./model";
import { galleryService } from "./service";

export const galleryRouter = new Elysia({
  name: "gallery",
  prefix: "/api/gallery",
}).get(
  "/",
  ({ query }) => galleryService.getPage(query.page, query.collection),
  { query: GalleryQuerySchema },
);
