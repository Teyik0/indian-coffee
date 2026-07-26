import { and, asc, db, eq, sql } from "@/api/lib/db";
import { env } from "@/api/lib/env";
import { reservations } from "@/db/schema/reservations";
import {
  mutationRequests,
  outboxJobs,
  requestRateLimits,
} from "@/db/schema/system";
import { DomainError, sha256 } from "../shared";
import type {
  ReservationCreateInput,
  ReservationPublicResult,
  ReservationStatusUpdate,
} from "./model";

const parisFormatter = new Intl.DateTimeFormat("fr-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function parisParts(date: Date) {
  return Object.fromEntries(
    parisFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
}

function parisDateTimeToUtc(day: string, time: string) {
  const [year, month, date] = day.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if ([year, month, date, hour, minute].some((value) => Number.isNaN(value))) {
    throw new DomainError(
      "INVALID_DATE",
      "La date de réservation est invalide.",
      422,
    );
  }

  const desired = Date.UTC(
    year ?? 0,
    (month ?? 1) - 1,
    date ?? 1,
    hour ?? 0,
    minute ?? 0,
  );
  let candidate = desired;
  for (let iteration = 0; iteration < 2; iteration += 1) {
    const parts = parisParts(new Date(candidate));
    const represented = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
    );
    candidate += desired - represented;
  }
  return new Date(candidate);
}

function validateRequestedSlot(input: ReservationCreateInput) {
  const now = new Date();
  const requestedAt = parisDateTimeToUtc(
    input.requestedDate,
    input.requestedTime,
  );
  const latest = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  if (requestedAt <= now || requestedAt > latest) {
    throw new DomainError(
      "INVALID_RESERVATION_DATE",
      "Choisissez une date future dans les 90 prochains jours.",
      422,
      { requestedDate: ["Date indisponible."] },
    );
  }

  const weekday = new Date(`${input.requestedDate}T12:00:00Z`).getUTCDay();
  const minutes =
    Number(input.requestedTime.slice(0, 2)) * 60 +
    Number(input.requestedTime.slice(3));
  const opening = weekday === 0 ? 12 * 60 : 11 * 60;
  const closing = weekday === 5 || weekday === 6 ? 23 * 60 : 22 * 60 + 30;
  if (minutes < opening || minutes > closing - 30) {
    throw new DomainError(
      "OUTSIDE_OPENING_HOURS",
      "Cet horaire se situe en dehors de nos heures de service.",
      422,
      { requestedTime: ["Horaire indisponible."] },
    );
  }
  return requestedAt;
}

function createReference(requestedDate: string) {
  const suffix = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 4)
    .toUpperCase();
  return `IC-${requestedDate.replaceAll("-", "")}-${suffix}`;
}

async function enforceRateLimit(ip: string, email: string) {
  const bucket = new Date().toISOString().slice(0, 13);
  const key = await sha256(`${ip}|${email.toLocaleLowerCase()}|${bucket}`);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  const rows = await db
    .insert(requestRateLimits)
    .values({ key, count: 1, windowStartedAt: now, expiresAt })
    .onConflictDoUpdate({
      target: requestRateLimits.key,
      set: { count: sql`${requestRateLimits.count} + 1` },
    })
    .returning({ count: requestRateLimits.count });
  if ((rows[0]?.count ?? 1) > 5) {
    throw new DomainError(
      "RATE_LIMITED",
      "Trop de demandes ont été envoyées. Réessayez dans une heure.",
      429,
    );
  }
}

export const reservationService = {
  async create(
    input: ReservationCreateInput,
    context: { idempotencyKey: string; ip: string },
  ): Promise<ReservationPublicResult> {
    if (input.website) {
      return {
        reservation: {
          id: crypto.randomUUID(),
          reference: "IC-REÇUE",
          status: "PENDING",
        },
        message: "Votre demande a bien été transmise.",
      };
    }

    const requestedAt = validateRequestedSlot(input);
    const reference = createReference(input.requestedDate);
    const id = crypto.randomUUID();
    const result: ReservationPublicResult = {
      reservation: { id, reference, status: "PENDING" },
      message:
        "Votre demande a bien été transmise. Notre équipe va vous répondre rapidement.",
    };

    await enforceRateLimit(context.ip, input.email);
    const requestHash = await sha256(JSON.stringify(input));
    const existingRows = await db
      .select()
      .from(mutationRequests)
      .where(eq(mutationRequests.key, context.idempotencyKey))
      .limit(1);
    const existing = existingRows[0];
    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new DomainError(
          "IDEMPOTENCY_CONFLICT",
          "Cette clé a déjà servi à une autre demande.",
          409,
        );
      }
      if (existing.state === "COMPLETED" && existing.response) {
        return existing.response as ReservationPublicResult;
      }
      throw new DomainError(
        "MUTATION_IN_PROGRESS",
        "Cette demande est déjà en cours.",
        409,
      );
    }

    await db.insert(mutationRequests).values({
      key: context.idempotencyKey,
      requestHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await db.transaction(async (tx) => {
        await tx.insert(reservations).values({
          id,
          reference,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          partySize: input.partySize,
          requestedAt,
          occasion: input.occasion || null,
          message: input.message || null,
          consentAt: new Date(),
        });
        await tx.insert(outboxJobs).values([
          {
            kind: "EMAIL_SEND",
            dedupeKey: `reservation:${id}:customer:received`,
            payload: {
              template: "reservation-received",
              to: input.email,
              reservationId: id,
              reference,
            },
          },
          {
            kind: "EMAIL_SEND",
            dedupeKey: `reservation:${id}:restaurant:new`,
            payload: {
              template: "reservation-restaurant",
              to: env.RESTAURANT_NOTIFICATION_EMAIL,
              reservationId: id,
              reference,
            },
          },
        ]);
        await tx
          .update(mutationRequests)
          .set({ state: "COMPLETED", statusCode: 201, response: result })
          .where(eq(mutationRequests.key, context.idempotencyKey));
      });
      return result;
    } catch (error) {
      await db
        .update(mutationRequests)
        .set({ state: "FAILED" })
        .where(eq(mutationRequests.key, context.idempotencyKey));
      throw error;
    }
  },

  async list() {
    return db
      .select()
      .from(reservations)
      .orderBy(asc(reservations.requestedAt));
  },

  async updateStatus(id: string, input: ReservationStatusUpdate) {
    return db.transaction(async (tx) => {
      const rows = await tx
        .update(reservations)
        .set({
          status: input.status,
          adminNote: input.adminNote || null,
          version: input.version + 1,
          updatedAt: new Date(),
        })
        .where(
          and(eq(reservations.id, id), eq(reservations.version, input.version)),
        )
        .returning();
      const reservation = rows[0];
      if (!reservation) {
        throw new DomainError(
          "VERSION_CONFLICT",
          "La réservation a été modifiée ailleurs.",
          409,
        );
      }
      await tx.insert(outboxJobs).values({
        kind: "EMAIL_SEND",
        dedupeKey: `reservation:${id}:status:${input.status}:${reservation.version}`,
        payload: {
          template: `reservation-${input.status.toLocaleLowerCase()}`,
          to: reservation.email,
          reservationId: id,
          reference: reservation.reference,
        },
      });
      return reservation;
    });
  },
};
