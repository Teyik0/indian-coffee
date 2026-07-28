import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const mediaAssets = pgTable("media_assets", {
  alt: text("alt").notNull(),
  checksum: text("checksum").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  id: uuid("id").defaultRandom().primaryKey(),
  largeBytes: integer("large_bytes").notNull(),
  largeHeight: integer("large_height").notNull(),
  largeKey: text("large_key").notNull().unique(),
  largeUrl: text("large_url").notNull(),
  largeWidth: integer("large_width").notNull(),
  mediumBytes: integer("medium_bytes").notNull(),
  mediumHeight: integer("medium_height").notNull(),
  mediumKey: text("medium_key").notNull().unique(),
  mediumUrl: text("medium_url").notNull(),
  mediumWidth: integer("medium_width").notNull(),
  placeholder: text("placeholder"),
  sourceName: text("source_name").notNull(),
  thumbBytes: integer("thumb_bytes").notNull(),
  thumbHeight: integer("thumb_height").notNull(),
  thumbKey: text("thumb_key").notNull().unique(),
  thumbUrl: text("thumb_url").notNull(),
  thumbWidth: integer("thumb_width").notNull(),
});
