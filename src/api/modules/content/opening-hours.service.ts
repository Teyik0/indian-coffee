import { asc, db, eq, gte, inArray } from "@/api/lib/db";
import {
  addDays,
  formatFrenchTime,
  isoWeekday,
  minutesToTime,
  parisDayKey,
  parisMinutesOfDay,
  timeToMinutes,
  weekdayName,
} from "@/api/lib/paris-time";
import { openingHours, siteSettings, specialHours } from "@/db/schema/content";

export interface ServiceRange {
  closesAt: number;
  label: string | null;
  opensAt: number;
}

export interface ResolvedDay {
  /** Jour civil parisien `YYYY-MM-DD`, absent pour la grille hebdomadaire. */
  day?: string;
  dayName: string;
  /** Renseigné lorsqu'une fermeture ou une plage exceptionnelle s'applique. */
  exception: { label: string | null } | null;
  isClosed: boolean;
  isoDay: number;
  ranges: ServiceRange[];
}

export type WeeklyHoursInput = Array<{
  dayOfWeek: number;
  isClosed: boolean;
  ranges: Array<{ opensAt: string; closesAt: string; label?: string | null }>;
}>;

/**
 * Source de vérité du seed : service continu sept jours sur sept, plus tard le
 * midi le dimanche. Le back-office écrit ensuite dans la même table.
 */
export const initialWeeklyHours = [
  { closesAt: "22:30", dayOfWeek: 1, isClosed: false, opensAt: "11:00" },
  { closesAt: "22:30", dayOfWeek: 2, isClosed: false, opensAt: "11:00" },
  { closesAt: "22:30", dayOfWeek: 3, isClosed: false, opensAt: "11:00" },
  { closesAt: "22:30", dayOfWeek: 4, isClosed: false, opensAt: "11:00" },
  { closesAt: "23:00", dayOfWeek: 5, isClosed: false, opensAt: "11:00" },
  { closesAt: "23:00", dayOfWeek: 6, isClosed: false, opensAt: "11:00" },
  { closesAt: "22:30", dayOfWeek: 7, isClosed: false, opensAt: "12:00" },
] as const;

function rangesEqual(left: ServiceRange[], right: ServiceRange[]) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every(
    (range, index) =>
      range.opensAt === right[index]?.opensAt &&
      range.closesAt === right[index]?.closesAt
  );
}

function formatRanges(ranges: ServiceRange[]) {
  return ranges
    .map(
      (range) =>
        `${formatFrenchTime(range.opensAt)} — ${formatFrenchTime(range.closesAt)}`
    )
    .join(" · ");
}

/**
 * Regroupe les journées consécutives aux horaires identiques : le public lit
 * « Lundi — Jeudi · 11h00 — 22h30 » plutôt que quatre lignes redondantes. Ce
 * regroupement était auparavant figé dans le libellé stocké en base, ce qui
 * rendait les horaires inéditables.
 */
export function groupWeekForDisplay(week: ResolvedDay[]) {
  const groups: Array<{
    day: string;
    value: string;
    isoDays: number[];
    isClosed: boolean;
    ranges: ServiceRange[];
  }> = [];

  for (const entry of week) {
    const value = entry.isClosed ? "Fermé" : formatRanges(entry.ranges);
    const last = groups.at(-1);
    const continues =
      last !== undefined &&
      last.isClosed === entry.isClosed &&
      rangesEqual(last.ranges, entry.ranges) &&
      last.isoDays.at(-1) === entry.isoDay - 1;

    if (continues && last) {
      last.isoDays.push(entry.isoDay);
      last.day = `${weekdayName(last.isoDays[0] as number)} — ${entry.dayName}`;
      continue;
    }
    groups.push({
      day: entry.dayName,
      isClosed: entry.isClosed,
      isoDays: [entry.isoDay],
      ranges: entry.ranges,
      value,
    });
  }

  return groups.map(({ day, value, isoDays }) => ({ day, isoDays, value }));
}

