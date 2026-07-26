import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const mutationState = pgEnum("mutation_state", [
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);
export const jobState = pgEnum("job_state", [
  "PENDING",
  "PROCESSING",
  "DONE",
  "FAILED",
]);
export const jobKind = pgEnum("job_kind", ["EMAIL_SEND", "MEDIA_DELETE"]);

export const mutationRequests = pgTable("mutation_requests", {
  key: text("key").primaryKey(),
  requestHash: text("request_hash").notNull(),
  state: mutationState("state").default("PROCESSING").notNull(),
  statusCode: integer("status_code"),
  response: jsonb("response"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const outboxJobs = pgTable(
  "outbox_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: jobKind("kind").notNull(),
    payload: jsonb("payload").notNull(),
    dedupeKey: text("dedupe_key").notNull().unique(),
    state: jobState("state").default("PENDING").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [index("outbox_pending_idx").on(table.state, table.nextAttemptAt)],
);

export const requestRateLimits = pgTable("request_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").default(1).notNull(),
  windowStartedAt: timestamp("window_started_at", {
    withTimezone: true,
  }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
