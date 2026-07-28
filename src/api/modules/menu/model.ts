import * as v from "valibot";
import { UuidSchema, VersionSchema } from "../shared";

export const MenuStatusSchema = v.picklist([
  "AVAILABLE",
  "UNAVAILABLE",
  "HIDDEN",
]);

export const SpiceLevelSchema = v.picklist(["MILD", "MEDIUM", "HOT"]);

/** Régimes proposés au back-office, repris dans la légende publique. */
export const DIETARY_FLAGS = [
  "Végétarien",
  "Végétalien",
  "Sans gluten",
  "Sans lactose",
  "Halal",
  "Contient des fruits à coque",
] as const;

export const MenuQuerySchema = v.object({
  category: v.optional(v.string()),
  search: v.optional(v.string()),
});

export const UpdateMenuStatusSchema = v.object({
  status: MenuStatusSchema,
  version: VersionSchema,
});

export const MenuParamsSchema = v.object({ id: UuidSchema });

const SlugSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(2),
  v.maxLength(80),
  v.regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Utilisez des minuscules et des tirets."
  )
);

const OptionalMediaSchema = v.optional(v.union([UuidSchema, v.literal("")]));

export const MenuCategoryCreateSchema = v.object({
  description: v.optional(v.pipe(v.string(), v.maxLength(400)), ""),
  isVisible: v.optional(v.boolean(), true),
  mediaId: OptionalMediaSchema,
  name: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(80)),
  slug: SlugSchema,
});

export const MenuCategoryUpdateSchema = v.object({
  ...MenuCategoryCreateSchema.entries,
  version: VersionSchema,
});

export const MenuSectionCreateSchema = v.object({
  categoryId: UuidSchema,
  description: v.optional(v.pipe(v.string(), v.maxLength(400)), ""),
  isVisible: v.optional(v.boolean(), true),
  name: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(80)),
});

export const MenuSectionUpdateSchema = v.object({
  description: v.optional(v.pipe(v.string(), v.maxLength(400)), ""),
  isVisible: v.optional(v.boolean(), true),
  name: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(80)),
  version: VersionSchema,
});

const VariantSchema = v.object({
  detail: v.optional(v.union([v.pipe(v.string(), v.maxLength(160)), v.null()])),
  id: v.optional(UuidSchema),
  label: v.optional(v.union([v.pipe(v.string(), v.maxLength(60)), v.null()])),
  priceCents: v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.integer("Le prix doit être un nombre entier de centimes."),
    v.minValue(0, "Le prix ne peut pas être négatif."),
    v.maxValue(100_000, "Vérifiez ce prix.")
  ),
});

export const MenuItemCreateSchema = v.object({
  description: v.optional(v.pipe(v.string(), v.maxLength(600)), ""),
  dietaryFlags: v.optional(v.array(v.pipe(v.string(), v.maxLength(60))), []),
  featured: v.optional(v.boolean(), false),
  mediaId: OptionalMediaSchema,
  name: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(120)),
  sectionId: UuidSchema,
  spiceLevel: v.optional(v.union([SpiceLevelSchema, v.null()])),
  status: v.optional(MenuStatusSchema, "AVAILABLE"),
  variants: v.pipe(
    v.array(VariantSchema),
    v.minLength(1, "Renseignez au moins un prix."),
    v.maxLength(12)
  ),
});

export const MenuItemUpdateSchema = v.object({
  description: v.optional(v.pipe(v.string(), v.maxLength(600)), ""),
  dietaryFlags: v.optional(v.array(v.pipe(v.string(), v.maxLength(60))), []),
  featured: v.optional(v.boolean(), false),
  mediaId: OptionalMediaSchema,
  name: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(120)),
  spiceLevel: v.optional(v.union([SpiceLevelSchema, v.null()])),
  status: MenuStatusSchema,
  /** Jeu complet de variantes : il remplace l'existant en une transaction. */
  variants: v.pipe(
    v.array(VariantSchema),
    v.minLength(1, "Renseignez au moins un prix."),
    v.maxLength(12)
  ),
  version: VersionSchema,
});

export const MenuReorderSchema = v.object({
  ids: v.pipe(v.array(UuidSchema), v.minLength(1), v.maxLength(500)),
  scope: v.picklist(["categories", "sections", "items"]),
});

export type MenuStatus = v.InferOutput<typeof MenuStatusSchema>;
export type SpiceLevel = v.InferOutput<typeof SpiceLevelSchema>;
export type MenuQuery = v.InferOutput<typeof MenuQuerySchema>;
export type UpdateMenuStatus = v.InferOutput<typeof UpdateMenuStatusSchema>;
export type MenuCategoryCreate = v.InferOutput<typeof MenuCategoryCreateSchema>;
export type MenuCategoryUpdate = v.InferOutput<typeof MenuCategoryUpdateSchema>;
export type MenuSectionCreate = v.InferOutput<typeof MenuSectionCreateSchema>;
export type MenuSectionUpdate = v.InferOutput<typeof MenuSectionUpdateSchema>;
export type MenuItemCreate = v.InferOutput<typeof MenuItemCreateSchema>;
export type MenuItemUpdate = v.InferOutput<typeof MenuItemUpdateSchema>;
export type MenuReorder = v.InferOutput<typeof MenuReorderSchema>;

export interface MenuVariantView {
  detail: string | null;
  id: string;
  label: string | null;
  priceCents: number;
}

/** Visuel décliné, pour `srcSet` et le flou de chargement. */
export interface MenuMediaView {
  alt: string;
  id: string;
  largeUrl: string;
  largeWidth: number;
  mediumHeight: number;
  mediumUrl: string;
  mediumWidth: number;
  placeholder: string | null;
  thumbUrl: string;
  thumbWidth: number;
}

export interface MenuItemView {
  description: string;
  dietaryFlags: string[];
  featured: boolean;
  id: string;
  media: MenuMediaView | null;
  name: string;
  sortOrder: number;
  spiceLevel: SpiceLevel | null;
  status: MenuStatus;
  variants: MenuVariantView[];
  version: number;
}

export interface MenuSectionView {
  description: string;
  id: string;
  isVisible: boolean;
  items: MenuItemView[];
  name: string;
  sortOrder: number;
  version: number;
}

export interface MenuCategoryView {
  description: string;
  id: string;
  isVisible: boolean;
  name: string;
  sections: MenuSectionView[];
  slug: string;
  sortOrder: number;
  version: number;
}