function buildWeek(rows: (typeof openingHours.$inferSelect)[]): ResolvedDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const isoDay = index + 1;
    const dayRows = rows
      .filter((row) => row.dayOfWeek === isoDay)
      .sort((left, right) => left.sortOrder - right.sortOrder);
    const ranges = dayRows.flatMap((row) =>
      !row.isClosed && row.opensAt && row.closesAt
        ? [
            {
              closesAt: timeToMinutes(row.closesAt),
              label: row.label,
              opensAt: timeToMinutes(row.opensAt),
            },
          ]
        : []
    );
    return {
      dayName: weekdayName(isoDay),
      exception: null,
      // Une journée sans plage exploitable est fermée : cela couvre aussi bien
      // `isClosed = true` que l'absence de configuration.
      isClosed: ranges.length === 0,
      isoDay,
      ranges,
    };
  });
}

function applyException(
  base: ResolvedDay,
  exception: typeof specialHours.$inferSelect
): ResolvedDay {
  if (exception.isClosed || !exception.opensAt || !exception.closesAt) {
    return {
      ...base,
      exception: { label: exception.label },
      isClosed: true,
      ranges: [],
    };
  }
  return {
    ...base,
    exception: { label: exception.label },
    isClosed: false,
    ranges: [
      {
        closesAt: timeToMinutes(exception.closesAt),
        label: exception.label,
        opensAt: timeToMinutes(exception.opensAt),
      },
    ],
  };
}

