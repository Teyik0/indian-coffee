import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  alt: text("alt").notNull(),
  checksum: text("checksum").notNull().unique(),
  sourceName: text("source_name").notNull(),
  placeholder: text("placeholder"),
  thumbKey: text("thumb_key").notNull().unique(),
  thumbUrl: text("thumb_url").notNull(),
  thumbWidth: integer("thumb_width").notNull(),
  thumbHeight: integer("thumb_height").notNull(),
  thumbBytes: integer("thumb_bytes").notNull(),
  mediumKey: text("medium_key").notNull().unique(),
  mediumUrl: text("medium_url").notNull(),
  mediumWidth: integer("medium_width").notNull(),
  mediumHeight: integer("medium_height").notNull(),
  mediumBytes: integer("medium_bytes").notNull(),
  largeKey: text("large_key").notNull().unique(),
  largeUrl: text("large_url").notNull(),
  largeWidth: integer("large_width").notNull(),
  largeHeight: integer("large_height").notNull(),
  largeBytes: integer("large_bytes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
