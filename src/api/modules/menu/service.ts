import { and, asc, db, eq, inArray, sql } from "@/api/lib/db";
import { mediaAssets } from "@/db/schema/media";
import {
  menuCategories,
  menuItems,
  menuItemVariants,
  menuSections,
} from "@/db/schema/menu";
import { DomainError } from "../shared";
import type {
  MenuCategoryCreate,
  MenuCategoryUpdate,
  MenuCategoryView,
  MenuItemCreate,
  MenuItemUpdate,
  MenuItemView,
  MenuMediaView,
  MenuQuery,
  MenuReorder,
  MenuSectionCreate,
  MenuSectionUpdate,
  UpdateMenuStatus,
} from "./model";

type Scope = "public" | "admin";

function filterMenu(categories: MenuCategoryView[], query: MenuQuery) {
  const search = query.search?.trim().toLocaleLowerCase("fr-FR");
  return categories.flatMap((category) => {
    if (query.category && category.slug !== query.category) {
      return [];
    }
    const sections = category.sections.flatMap((section) => {
      const items = section.items.filter((item) => {
        if (item.status === "HIDDEN") {
          return false;
        }
        if (!search) {
          return true;
        }
        return `${item.name} ${item.description}`
          .toLocaleLowerCase("fr-FR")
          .includes(search);
      });
      return items.length > 0 ? [{ ...section, items }] : [];
    });
    return sections.length > 0 ? [{ ...category, sections }] : [];
  });
}

function toMediaView(row: {
  mediaId: string | null;
  mediaAlt: string | null;
  mediaPlaceholder: string | null;
  thumbUrl: string | null;
  thumbWidth: number | null;
  mediumUrl: string | null;
  mediumWidth: number | null;
  mediumHeight: number | null;
  largeUrl: string | null;
  largeWidth: number | null;
}): MenuMediaView | null {
  if (!(row.mediaId && row.mediumUrl)) {
    return null;
  }
  return {
    alt: row.mediaAlt ?? "",
    id: row.mediaId,
    largeUrl: row.largeUrl ?? row.mediumUrl,
    largeWidth: row.largeWidth ?? 1440,
    mediumHeight: row.mediumHeight ?? 512,
    mediumUrl: row.mediumUrl,
    mediumWidth: row.mediumWidth ?? 768,
    placeholder: row.mediaPlaceholder,
    thumbUrl: row.thumbUrl ?? row.mediumUrl,
    thumbWidth: row.thumbWidth ?? 320,
  };
}

/**
 * Lecture de l'arbre complet. En portée `admin`, ni les entités masquées ni les
 * plats `HIDDEN` ne sont filtrés : sans cela le back-office ne pouvait pas voir
 * un plat masqué, donc jamais le réafficher.
 */
async function readMenu(scope: Scope): Promise<MenuCategoryView[]> {
  const [categories, sections, items, variants] = await Promise.all([
    scope === "admin"
      ? db
          .select()
          .from(menuCategories)
          .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.name))
      : db
          .select()
          .from(menuCategories)
          .where(eq(menuCategories.isVisible, true))
          .orderBy(asc(menuCategories.sortOrder)),
    scope === "admin"
      ? db.select().from(menuSections).orderBy(asc(menuSections.sortOrder))
      : db
          .select()
          .from(menuSections)
          .where(eq(menuSections.isVisible, true))
          .orderBy(asc(menuSections.sortOrder)),
    db
      .select({
        description: menuItems.description,
        dietaryFlags: menuItems.dietaryFlags,
        featured: menuItems.featured,
        id: menuItems.id,
        largeUrl: mediaAssets.largeUrl,
        largeWidth: mediaAssets.largeWidth,
        mediaAlt: mediaAssets.alt,
        mediaId: mediaAssets.id,
        mediaPlaceholder: mediaAssets.placeholder,
        mediumHeight: mediaAssets.mediumHeight,
        mediumUrl: mediaAssets.mediumUrl,
        mediumWidth: mediaAssets.mediumWidth,
        name: menuItems.name,
        sectionId: menuItems.sectionId,
        sortOrder: menuItems.sortOrder,
        spiceLevel: menuItems.spiceLevel,
        status: menuItems.status,
        thumbUrl: mediaAssets.thumbUrl,
        thumbWidth: mediaAssets.thumbWidth,
        version: menuItems.version,
      })
      .from(menuItems)
      .leftJoin(mediaAssets, eq(menuItems.mediaId, mediaAssets.id))
      .orderBy(asc(menuItems.sortOrder), asc(menuItems.name)),
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
      description: item.description,
      dietaryFlags: item.dietaryFlags,
      featured: item.featured,
      id: item.id,
      media: toMediaView(item),
      name: item.name,
      sortOrder: item.sortOrder,
      spiceLevel: item.spiceLevel,
      status: item.status,
      variants: (variantsByItem.get(item.id) ?? []).map((variant) => ({
        detail: variant.detail,
        id: variant.id,
        label: variant.label,
        priceCents: variant.priceCents,
      })),
      version: item.version,
    });
    itemsBySection.set(item.sectionId, current);
  }

  return categories.map((category) => ({
    description: category.description,
    id: category.id,
    isVisible: category.isVisible,
    name: category.name,
    sections: sections.flatMap((section) =>
      section.categoryId === category.id
        ? [
            {
              description: section.description,
              id: section.id,
              isVisible: section.isVisible,
              items: itemsBySection.get(section.id) ?? [],
              name: section.name,
              sortOrder: section.sortOrder,
              version: section.version,
            },
          ]
        : []
    ),
    slug: category.slug,
    sortOrder: category.sortOrder,
    version: category.version,
  }));
}

