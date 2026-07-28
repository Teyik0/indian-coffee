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
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  key: text("key").primaryKey(),
  requestHash: text("request_hash").notNull(),
  response: jsonb("response"),
  state: mutationState("state").default("PROCESSING").notNull(),
  statusCode: integer("status_code"),
});

export const outboxJobs = pgTable(
  "outbox_jobs",
  {
    attempts: integer("attempts").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    dedupeKey: text("dedupe_key").notNull().unique(),
    id: uuid("id").defaultRandom().primaryKey(),
    kind: jobKind("kind").notNull(),
    lastError: text("last_error"),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    state: jobState("state").default("PENDING").notNull(),
  },
  (table) => [index("outbox_pending_idx").on(table.state, table.nextAttemptAt)]
);

export const requestRateLimits = pgTable("request_rate_limits", {
  count: integer("count").default(1).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  key: text("key").primaryKey(),
  windowStartedAt: timestamp("window_started_at", {
    withTimezone: true,
  }).notNull(),
});
