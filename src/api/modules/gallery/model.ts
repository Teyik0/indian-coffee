import * as v from "valibot";
import { UuidSchema } from "../shared";

/** Tolère chaîne (HTTP) et nombre (appel Eden direct côté serveur). */
const PageSchema = v.optional(
  v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.integer(),
    v.minValue(1)
  ),
  1
);

export const GalleryQuerySchema = v.object({
  collection: v.optional(v.string()),
  page: PageSchema,
});

/** Le back-office pagine et voit aussi les entrées masquées. */
export const GalleryAdminQuerySchema = v.object({
  collection: v.optional(v.string()),
  page: PageSchema,
  pageSize: v.optional(
    v.pipe(
      v.union([v.string(), v.number()]),
      v.transform(Number),
      v.integer(),
      v.minValue(1),
      v.maxValue(96)
    ),
    24
  ),
});

export const GalleryEntryUpdateSchema = v.object({
  alt: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(3, "Décrivez la photo pour les lecteurs d’écran."),
    v.maxLength(200)
  ),
  caption: v.optional(v.pipe(v.string(), v.maxLength(200)), ""),
  collectionId: v.optional(UuidSchema),
  isVisible: v.boolean(),
});

export const GalleryEntryCreateSchema = v.object({
  caption: v.optional(v.pipe(v.string(), v.maxLength(200)), ""),
  collectionSlug: v.optional(v.string(), "restaurant"),
  mediaId: UuidSchema,
});

export const GalleryReorderSchema = v.object({
  ids: v.pipe(v.array(UuidSchema), v.minLength(1), v.maxLength(500)),
});

export const GalleryCollectionSchema = v.object({
  description: v.optional(v.pipe(v.string(), v.maxLength(300)), ""),
  isVisible: v.optional(v.boolean(), true),
  name: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(80)),
  slug: v.pipe(
    v.string(),
    v.trim(),
    v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Minuscules et tirets uniquement.")
  ),
});

export const GalleryParamsSchema = v.object({ id: UuidSchema });

export type GalleryEntryUpdate = v.InferOutput<typeof GalleryEntryUpdateSchema>;
export type GalleryEntryCreate = v.InferOutput<typeof GalleryEntryCreateSchema>;
export type GalleryCollectionInput = v.InferOutput<
  typeof GalleryCollectionSchema
>;

export interface GalleryImage {
  alt: string;
  caption: string;
  height: number;
  id: string;
  /** Data-URI de flou, déjà calculée à l'upload mais jamais servie jusqu'ici. */
  placeholder: string | null;
  src: string;
  srcSet: string;
  width: number;
}

export type GalleryAdminEntry = GalleryImage & {
  mediaId: string;
  collectionId: string;
  collectionSlug: string;
  sortOrder: number;
  isVisible: boolean;
  thumbUrl: string;
  createdAt: Date;
};
