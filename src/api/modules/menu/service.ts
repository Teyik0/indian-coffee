import { and, asc, db, eq, inArray } from "@/api/lib/db";
import {
  menuCategories,
  menuItems,
  menuItemVariants,
  menuSections,
} from "@/db/schema/menu";
import { DomainError } from "../shared";
import type {
  MenuCategoryView,
  MenuItemView,
  MenuQuery,
  UpdateMenuStatus,
} from "./model";

function filterMenu(categories: MenuCategoryView[], query: MenuQuery) {
  const search = query.search?.trim().toLocaleLowerCase("fr-FR");
  return categories
    .filter((category) => !query.category || category.slug === query.category)
    .map((category) => ({
      ...category,
      sections: category.sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            if (item.status === "HIDDEN") return false;
            if (!search) return true;
            return `${item.name} ${item.description}`
              .toLocaleLowerCase("fr-FR")
              .includes(search);
          }),
        }))
        .filter((section) => section.items.length > 0),
    }))
    .filter((category) => category.sections.length > 0);
}

async function readDatabaseMenu() {
  const [categories, sections, items, variants] = await Promise.all([
    db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.isVisible, true))
      .orderBy(asc(menuCategories.sortOrder)),
    db
      .select()
      .from(menuSections)
      .where(eq(menuSections.isVisible, true))
      .orderBy(asc(menuSections.sortOrder)),
    db.select().from(menuItems).orderBy(asc(menuItems.sortOrder)),
    db.select().from(menuItemVariants).orderBy(asc(menuItemVariants.sortOrder)),
  ]);

  const variantsByItem = new Map<string, typeof variants>();
  for (const variant of variants) {
    const current = variantsByItem.get(variant.itemId) ?? [];
    current.push(variant);
    variantsByItem.set(variant.itemId, current);
  }

  const itemsBySection = new Map<string, MenuItemView[]>();
  for (const item of items) {
    const current = itemsBySection.get(item.sectionId) ?? [];
    current.push({
      id: item.id,
      name: item.name,
      description: item.description,
      status: item.status,
      dietaryFlags: item.dietaryFlags,
      spiceLevel: item.spiceLevel,
      featured: item.featured,
      version: item.version,
      variants: (variantsByItem.get(item.id) ?? []).map((variant) => ({
        id: variant.id,
        label: variant.label,
        detail: variant.detail,
        priceCents: variant.priceCents,
      })),
    });
    itemsBySection.set(item.sectionId, current);
  }

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    sections: sections
      .filter((section) => section.categoryId === category.id)
      .map((section) => ({
        id: section.id,
        name: section.name,
        description: section.description,
        items: itemsBySection.get(section.id) ?? [],
      })),
  }));
}

export const menuService = {
  async getPublic(query: MenuQuery = {}) {
    const categories = await readDatabaseMenu();
    return filterMenu(categories, query);
  },

  async getFeatured() {
    const categories = await this.getPublic({});
    return categories
      .flatMap((category) =>
        category.sections.flatMap((section) => section.items),
      )
      .filter((item) => item.featured)
      .slice(0, 3);
  },

  async updateStatus(id: string, input: UpdateMenuStatus) {
    const updated = await db
      .update(menuItems)
      .set({
        status: input.status,
        version: input.version + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(menuItems.id, id), eq(menuItems.version, input.version)))
      .returning();

    const item = updated[0];
    if (!item) {
      throw new DomainError(
        "VERSION_CONFLICT",
        "Ce plat a été modifié dans une autre session. Rechargez les données.",
        409,
      );
    }
    return item;
  },

  async deleteItems(ids: string[]) {
    if (ids.length === 0) return [];
    return db
      .delete(menuItems)
      .where(inArray(menuItems.id, ids))
      .returning({ id: menuItems.id });
  },
};
