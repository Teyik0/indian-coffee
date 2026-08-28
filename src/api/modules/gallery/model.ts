import * as Schema from "effect4/Schema";
import {
  boundedNumberInput,
  boundedString,
  defaulted,
  mutableArray,
  standard,
} from "@/api/effect/schema";
import { UuidSchema } from "../shared";

/** Tolère chaîne (HTTP) et nombre (appel Eden direct côté serveur). */
const PageSchema = defaulted(boundedNumberInput(1, Number.MAX_SAFE_INTEGER), 1);

export const GalleryQueryEffectSchema = Schema.Struct({
  collection: Schema.optional(Schema.String),
  page: PageSchema,
});
export const GalleryQuerySchema = standard(GalleryQueryEffectSchema);

/** Le back-office pagine et voit aussi les entrées masquées. */
export const GalleryAdminQueryEffectSchema = Schema.Struct({
  collection: Schema.optional(Schema.String),
  page: PageSchema,
  pageSize: defaulted(boundedNumberInput(1, 96), 24),
});
export const GalleryAdminQuerySchema = standard(GalleryAdminQueryEffectSchema);

export const GalleryEntryUpdateEffectSchema = Schema.Struct({
  alt: boundedString(3, 200, {
    minimumMessage: "Décrivez la photo pour les lecteurs d’écran.",
    trim: true,
  }),
  caption: defaulted(boundedString(0, 200), ""),
  collectionId: Schema.optional(UuidSchema),
  isVisible: Schema.Boolean,
});
export const GalleryEntryUpdateSchema = standard(
  GalleryEntryUpdateEffectSchema
);

export const GalleryEntryCreateEffectSchema = Schema.Struct({
  caption: defaulted(boundedString(0, 200), ""),
  collectionSlug: defaulted(Schema.String, "restaurant"),
  mediaId: UuidSchema,
});
export const GalleryEntryCreateSchema = standard(
  GalleryEntryCreateEffectSchema
);

export const GalleryReorderEffectSchema = Schema.Struct({
  ids: mutableArray(UuidSchema).check(
    Schema.isMinLength(1),
    Schema.isMaxLength(500)
  ),
});
export const GalleryReorderSchema = standard(GalleryReorderEffectSchema);

export const GalleryCollectionEffectSchema = Schema.Struct({
  description: defaulted(boundedString(0, 300), ""),
  isVisible: defaulted(Schema.Boolean, true),
  name: boundedString(2, 80, { trim: true }),
  slug: Schema.Trim.check(
    Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Minuscules et tirets uniquement.",
    })
  ),
});
export const GalleryCollectionSchema = standard(GalleryCollectionEffectSchema);

export const GalleryParamsEffectSchema = Schema.Struct({ id: UuidSchema });
export const GalleryParamsSchema = standard(GalleryParamsEffectSchema);

export type GalleryEntryUpdate = typeof GalleryEntryUpdateEffectSchema.Type;
export type GalleryEntryCreate = typeof GalleryEntryCreateEffectSchema.Type;
export type GalleryCollectionInput = typeof GalleryCollectionEffectSchema.Type;

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
