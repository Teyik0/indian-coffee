import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const reservationStatus = pgEnum("reservation_status", [
  "PENDING",
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
]);

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: text("reference").notNull().unique(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    partySize: integer("party_size").notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),
    occasion: text("occasion"),
    message: text("message"),
    status: reservationStatus("status").default("PENDING").notNull(),
    adminNote: text("admin_note"),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    version: integer("version").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reservations_requested_idx").on(table.requestedAt),
    index("reservations_status_idx").on(table.status),
  ],
);
