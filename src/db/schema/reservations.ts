import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const reservationStatus = pgEnum("reservation_status", [
  "PENDING",
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
]);

export const reservations = pgTable(
  "reservations",
  {
    adminNote: text("admin_note"),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    message: text("message"),
    occasion: text("occasion"),
    partySize: integer("party_size").notNull(),
    phone: text("phone").notNull(),
    reference: text("reference").notNull().unique(),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),
    status: reservationStatus("status").default("PENDING").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    version: integer("version").default(1).notNull(),
  },
  (table) => [
    index("reservations_requested_idx").on(table.requestedAt),
    index("reservations_status_idx").on(table.status),
  ]
);

/**
 * Journal des décisions prises sur une réservation. Sans lui, `adminNote` est
 * écrasée à chaque changement de statut et l'équipe perd la trace de qui a
 * confirmé ou refusé, et pourquoi.
 */
export const reservationEvents = pgTable(
  "reservation_events",
  {
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    actorName: text("actor_name"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    fromStatus: reservationStatus("from_status"),
    id: uuid("id").defaultRandom().primaryKey(),
    note: text("note"),
    reservationId: uuid("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "cascade" }),
    toStatus: reservationStatus("to_status").notNull(),
  },
  (table) => [
    index("reservation_events_reservation_idx").on(
      table.reservationId,
      table.createdAt
    ),
  ]
);