/** Prochain `sortOrder`, pour placer les créations en fin de liste. */
async function nextCategoryOrder() {
  const [row] = await db
    .select({
      next: sql<number>`coalesce(max(${menuCategories.sortOrder}), -1) + 1`,
    })
    .from(menuCategories);
  return Number(row?.next ?? 0);
}

async function nextSectionOrder(categoryId: string) {
  const [row] = await db
    .select({
      next: sql<number>`coalesce(max(${menuSections.sortOrder}), -1) + 1`,
    })
    .from(menuSections)
    .where(eq(menuSections.categoryId, categoryId));
  return Number(row?.next ?? 0);
}

async function nextItemOrder(sectionId: string) {
  const [row] = await db
    .select({
      next: sql<number>`coalesce(max(${menuItems.sortOrder}), -1) + 1`,
    })
    .from(menuItems)
    .where(eq(menuItems.sectionId, sectionId));
  return Number(row?.next ?? 0);
}

function conflict(entity: string): never {
  throw new DomainError(
    "VERSION_CONFLICT",
    `${entity} a été modifié dans une autre session. Rechargez les données.`,
    409
  );
}

export const menuService = {
  // ---------------------------------------------------------------- Catégories

  async createCategory(input: MenuCategoryCreate) {
    const sortOrder = await nextCategoryOrder();
    try {
      const [row] = await db
        .insert(menuCategories)
        .values({
          description: input.description ?? "",
          isVisible: input.isVisible ?? true,
          mediaId: input.mediaId || null,
          name: input.name,
          slug: input.slug,
          sortOrder,
        })
        .returning();
      return row;
    } catch (error) {
      if (String(error).includes("menu_categories_slug")) {
        // biome-ignore lint/style/useErrorCause: DomainError reçoit la cause dans son cinquième argument.
        throw new DomainError(
          "SLUG_TAKEN",
          "Cette adresse de catégorie est déjà utilisée.",
          409,
          { slug: ["Adresse déjà prise."] },
          { cause: error }
        );
      }
      throw error;
    }
  },

  // --------------------------------------------------------------------- Plats

  async createItem(input: MenuItemCreate) {
    const sortOrder = await nextItemOrder(input.sectionId);
    return db.transaction(async (tx) => {
      const [item] = await tx
        .insert(menuItems)
        .values({
          description: input.description ?? "",
          dietaryFlags: input.dietaryFlags ?? [],
          featured: input.featured ?? false,
          mediaId: input.mediaId || null,
          name: input.name,
          sectionId: input.sectionId,
          sortOrder,
          spiceLevel: input.spiceLevel ?? null,
          status: input.status ?? "AVAILABLE",
        })
        .returning();
      if (!item) {
        throw new DomainError(
          "ITEM_NOT_CREATED",
          "Le plat n’a pas pu être créé."
        );
      }
      await tx.insert(menuItemVariants).values(
        input.variants.map((variant, index) => ({
          detail: variant.detail ?? null,
          itemId: item.id,
          label: variant.label ?? null,
          priceCents: variant.priceCents,
          sortOrder: index,
        }))
      );
      return item;
    });
  },

  // ------------------------------------------------------------------ Sections

  async createSection(input: MenuSectionCreate) {
    const sortOrder = await nextSectionOrder(input.categoryId);
    const [row] = await db
      .insert(menuSections)
      .values({
        categoryId: input.categoryId,
        description: input.description ?? "",
        isVisible: input.isVisible ?? true,
        name: input.name,
        sortOrder,
      })
      .returning();
    return row;
  },

  async deleteCategory(id: string) {
    const [row] = await db
      .delete(menuCategories)
      .where(eq(menuCategories.id, id))
      .returning({ id: menuCategories.id });
    if (!row) {
      throw new DomainError(
        "CATEGORY_NOT_FOUND",
        "Cette catégorie n’existe plus.",
        404
      );
    }
    return row;
  },

  deleteItems(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }
    return db
      .delete(menuItems)
      .where(inArray(menuItems.id, ids))
      .returning({ id: menuItems.id });
  },

  async deleteSection(id: string) {
    const [row] = await db
      .delete(menuSections)
      .where(eq(menuSections.id, id))
      .returning({ id: menuSections.id });
    if (!row) {
      throw new DomainError(
        "SECTION_NOT_FOUND",
        "Cette section n’existe plus.",
        404
      );
    }
    return row;
  },

  /** Arbre complet, plats masqués inclus. */
  getAdmin() {
    return readMenu("admin");
  },

  async getFeatured(limit = 3) {
    const categories = await readMenu("public");
    return categories
      .flatMap((category) =>
        category.sections.flatMap((section) =>
          section.items.filter(
            (item) => item.featured && item.status === "AVAILABLE"
          )
        )
      )
      .slice(0, limit);
  },
  async getPublic(query: MenuQuery = {}) {
    return filterMenu(await readMenu("public"), query);
  },

  /** Applique l'ordre transmis : l'index du tableau devient le `sortOrder`. */
  async reorder(input: MenuReorder) {
    const tables = {
      categories: menuCategories,
      items: menuItems,
      sections: menuSections,
    } as const;
    const table = tables[input.scope];
    await db.transaction(async (tx) => {
      await Promise.all(
        input.ids.map((id, index) =>
          tx.update(table).set({ sortOrder: index }).where(eq(table.id, id))
        )
      );
    });
    return { reordered: input.ids.length };
  },

  async updateCategory(id: string, input: MenuCategoryUpdate) {
    const rows = await db
      .update(menuCategories)
      .set({
        description: input.description ?? "",
        isVisible: input.isVisible ?? true,
        mediaId: input.mediaId || null,
        name: input.name,
        slug: input.slug,
        updatedAt: new Date(),
        version: input.version + 1,
      })
      .where(
        and(
          eq(menuCategories.id, id),
          eq(menuCategories.version, input.version)
        )
      )
      .returning();
    return rows[0] ?? conflict("Cette catégorie");
  },

  /**
   * Met à jour un plat et remplace l'intégralité de ses variantes dans la même
   * transaction : c'est ce qui rend l'édition des prix possible.
   */
  updateItem(id: string, input: MenuItemUpdate) {
    return db.transaction(async (tx) => {
      const rows = await tx
        .update(menuItems)
        .set({
          description: input.description ?? "",
          dietaryFlags: input.dietaryFlags ?? [],
          featured: input.featured ?? false,
          mediaId: input.mediaId || null,
          name: input.name,
          spiceLevel: input.spiceLevel ?? null,
          status: input.status,
          updatedAt: new Date(),
          version: input.version + 1,
        })
        .where(and(eq(menuItems.id, id), eq(menuItems.version, input.version)))
        .returning();
      const [item] = rows;
      if (!item) {
        conflict("Ce plat");
      }

      await tx.delete(menuItemVariants).where(eq(menuItemVariants.itemId, id));
      await tx.insert(menuItemVariants).values(
        input.variants.map((variant, index) => ({
          detail: variant.detail ?? null,
          itemId: id,
          label: variant.label ?? null,
          priceCents: variant.priceCents,
          sortOrder: index,
        }))
      );
      return item;
    });
  },

  async updateSection(id: string, input: MenuSectionUpdate) {
    const rows = await db
      .update(menuSections)
      .set({
        description: input.description ?? "",
        isVisible: input.isVisible ?? true,
        name: input.name,
        version: input.version + 1,
      })
      .where(
        and(eq(menuSections.id, id), eq(menuSections.version, input.version))
      )
      .returning();
    return rows[0] ?? conflict("Cette section");
  },

  async updateStatus(id: string, input: UpdateMenuStatus) {
    const updated = await db
      .update(menuItems)
      .set({
        status: input.status,
        updatedAt: new Date(),
        version: input.version + 1,
      })
      .where(and(eq(menuItems.id, id), eq(menuItems.version, input.version)))
      .returning();
    return updated[0] ?? conflict("Ce plat");
  },
};
