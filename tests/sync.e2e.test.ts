import { expect, test } from "bun:test";
import * as Effect from "effect4/Effect";
import { sqlClient } from "@/api/lib/db";
import { apiEffect, getApi } from "@/lib/api-client";

const idempotencyKey = `sync-e2e-${crypto.randomUUID()}`;
const email = `${idempotencyKey}@indiancoffee.test`;
let reservationId: string | undefined;

function futureReservationDate() {
  return new Intl.DateTimeFormat("fr-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Paris",
    year: "numeric",
  }).format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
}

const reservation = {
  consent: true,
  email,
  fullName: "Replay Sync",
  message: "",
  occasion: "",
  partySize: 2,
  phone: "0612345678",
  requestedDate: futureReservationDate(),
  requestedTime: "19:30",
  website: "",
};

const requestOptions = {
  headers: {
    "Idempotency-Key": idempotencyKey,
    "x-forwarded-for": `e2e-${idempotencyKey}`,
  },
};

async function cleanup() {
  if (reservationId) {
    await sqlClient`
      DELETE FROM outbox_jobs
      WHERE payload->>'reservationId' = ${reservationId}
    `;
    await sqlClient`DELETE FROM reservations WHERE id = ${reservationId}`;
  }
  await sqlClient`
    DELETE FROM mutation_requests WHERE key = ${idempotencyKey}
  `;
  await sqlClient.close({ timeout: 0 });
}

test("PostgreSQL sync replays one mutation and rejects a different payload", async () => {
  try {
    const cursorRows = await sqlClient<
      { current_cursor: string | number | bigint }[]
    >`
    SELECT current_cursor
    FROM furin_sync.streams
    WHERE namespace = 'indian-coffee-v1'
  `;
    const previousCursor = cursorRows[0]?.current_cursor ?? 0;

    const first = await getApi().api.reservations.post(
      reservation,
      requestOptions
    );
    expect(first.status).toBe(201);
    const firstPayload = await Effect.runPromise(
      apiEffect(() => Promise.resolve(first))
    );
    reservationId = firstPayload.reservation.id;

    const changes = await sqlClient<
      { invalidations: { kind: string; tags?: string[] }[] }[]
    >`
    SELECT invalidations
    FROM furin_sync.changes
    WHERE namespace = 'indian-coffee-v1'
      AND cursor > ${previousCursor}
    ORDER BY cursor
  `;
    expect(
      changes.some((change) =>
        change.invalidations.some(
          (invalidation) =>
            invalidation.kind === "tags" &&
            invalidation.tags?.includes("reservations")
        )
      )
    ).toBe(true);

    const replay = await getApi().api.reservations.post(
      reservation,
      requestOptions
    );
    expect(replay.status).toBe(201);
    expect(
      (await Effect.runPromise(apiEffect(() => Promise.resolve(replay))))
        .reservation.id
    ).toBe(reservationId);

    const conflict = await getApi().api.reservations.post(
      { ...reservation, partySize: 3 },
      requestOptions
    );
    const conflictValue = conflict.error?.value as
      | { code?: string }
      | undefined;
    expect(conflict.status).toBe(409);
    expect(conflictValue?.code).toBe("FURIN_IDEMPOTENCY_MISMATCH");
  } finally {
    await cleanup();
  }
});
