import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { mediaAssets } from "./media";

export const menuItemStatus = pgEnum("menu_item_status", [
  "AVAILABLE",
  "UNAVAILABLE",
  "HIDDEN",
]);
export const spiceLevel = pgEnum("spice_level", ["MILD", "MEDIUM", "HOT"]);

export const menuCategories = pgTable("menu_categories", {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  description: text("description").default("").notNull(),
  id: uuid("id").defaultRandom().primaryKey(),
  isVisible: boolean("is_visible").default(true).notNull(),
  mediaId: uuid("media_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  version: integer("version").default(1).notNull(),
});

export const menuSections = pgTable(
  "menu_sections",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "cascade" }),
    description: text("description").default("").notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    isVisible: boolean("is_visible").default(true).notNull(),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    version: integer("version").default(1).notNull(),
  },
  (table) => [
    index("menu_sections_category_idx").on(table.categoryId, table.sortOrder),
  ]
);

export const menuItems = pgTable(
  "menu_items",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    description: text("description").default("").notNull(),
    dietaryFlags: text("dietary_flags").array().default([]).notNull(),
    featured: boolean("featured").default(false).notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    mediaId: uuid("media_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => menuSections.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    spiceLevel: spiceLevel("spice_level"),
    status: menuItemStatus("status").default("AVAILABLE").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    version: integer("version").default(1).notNull(),
  },
  (table) => [
    index("menu_items_section_idx").on(table.sectionId, table.sortOrder),
  ]
);

export const menuItemVariants = pgTable(
  "menu_item_variants",
  {
    detail: text("detail"),
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    label: text("label"),
    priceCents: integer("price_cents").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [index("menu_variants_item_idx").on(table.itemId, table.sortOrder)]
);

export const menuChoiceGroups = pgTable("menu_choice_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const menuChoices = pgTable("menu_choices", {
  groupId: uuid("group_id")
    .notNull()
    .references(() => menuChoiceGroups.id, { onDelete: "cascade" }),
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});
