import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { mediaAssets } from "./media";

export const siteSettings = pgTable("site_settings", {
  addressLine: text("address_line").notNull(),
  bookingHorizonDays: smallint("booking_horizon_days").default(90).notNull(),
  city: text("city").notNull(),
  email: text("email").notNull(),
  facebookUrl: text("facebook_url"),
  id: text("id").primaryKey().default("default"),
  instagramUrl: text("instagram_url"),
  lastServiceMinutes: smallint("last_service_minutes").default(30).notNull(),
  leadTimeMinutes: smallint("lead_time_minutes").default(60).notNull(),
  mapUrl: text("map_url").notNull(),
  maxCoversPerSlot: smallint("max_covers_per_slot").default(40).notNull(),
  maxPartySize: smallint("max_party_size").default(20).notNull(),
  phone: text("phone").notNull(),
  postalCode: text("postal_code").notNull(),
  reservationNotice: text("reservation_notice").notNull(),
  restaurantName: text("restaurant_name").default("Indian Coffee").notNull(),
  // Paramètres de réservation : jusqu'ici codés en dur dans le service.
  slotMinutes: smallint("slot_minutes").default(30).notNull(),
  tagline: text("tagline").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  version: integer("version").default(1).notNull(),
});

export const homeContent = pgTable("home_content", {
  eyebrow: text("eyebrow").notNull(),
  heroIntro: text("hero_intro").notNull(),
  heroMediaId: uuid("hero_media_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  heroTitle: text("hero_title").notNull(),
  id: text("id").primaryKey().default("default"),
  storyBody: text("story_body").notNull(),
  storyMediaId: uuid("story_media_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  storyTitle: text("story_title").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  version: integer("version").default(1).notNull(),
});

/**
 * Une ligne par service : `dayOfWeek` va de 1 (lundi) à 7 (dimanche), et
 * `sortOrder` distingue les services d'une même journée (midi, soir). Un jour
 * fermé est représenté par une ligne unique `isClosed = true` sans horaires,
 * de sorte que « fermé » se distingue de « non configuré ».
 */
export const openingHours = pgTable(
  "opening_hours",
  {
    closesAt: time("closes_at"),
    dayOfWeek: smallint("day_of_week").notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    isClosed: boolean("is_closed").default(false).notNull(),
    label: text("label"),
    opensAt: time("opens_at"),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    unique("opening_hours_day_service_key").on(
      table.dayOfWeek,
      table.sortOrder
    ),
  ]
);

export const specialHours = pgTable(
  "special_hours",
  {
    closesAt: time("closes_at"),
    day: date("day").notNull().unique(),
    id: uuid("id").defaultRandom().primaryKey(),
    isClosed: boolean("is_closed").default(false).notNull(),
    label: text("label"),
    opensAt: time("opens_at"),
  },
  (table) => [index("special_hours_day_idx").on(table.day)]
);
