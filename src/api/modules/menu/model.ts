import * as v from "valibot";
import { UuidSchema, VersionSchema } from "../shared";

export const MenuStatusSchema = v.picklist([
  "AVAILABLE",
  "UNAVAILABLE",
  "HIDDEN",
]);

export const MenuQuerySchema = v.object({
  category: v.optional(v.string()),
  search: v.optional(v.string()),
});

export const UpdateMenuStatusSchema = v.object({
  status: MenuStatusSchema,
  version: VersionSchema,
});

export const MenuParamsSchema = v.object({ id: UuidSchema });

export type MenuStatus = v.InferOutput<typeof MenuStatusSchema>;
export type MenuQuery = v.InferOutput<typeof MenuQuerySchema>;
export type UpdateMenuStatus = v.InferOutput<typeof UpdateMenuStatusSchema>;

export type MenuVariantView = {
  id: string;
  label: string | null;
  detail: string | null;
  priceCents: number;
};

export type MenuItemView = {
  id: string;
  name: string;
  description: string;
  status: MenuStatus;
  dietaryFlags: string[];
  spiceLevel: "MILD" | "MEDIUM" | "HOT" | null;
  featured: boolean;
  version: number;
  variants: MenuVariantView[];
};

export type MenuSectionView = {
  id: string;
  name: string;
  description: string;
  items: MenuItemView[];
};

export type MenuCategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sections: MenuSectionView[];
};
