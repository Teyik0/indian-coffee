import {
  boolean,
  date,
  integer,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { mediaAssets } from "./media";

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("default"),
  restaurantName: text("restaurant_name").default("Indian Coffee").notNull(),
  tagline: text("tagline").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  addressLine: text("address_line").notNull(),
  postalCode: text("postal_code").notNull(),
  city: text("city").notNull(),
  mapUrl: text("map_url").notNull(),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  reservationNotice: text("reservation_notice").notNull(),
  version: integer("version").default(1).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const homeContent = pgTable("home_content", {
  id: text("id").primaryKey().default("default"),
  eyebrow: text("eyebrow").notNull(),
  heroTitle: text("hero_title").notNull(),
  heroIntro: text("hero_intro").notNull(),
  storyTitle: text("story_title").notNull(),
  storyBody: text("story_body").notNull(),
  heroMediaId: uuid("hero_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  storyMediaId: uuid("story_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  version: integer("version").default(1).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const openingHours = pgTable("opening_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  dayOfWeek: smallint("day_of_week").notNull(),
  opensAt: time("opens_at").notNull(),
  closesAt: time("closes_at").notNull(),
  label: text("label"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const specialHours = pgTable("special_hours", {
  id: uuid("id").defaultRandom().primaryKey(),
  day: date("day").notNull().unique(),
  isClosed: boolean("is_closed").default(false).notNull(),
  opensAt: time("opens_at"),
  closesAt: time("closes_at"),
  label: text("label"),
});
