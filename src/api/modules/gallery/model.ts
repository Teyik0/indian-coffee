import * as v from "valibot";

export const GalleryQuerySchema = v.object({
  collection: v.optional(v.string()),
  page: v.optional(v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1)), "1"),
});

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};