export const openingHoursService = {
  async deleteException(id: string) {
    const [row] = await db
      .delete(specialHours)
      .where(eq(specialHours.id, id))
      .returning({ id: specialHours.id });
    return row ?? null;
  },

  /**
   * État d'ouverture à un instant donné, avec la prochaine bascule. Alimente la
   * pilule « Ouvert · ferme à 22h30 » du site public.
   */
  async getOpenState(now = new Date()) {
    const today = parisDayKey(now);
    const [currentDay, nextDay] = await this.resolveDays([
      today,
      addDays(today, 1),
    ]);
    if (!currentDay) {
      throw new Error("Impossible de résoudre les horaires du jour.");
    }
    const minutes = parisMinutesOfDay(now);
    const activeRange = currentDay.ranges.find(
      (range) => minutes >= range.opensAt && minutes < range.closesAt
    );
    if (activeRange) {
      return {
        closesAt: formatFrenchTime(activeRange.closesAt),
        exception: currentDay.exception ?? null,
        isOpen: true as const,
        nextOpensAt: null,
        nextOpensDay: null,
      };
    }

    const laterToday = currentDay.ranges.find(
      (range) => range.opensAt > minutes
    );
    if (laterToday) {
      return {
        closesAt: null,
        exception: currentDay.exception ?? null,
        isOpen: false as const,
        nextOpensAt: formatFrenchTime(laterToday.opensAt),
        nextOpensDay: "aujourd’hui",
      };
    }

    const tomorrowRange = nextDay?.ranges[0];
    return {
      closesAt: null,
      exception: currentDay?.exception ?? null,
      isOpen: false as const,
      nextOpensAt: tomorrowRange
        ? formatFrenchTime(tomorrowRange.opensAt)
        : null,
      nextOpensDay: tomorrowRange ? "demain" : null,
    };
  },

  async getReservationSettings() {
    const [row] = await db
      .select({
        bookingHorizonDays: siteSettings.bookingHorizonDays,
        lastServiceMinutes: siteSettings.lastServiceMinutes,
        leadTimeMinutes: siteSettings.leadTimeMinutes,
        maxCoversPerSlot: siteSettings.maxCoversPerSlot,
        maxPartySize: siteSettings.maxPartySize,
        slotMinutes: siteSettings.slotMinutes,
      })
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);
    return (
      row ?? {
        bookingHorizonDays: 90,
        lastServiceMinutes: 30,
        leadTimeMinutes: 60,
        maxCoversPerSlot: 40,
        maxPartySize: 20,
        slotMinutes: 30,
      }
    );
  },

  /**
   * Créneaux réservables d'une journée, cadencés selon `slotMinutes` et arrêtés
   * `lastServiceMinutes` avant la fermeture. Remplace le champ heure libre qui
   * acceptait des horaires comme 11h07.
   */
  async getSlots(day: string) {
    const [resolved, settings] = await Promise.all([
      this.resolveDay(day),
      this.getReservationSettings(),
    ]);
    if (!resolved || resolved.isClosed) {
      return { day, isClosed: true, resolved, settings, slots: [] as string[] };
    }
    const slots: string[] = [];
    for (const range of resolved.ranges) {
      const lastStart = range.closesAt - settings.lastServiceMinutes;
      for (
        let minute = range.opensAt;
        minute <= lastStart;
        minute += settings.slotMinutes
      ) {
        slots.push(minutesToTime(minute));
      }
    }
    return { day, isClosed: false, resolved, settings, slots };
  },

  /** Fermetures et horaires exceptionnels à venir. */
  getUpcomingExceptions(fromDay = parisDayKey(new Date())) {
    return db
      .select()
      .from(specialHours)
      .where(gte(specialHours.day, fromDay))
      .orderBy(asc(specialHours.day));
  },
  /** Grille hebdomadaire brute, sans les exceptions. */
  async getWeek(): Promise<ResolvedDay[]> {
    const rows = await db
      .select()
      .from(openingHours)
      .orderBy(asc(openingHours.dayOfWeek), asc(openingHours.sortOrder));
    return buildWeek(rows);
  },

  /** Remplace la grille hebdomadaire en une transaction. */
  replaceWeek(input: WeeklyHoursInput) {
    return db.transaction(async (tx) => {
      await tx.delete(openingHours);
      const rows: (typeof openingHours.$inferInsert)[] = [];
      for (const entry of input) {
        if (entry.isClosed || entry.ranges.length === 0) {
          rows.push({
            closesAt: null,
            dayOfWeek: entry.dayOfWeek,
            isClosed: true,
            label: null,
            opensAt: null,
            sortOrder: 0,
          });
          continue;
        }
        for (const [index, range] of entry.ranges.entries()) {
          rows.push({
            closesAt: range.closesAt,
            dayOfWeek: entry.dayOfWeek,
            isClosed: false,
            label: range.label ?? null,
            opensAt: range.opensAt,
            sortOrder: index,
          });
        }
      }
      if (rows.length > 0) {
        await tx.insert(openingHours).values(rows);
      }
      const refreshed = await tx
        .select()
        .from(openingHours)
        .orderBy(asc(openingHours.dayOfWeek), asc(openingHours.sortOrder));
      return buildWeek(refreshed);
    });
  },

  async resolveDay(day: string) {
    const [resolved] = await this.resolveDays([day]);
    return resolved ?? null;
  },

  /**
   * Résout un ou plusieurs jours civils en croisant la grille hebdomadaire et
   * les exceptions. Une seule requête pour tout un intervalle : le formulaire
   * de réservation en demande plusieurs semaines d'un coup.
   */
  async resolveDays(days: string[]): Promise<ResolvedDay[]> {
    if (days.length === 0) {
      return [];
    }
    const [week, exceptions] = await Promise.all([
      this.getWeek(),
      db.select().from(specialHours).where(inArray(specialHours.day, days)),
    ]);
    const exceptionByDay = new Map(
      exceptions.map((entry) => [entry.day, entry])
    );
    return days.map((day) => {
      const base = week[isoWeekday(day) - 1];
      const resolved: ResolvedDay = base
        ? { ...base, day, ranges: [...base.ranges] }
        : {
            day,
            dayName: weekdayName(isoWeekday(day)),
            exception: null,
            isClosed: true,
            isoDay: isoWeekday(day),
            ranges: [],
          };
      const exception = exceptionByDay.get(day);
      return exception ? applyException(resolved, exception) : resolved;
    });
  },

  async upsertException(input: {
    day: string;
    isClosed: boolean;
    opensAt?: string | null;
    closesAt?: string | null;
    label?: string | null;
  }) {
    const values = {
      closesAt: input.isClosed ? null : (input.closesAt ?? null),
      day: input.day,
      isClosed: input.isClosed,
      label: input.label ?? null,
      opensAt: input.isClosed ? null : (input.opensAt ?? null),
    };
    const [row] = await db
      .insert(specialHours)
      .values(values)
      .onConflictDoUpdate({ set: values, target: specialHours.day })
      .returning();
    return row;
  },
};
