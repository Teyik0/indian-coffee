import type { DrizzleSQL } from "@/api/lib/db";
import {
  and,
  asc,
  count,
  db,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "@/api/lib/db";
import { env } from "@/api/lib/env";
import {
  addDays,
  minutesToTime,
  parisDateTimeToUtc,
  parisDayKey,
} from "@/api/lib/paris-time";
import { reservationEvents, reservations } from "@/db/schema/reservations";
import {
  mutationRequests,
  outboxJobs,
  requestRateLimits,
} from "@/db/schema/system";
import { openingHoursService } from "../content/opening-hours.service";
import { DomainError, sha256 } from "../shared";
import type {
  ReservationAvailability,
  ReservationCreateInput,
  ReservationListQuery,
  ReservationPublicResult,
  ReservationStatusUpdate,
} from "./model";

/** Statuts qui consomment réellement des couverts. */
const BLOCKING_STATUSES = ["PENDING", "CONFIRMED"] as const;

/**
 * Couverts déjà engagés par créneau pour une journée donnée. Un créneau est
 * identifié par son instant de début : les créneaux étant générés sur une
 * grille régulière, les `requestedAt` s'alignent exactement.
 */
async function coversBySlot(day: string) {
  const from = parisDateTimeToUtc(day, "00:00");
  const to = parisDateTimeToUtc(addDays(day, 1), "00:00");
  if (!(from && to)) {
    return new Map<number, number>();
  }
  const rows = await db
    .select({
      covers: sql<number>`sum(${reservations.partySize})`,
      requestedAt: reservations.requestedAt,
    })
    .from(reservations)
    .where(
      and(
        gte(reservations.requestedAt, from),
        lte(reservations.requestedAt, to),
        inArray(reservations.status, [...BLOCKING_STATUSES])
      )
    )
    .groupBy(reservations.requestedAt);
  return new Map(
    rows.map((row) => [
      new Date(row.requestedAt).getTime(),
      Number(row.covers ?? 0),
    ])
  );
}

/**
 * Créneaux réservables d'une journée avec les places restantes. Alimente à la
 * fois le formulaire public et l'écran de réservation du back-office.
 */
async function getAvailability(
  day: string,
  now = new Date()
): Promise<ReservationAvailability> {
  const { isClosed, slots, resolved, settings } =
    await openingHoursService.getSlots(day);
  const today = parisDayKey(now);
  const horizonDay = addDays(today, settings.bookingHorizonDays);
  const services =
    resolved?.ranges.map((range) => ({
      closesAt: minutesToTime(range.closesAt),
      label: range.label,
      opensAt: minutesToTime(range.opensAt),
    })) ?? [];

  if (day < today || day > horizonDay) {
    return {
      day,
      exception: resolved?.exception ?? null,
      isClosed: true,
      maxPartySize: settings.maxPartySize,
      reason: "OUT_OF_RANGE",
      services,
      slots: [],
    };
  }
  if (isClosed) {
    return {
      day,
      exception: resolved?.exception ?? null,
      isClosed: true,
      maxPartySize: settings.maxPartySize,
      reason: "CLOSED",
      services,
      slots: [],
    };
  }

  const covers = await coversBySlot(day);
  const earliest = now.getTime() + settings.leadTimeMinutes * 60_000;

  return {
    day,
    exception: resolved?.exception ?? null,
    isClosed: false,
    maxPartySize: settings.maxPartySize,
    reason: null,
    services,
    slots: slots.flatMap((time) => {
      const startsAt = parisDateTimeToUtc(day, time);
      if (!startsAt) {
        return [];
      }
      const taken = covers.get(startsAt.getTime()) ?? 0;
      const remaining = Math.max(0, settings.maxCoversPerSlot - taken);
      return [
        {
          isAvailable: remaining > 0 && startsAt.getTime() >= earliest,
          remaining,
          time,
        },
      ];
    }),
  };
}

/**
 * Valide le créneau demandé contre les horaires réellement enregistrés, les
 * fermetures exceptionnelles et la capacité. Ces règles étaient auparavant
 * codées en dur ici, ce qui rendait les horaires du back-office décoratifs et
 * laissait passer des réservations un jour de fermeture.
 */
async function validateRequestedSlot(input: ReservationCreateInput) {
  const requestedAt = parisDateTimeToUtc(
    input.requestedDate,
    input.requestedTime
  );
  if (!requestedAt) {
    throw new DomainError(
      "INVALID_DATE",
      "La date de réservation est invalide.",
      422,
      { requestedDate: ["Date invalide."] }
    );
  }

  const availability = await getAvailability(input.requestedDate);
  if (availability.isClosed) {
    const label = availability.exception?.label;
    let message = "Nous sommes fermés ce jour-là.";
    if (availability.reason === "OUT_OF_RANGE") {
      message = "Choisissez une date future dans notre période de réservation.";
    } else if (label) {
      message = `Nous sommes fermés ce jour-là (${label}).`;
    }
    throw new DomainError(
      availability.reason === "OUT_OF_RANGE"
        ? "INVALID_RESERVATION_DATE"
        : "OUTSIDE_OPENING_HOURS",
      message,
      422,
      { requestedDate: ["Date indisponible."] }
    );
  }

  if (input.partySize > availability.maxPartySize) {
    throw new DomainError(
      "PARTY_TOO_LARGE",
      `Pour plus de ${availability.maxPartySize} personnes, contactez-nous par téléphone.`,
      422,
      { partySize: ["Groupe trop nombreux."] }
    );
  }

  const slot = availability.slots.find(
    (entry) => entry.time === input.requestedTime.slice(0, 5)
  );
  if (!slot) {
    throw new DomainError(
      "OUTSIDE_OPENING_HOURS",
      "Cet horaire ne correspond à aucun de nos créneaux de service.",
      422,
      { requestedTime: ["Horaire indisponible."] }
    );
  }
  if (!slot.isAvailable) {
    throw new DomainError(
      "SLOT_UNAVAILABLE",
      slot.remaining === 0
        ? "Ce créneau est complet. Choisissez un autre horaire."
        : "Ce créneau est trop proche. Choisissez un horaire plus tardif.",
      422,
      { requestedTime: ["Créneau indisponible."] }
    );
  }
  if (input.partySize > slot.remaining) {
    throw new DomainError(
      "SLOT_UNAVAILABLE",
      `Il ne reste que ${slot.remaining} place(s) sur ce créneau.`,
      422,
      { partySize: ["Trop de convives pour ce créneau."] }
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
    .values({ count: 1, expiresAt, key, windowStartedAt: now })
    .onConflictDoUpdate({
      set: { count: sql`${requestRateLimits.count} + 1` },
      target: requestRateLimits.key,
    })
    .returning({ count: requestRateLimits.count });
  if ((rows[0]?.count ?? 1) > 5) {
    throw new DomainError(
      "RATE_LIMITED",
      "Trop de demandes ont été envoyées. Réessayez dans une heure.",
      429
    );
  }
}

export const reservationService = {
  async create(
    input: ReservationCreateInput,
    context: { idempotencyKey: string; ip: string }
  ): Promise<ReservationPublicResult> {
    if (input.website) {
      return {
        message: "Votre demande a bien été transmise.",
        reservation: {
          id: crypto.randomUUID(),
          reference: "IC-REÇUE",
          status: "PENDING",
        },
      };
    }

    const requestedAt = await validateRequestedSlot(input);
    const reference = createReference(input.requestedDate);
    const id = crypto.randomUUID();
    const result: ReservationPublicResult = {
      message:
        "Votre demande a bien été transmise. Notre équipe va vous répondre rapidement.",
      reservation: { id, reference, status: "PENDING" },
    };

    await enforceRateLimit(context.ip, input.email);
    const requestHash = await sha256(JSON.stringify(input));
    const existingRows = await db
      .select()
      .from(mutationRequests)
      .where(eq(mutationRequests.key, context.idempotencyKey))
      .limit(1);
    const [existing] = existingRows;
    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new DomainError(
          "IDEMPOTENCY_CONFLICT",
          "Cette clé a déjà servi à une autre demande.",
          409
        );
      }
      if (existing.state === "COMPLETED" && existing.response) {
        return existing.response as ReservationPublicResult;
      }
      throw new DomainError(
        "MUTATION_IN_PROGRESS",
        "Cette demande est déjà en cours.",
        409
      );
    }

    await db.insert(mutationRequests).values({
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      key: context.idempotencyKey,
      requestHash,
    });

    try {
      await db.transaction(async (tx) => {
        await tx.insert(reservations).values({
          consentAt: new Date(),
          email: input.email,
          fullName: input.fullName,
          id,
          message: input.message || null,
          occasion: input.occasion || null,
          partySize: input.partySize,
          phone: input.phone,
          reference,
          requestedAt,
        });
        await tx.insert(reservationEvents).values({
          note: "Demande reçue depuis le site.",
          reservationId: id,
          toStatus: "PENDING",
        });
        await tx.insert(outboxJobs).values([
          {
            dedupeKey: `reservation:${id}:customer:received`,
            kind: "EMAIL_SEND",
            payload: {
              reference,
              reservationId: id,
              template: "reservation-received",
              to: input.email,
            },
          },
          {
            dedupeKey: `reservation:${id}:restaurant:new`,
            kind: "EMAIL_SEND",
            payload: {
              reference,
              reservationId: id,
              template: "reservation-restaurant",
              to: env.RESTAURANT_NOTIFICATION_EMAIL,
            },
          },
        ]);
        await tx
          .update(mutationRequests)
          .set({ response: result, state: "COMPLETED", statusCode: 201 })
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
  getAvailability,

  async getById(id: string) {
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);
    if (!reservation) {
      throw new DomainError(
        "RESERVATION_NOT_FOUND",
        "Cette réservation n’existe pas ou plus.",
        404
      );
    }
    const events = await db
      .select()
      .from(reservationEvents)
      .where(eq(reservationEvents.reservationId, id))
      .orderBy(asc(reservationEvents.createdAt));
    return { events, reservation };
  },

  /**
   * Disponibilité d'un intervalle de jours : le calendrier public grise les
   * jours fermés au lieu de laisser le client découvrir le refus après envoi.
   */
  async getCalendar(fromDay = parisDayKey(new Date()), days = 60) {
    const settings = await openingHoursService.getReservationSettings();
    const span = Math.min(days, settings.bookingHorizonDays);
    const keys = Array.from({ length: span }, (_, index) =>
      addDays(fromDay, index)
    );
    const resolved = await openingHoursService.resolveDays(keys);
    return {
      days: resolved.map((entry) => ({
        day: entry.day as string,
        exceptionLabel: entry.exception?.label ?? null,
        isClosed: entry.isClosed,
        opensAt: entry.ranges[0]
          ? minutesToTime(entry.ranges[0].opensAt)
          : null,
      })),
      from: fromDay,
      horizonDays: settings.bookingHorizonDays,
      maxPartySize: settings.maxPartySize,
      slotMinutes: settings.slotMinutes,
    };
  },

  /**
   * Liste filtrée et paginée. Le tri place les demandes à traiter en tête puis
   * les échéances les plus récentes : l'ancien tri croissant enfouissait le
   * service du jour sous des mois de réservations passées.
   */
  async list(query: ReservationListQuery = {}) {
    const page = query.page ?? 1;
    const size = Math.min(query.pageSize ?? 25, 100);
    const filters: DrizzleSQL[] = [];

    if (query.status && query.status.length > 0) {
      filters.push(inArray(reservations.status, query.status));
    }
    if (query.from) {
      const from = parisDateTimeToUtc(query.from, "00:00");
      if (from) {
        filters.push(gte(reservations.requestedAt, from));
      }
    }
    if (query.to) {
      const to = parisDateTimeToUtc(addDays(query.to, 1), "00:00");
      if (to) {
        filters.push(lte(reservations.requestedAt, to));
      }
    }
    if (query.search) {
      const term = `%${query.search.trim()}%`;
      const searchFilter = or(
        ilike(reservations.fullName, term),
        ilike(reservations.email, term),
        ilike(reservations.phone, term),
        ilike(reservations.reference, term)
      );
      if (searchFilter) {
        filters.push(searchFilter);
      }
    }
    const where = filters.length > 0 ? and(...filters) : undefined;

    const [items, totalRows, statusRows] = await Promise.all([
      db
        .select()
        .from(reservations)
        .where(where)
        .orderBy(
          sql`case when ${reservations.status} = 'PENDING' then 0 else 1 end`,
          query.order === "asc"
            ? asc(reservations.requestedAt)
            : desc(reservations.requestedAt)
        )
        .limit(size)
        .offset((page - 1) * size),
      db.select({ total: count() }).from(reservations).where(where),
      db
        .select({ status: reservations.status, total: count() })
        .from(reservations)
        .groupBy(reservations.status),
    ]);

    const total = Number(totalRows[0]?.total ?? 0);
    return {
      counts: Object.fromEntries(
        statusRows.map((row) => [row.status, Number(row.total)])
      ),
      items,
      page,
      pageCount: Math.max(1, Math.ceil(total / size)),
      pageSize: size,
      total,
    };
  },

  /** Réservations engagées d'une journée, pour le tableau de bord. */
  listForDay(day = parisDayKey(new Date())) {
    const from = parisDateTimeToUtc(day, "00:00");
    const to = parisDateTimeToUtc(addDays(day, 1), "00:00");
    if (!(from && to)) {
      return [];
    }
    return db
      .select()
      .from(reservations)
      .where(
        and(
          gte(reservations.requestedAt, from),
          lte(reservations.requestedAt, to),
          inArray(reservations.status, [...BLOCKING_STATUSES])
        )
      )
      .orderBy(asc(reservations.requestedAt));
  },

  updateStatus(
    id: string,
    input: ReservationStatusUpdate,
    actor?: { id: string; name: string }
  ) {
    return db.transaction(async (tx) => {
      const [previous] = await tx
        .select({ status: reservations.status })
        .from(reservations)
        .where(eq(reservations.id, id))
        .limit(1);

      const rows = await tx
        .update(reservations)
        .set({
          status: input.status,
          // La note n'est touchée que si l'appelant en fournit une : elle était
          // jusqu'ici écrasée par une chaîne vide à chaque décision.
          ...(input.adminNote === undefined
            ? {}
            : { adminNote: input.adminNote || null }),
          updatedAt: new Date(),
          version: input.version + 1,
        })
        .where(
          and(eq(reservations.id, id), eq(reservations.version, input.version))
        )
        .returning();
      const [reservation] = rows;
      if (!reservation) {
        throw new DomainError(
          "VERSION_CONFLICT",
          "La réservation a été modifiée ailleurs. Rechargez la liste.",
          409
        );
      }

      await tx.insert(reservationEvents).values({
        actorId: actor ? actor.id : null,
        actorName: actor ? actor.name : null,
        fromStatus: previous?.status ?? null,
        note: input.adminNote || null,
        reservationId: id,
        toStatus: input.status,
      });

      // `CANCELLED` traduit une annulation côté client : inutile de lui envoyer
      // une notification pour une décision qu'il vient de prendre.
      if (input.status !== "CANCELLED") {
        await tx.insert(outboxJobs).values({
          dedupeKey: `reservation:${id}:status:${input.status}:${reservation.version}`,
          kind: "EMAIL_SEND",
          payload: {
            reference: reservation.reference,
            reservationId: id,
            template: `reservation-${input.status.toLocaleLowerCase()}`,
            to: reservation.email,
          },
        });
      }
      return reservation;
    });
  },
};
