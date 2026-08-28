import * as Schema from "effect4/Schema";
import {
  boundedNumberInput,
  boundedString,
  defaulted,
  mutableArray,
  standard,
} from "@/api/effect/schema";
import { UuidSchema, VersionSchema } from "../shared";

export const MenuStatusEffectSchema = Schema.Literals([
  "AVAILABLE",
  "UNAVAILABLE",
  "HIDDEN",
]);
export const MenuStatusSchema = standard(MenuStatusEffectSchema);

export const SpiceLevelEffectSchema = Schema.Literals([
  "MILD",
  "MEDIUM",
  "HOT",
]);
export const SpiceLevelSchema = standard(SpiceLevelEffectSchema);

/** Régimes proposés au back-office, repris dans la légende publique. */
export const DIETARY_FLAGS = [
  "Végétarien",
  "Végétalien",
  "Sans gluten",
  "Sans lactose",
  "Halal",
  "Contient des fruits à coque",
] as const;

export const MenuQueryEffectSchema = Schema.Struct({
  category: Schema.optional(Schema.String),
  search: Schema.optional(Schema.String),
});
export const MenuQuerySchema = standard(MenuQueryEffectSchema);

export const UpdateMenuStatusEffectSchema = Schema.Struct({
  status: MenuStatusEffectSchema,
  version: VersionSchema,
});
export const UpdateMenuStatusSchema = standard(UpdateMenuStatusEffectSchema);

export const MenuParamsEffectSchema = Schema.Struct({ id: UuidSchema });
export const MenuParamsSchema = standard(MenuParamsEffectSchema);

const SlugSchema = Schema.Trim.check(
  Schema.isMinLength(2),
  Schema.isMaxLength(80),
  Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Utilisez des minuscules et des tirets.",
  })
);

const OptionalMediaSchema = Schema.optional(
  Schema.Union([UuidSchema, Schema.Literal("")])
);

export const MenuCategoryCreateEffectSchema = Schema.Struct({
  description: defaulted(boundedString(0, 400), ""),
  isVisible: defaulted(Schema.Boolean, true),
  mediaId: OptionalMediaSchema,
  name: boundedString(2, 80, { trim: true }),
  slug: SlugSchema,
});
export const MenuCategoryCreateSchema = standard(
  MenuCategoryCreateEffectSchema
);

export const MenuCategoryUpdateEffectSchema = Schema.Struct({
  ...MenuCategoryCreateEffectSchema.fields,
  version: VersionSchema,
});
export const MenuCategoryUpdateSchema = standard(
  MenuCategoryUpdateEffectSchema
);

export const MenuSectionCreateEffectSchema = Schema.Struct({
  categoryId: UuidSchema,
  description: defaulted(boundedString(0, 400), ""),
  isVisible: defaulted(Schema.Boolean, true),
  name: boundedString(2, 80, { trim: true }),
});
export const MenuSectionCreateSchema = standard(MenuSectionCreateEffectSchema);

export const MenuSectionUpdateEffectSchema = Schema.Struct({
  description: defaulted(boundedString(0, 400), ""),
  isVisible: defaulted(Schema.Boolean, true),
  name: boundedString(2, 80, { trim: true }),
  version: VersionSchema,
});
export const MenuSectionUpdateSchema = standard(MenuSectionUpdateEffectSchema);

const VariantSchema = Schema.Struct({
  detail: Schema.optional(Schema.NullOr(boundedString(0, 160))),
  id: Schema.optional(UuidSchema),
  label: Schema.optional(Schema.NullOr(boundedString(0, 60))),
  priceCents: boundedNumberInput(0, 100_000, {
    maximum: "Vérifiez ce prix.",
    minimum: "Le prix ne peut pas être négatif.",
  }),
});

const VariantsSchema = mutableArray(VariantSchema).check(
  Schema.isMinLength(1, { message: "Renseignez au moins un prix." }),
  Schema.isMaxLength(12)
);

const DietaryFlagsSchema = defaulted(
  mutableArray(boundedString(0, 60)),
  [] as string[]
);

export const MenuItemCreateEffectSchema = Schema.Struct({
  description: defaulted(boundedString(0, 600), ""),
  dietaryFlags: DietaryFlagsSchema,
  featured: defaulted(Schema.Boolean, false),
  mediaId: OptionalMediaSchema,
  name: boundedString(2, 120, { trim: true }),
  sectionId: UuidSchema,
  spiceLevel: Schema.optional(Schema.NullOr(SpiceLevelEffectSchema)),
  status: defaulted(MenuStatusEffectSchema, "AVAILABLE"),
  variants: VariantsSchema,
});
export const MenuItemCreateSchema = standard(MenuItemCreateEffectSchema);

export const MenuItemUpdateEffectSchema = Schema.Struct({
  description: defaulted(boundedString(0, 600), ""),
  dietaryFlags: DietaryFlagsSchema,
  featured: defaulted(Schema.Boolean, false),
  mediaId: OptionalMediaSchema,
  name: boundedString(2, 120, { trim: true }),
  spiceLevel: Schema.optional(Schema.NullOr(SpiceLevelEffectSchema)),
  status: MenuStatusEffectSchema,
  /** Jeu complet de variantes : il remplace l'existant en une transaction. */
  variants: VariantsSchema,
  version: VersionSchema,
});
export const MenuItemUpdateSchema = standard(MenuItemUpdateEffectSchema);

export const MenuReorderEffectSchema = Schema.Struct({
  ids: mutableArray(UuidSchema).check(
    Schema.isMinLength(1),
    Schema.isMaxLength(500)
  ),
  scope: Schema.Literals(["categories", "sections", "items"]),
});
export const MenuReorderSchema = standard(MenuReorderEffectSchema);

export type MenuStatus = typeof MenuStatusEffectSchema.Type;
export type SpiceLevel = typeof SpiceLevelEffectSchema.Type;
export type MenuQuery = typeof MenuQueryEffectSchema.Type;
export type UpdateMenuStatus = typeof UpdateMenuStatusEffectSchema.Type;
export type MenuCategoryCreate = typeof MenuCategoryCreateEffectSchema.Type;
export type MenuCategoryUpdate = typeof MenuCategoryUpdateEffectSchema.Type;
export type MenuSectionCreate = typeof MenuSectionCreateEffectSchema.Type;
export type MenuSectionUpdate = typeof MenuSectionUpdateEffectSchema.Type;
export type MenuItemCreate = typeof MenuItemCreateEffectSchema.Type;
export type MenuItemUpdate = typeof MenuItemUpdateEffectSchema.Type;
export type MenuReorder = typeof MenuReorderEffectSchema.Type;

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
