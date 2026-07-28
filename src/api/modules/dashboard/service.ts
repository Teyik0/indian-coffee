import { and, asc, count, db, desc, eq, gte, inArray, lte } from "@/api/lib/db";
import { addDays, parisDateTimeToUtc, parisDayKey } from "@/api/lib/paris-time";
import { galleryEntries } from "@/db/schema/gallery";
import { menuItems } from "@/db/schema/menu";
import { reservationEvents, reservations } from "@/db/schema/reservations";
import { outboxJobs } from "@/db/schema/system";
import { openingHoursService } from "../content/opening-hours.service";

/**
 * Le tableau de bord chargeait auparavant toute la carte et toutes les
 * réservations en mémoire pour en déduire quatre compteurs. Tout est désormais
 * agrégé côté base.
 */
export const dashboardService = {
  async get(now = new Date()) {
    const today = parisDayKey(now);
    const dayStart = parisDateTimeToUtc(today, "00:00");
    const dayEnd = parisDateTimeToUtc(addDays(today, 1), "00:00");

    const [
      menuRows,
      reservationRows,
      galleryRows,
      todayRows,
      recentEvents,
      failedJobs,
      openState,
      exceptions,
    ] = await Promise.all([
      db
        .select({ status: menuItems.status, total: count() })
        .from(menuItems)
        .groupBy(menuItems.status),
      db
        .select({ status: reservations.status, total: count() })
        .from(reservations)
        .groupBy(reservations.status),
      db.select({ total: count() }).from(galleryEntries),
      dayStart && dayEnd
        ? db
            .select()
            .from(reservations)
            .where(
              and(
                gte(reservations.requestedAt, dayStart),
                lte(reservations.requestedAt, dayEnd),
                inArray(reservations.status, ["PENDING", "CONFIRMED"])
              )
            )
            .orderBy(asc(reservations.requestedAt))
        : Promise.resolve([]),
      db
        .select({
          actorName: reservationEvents.actorName,
          createdAt: reservationEvents.createdAt,
          fullName: reservations.fullName,
          id: reservationEvents.id,
          note: reservationEvents.note,
          reference: reservations.reference,
          reservationId: reservationEvents.reservationId,
          toStatus: reservationEvents.toStatus,
        })
        .from(reservationEvents)
        .innerJoin(
          reservations,
          eq(reservationEvents.reservationId, reservations.id)
        )
        .orderBy(desc(reservationEvents.createdAt))
        .limit(8),
      db
        .select({ total: count() })
        .from(outboxJobs)
        .where(eq(outboxJobs.state, "FAILED")),
      openingHoursService.getOpenState(now),
      openingHoursService.getUpcomingExceptions(today),
    ]);

    const menuByStatus = new Map(
      menuRows.map((row) => [row.status, Number(row.total)])
    );
    const reservationByStatus = new Map(
      reservationRows.map((row) => [row.status, Number(row.total)])
    );

    return {
      openState,
      recentEvents,
      stats: {
        available: menuByStatus.get("AVAILABLE") ?? 0,
        confirmed: reservationByStatus.get("CONFIRMED") ?? 0,
        dishes: [...menuByStatus.values()].reduce(
          (total, value) => total + value,
          0
        ),
        failedJobs: Number(failedJobs[0]?.total ?? 0),
        galleryImages: Number(galleryRows[0]?.total ?? 0),
        hidden: menuByStatus.get("HIDDEN") ?? 0,
        pending: reservationByStatus.get("PENDING") ?? 0,
        reservations: [...reservationByStatus.values()].reduce(
          (total, value) => total + value,
          0
        ),
        unavailable: menuByStatus.get("UNAVAILABLE") ?? 0,
      },
      today: {
        covers: todayRows.reduce((total, entry) => total + entry.partySize, 0),
        day: today,
        reservations: todayRows,
      },
      upcomingExceptions: exceptions.slice(0, 4),
    };
  },

  /** Plats indisponibles, pour la liste d'actions du tableau de bord. */
  getUnavailableItems(limit = 8) {
    return db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        status: menuItems.status,
        updatedAt: menuItems.updatedAt,
      })
      .from(menuItems)
      .where(inArray(menuItems.status, ["UNAVAILABLE", "HIDDEN"]))
      .orderBy(desc(menuItems.updatedAt))
      .limit(limit);
  },
};

export type DashboardData = Awaited<ReturnType<typeof dashboardService.get>>;
export type UnavailableItem = Awaited<
  ReturnType<typeof dashboardService.getUnavailableItems>
>[number];
