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

export const menuItemStatus = pgEnum("menu_item_status", ["AVAILABLE", "UNAVAILABLE", "HIDDEN"]);
export const spiceLevel = pgEnum("spice_level", ["MILD", "MEDIUM", "HOT"]);

export const menuCategories = pgTable("menu_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").default("").notNull(),
  mediaId: uuid("media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const menuSections = pgTable(
  "menu_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").default("").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isVisible: boolean("is_visible").default(true).notNull(),
    version: integer("version").default(1).notNull(),
  },
  (table) => [index("menu_sections_category_idx").on(table.categoryId, table.sortOrder)],
);

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => menuSections.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").default("").notNull(),
    mediaId: uuid("media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    status: menuItemStatus("status").default("AVAILABLE").notNull(),
    dietaryFlags: text("dietary_flags").array().default([]).notNull(),
    spiceLevel: spiceLevel("spice_level"),
    featured: boolean("featured").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    version: integer("version").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("menu_items_section_idx").on(table.sectionId, table.sortOrder)],
);

export const menuItemVariants = pgTable(
  "menu_item_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    label: text("label"),
    detail: text("detail"),
    priceCents: integer("price_cents").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [index("menu_variants_item_idx").on(table.itemId, table.sortOrder)],
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
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => menuChoiceGroups.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});
