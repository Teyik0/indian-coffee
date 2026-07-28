import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, eq, sql } from "@/api/lib/db";
import { addDays, parisDayKey } from "@/api/lib/paris-time";
import { openingHoursService } from "@/api/modules/content/opening-hours.service";
import { reservationService } from "@/api/modules/reservations/service";
import { openingHours, specialHours } from "@/db/schema/content";
import { reservations } from "@/db/schema/reservations";

/**
 * Ces règles étaient auparavant codées en dur dans le service : modifier les
 * horaires au back-office n'avait aucun effet, et une fermeture exceptionnelle
 * était purement ignorée. Le test s'exerce contre la base réelle et restaure
 * l'état initial à la fin.
 */

let savedHours: (typeof openingHours.$inferSelect)[] = [];
const createdReferences: string[] = [];

/** Prochaine occurrence d'un jour ISO, au moins deux jours dans le futur. */
function nextIsoWeekday(isoDay: number) {
  let candidate = addDays(parisDayKey(new Date()), 2);
  for (let index = 0; index < 8; index += 1) {
    const weekday = new Date(`${candidate}T12:00:00Z`).getUTCDay();
    if ((weekday === 0 ? 7 : weekday) === isoDay) {
      return candidate;
    }
    candidate = addDays(candidate, 1);
  }
  throw new Error("Jour introuvable.");
}

function payload(day: string, time: string) {
  return {
    consent: true as const,
    email: "horaires@indiancoffee.test",
    fullName: "Test Horaires",
    message: "",
    occasion: "",
    partySize: 2,
    phone: "0160635497",
    requestedDate: day,
    requestedTime: time,
    website: "",
  };
}

async function attempt(day: string, time: string) {
  try {
    const result = await reservationService.create(payload(day, time), {
      idempotencyKey: crypto.randomUUID(),
      // Une IP distincte par tentative : la limitation de débit plafonne à
      // cinq demandes par heure et par couple IP/email.
      ip: `203.0.113.${Math.floor(Math.random() * 250) + 1}`,
    });
    createdReferences.push(result.reservation.reference);
    return { ok: true as const, result };
  } catch (error) {
    return {
      code: (error as { code?: string }).code ?? "UNKNOWN",
      message: (error as Error).message,
      ok: false as const,
    };
  }
}

beforeAll(async () => {
  savedHours = await db.select().from(openingHours);
});

afterAll(async () => {
  await db.delete(openingHours);
  if (savedHours.length > 0) {
    await db.insert(openingHours).values(
      savedHours.map((row) => ({
        closesAt: row.closesAt,
        dayOfWeek: row.dayOfWeek,
        isClosed: row.isClosed,
        label: row.label,
        opensAt: row.opensAt,
        sortOrder: row.sortOrder,
      }))
    );
  }
  await db.delete(specialHours).where(sql`${specialHours.label} like 'TEST-%'`);
  await Promise.all(
    createdReferences.map((reference) =>
      db.delete(reservations).where(eq(reservations.reference, reference))
    )
  );
});

describe("validation des réservations contre les horaires enregistrés", () => {
  test("refuse une demande un jour marqué fermé dans la grille", async () => {
    const closedIsoDay: number = 3;
    const week = await openingHoursService.getWeek();
    await openingHoursService.replaceWeek(
      week.map((day) => ({
        dayOfWeek: day.isoDay,
        isClosed: day.isoDay === closedIsoDay,
        ranges:
          day.isoDay === closedIsoDay
            ? []
            : [{ closesAt: "22:30", opensAt: "11:00" }],
      }))
    );

    const closedDay = nextIsoWeekday(closedIsoDay);
    const refused = await attempt(closedDay, "19:30");
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.code).toBe("OUTSIDE_OPENING_HOURS");
    }

    // Un jour ouvert de la même grille reste acceptable : c'est bien la
    // fermeture qui bloque, pas la validation entière.
    const openDay = nextIsoWeekday(closedIsoDay === 7 ? 1 : closedIsoDay + 1);
    const accepted = await attempt(openDay, "19:30");
    expect(accepted.ok).toBe(true);
  });

  test("suit les horaires de la grille plutôt que des valeurs codées en dur", async () => {
    const week = await openingHoursService.getWeek();
    // Service uniquement le soir : 12h00 doit désormais être refusé, alors que
    // l'ancienne implémentation l'acceptait quoi qu'il arrive.
    await openingHoursService.replaceWeek(
      week.map((weekday) => ({
        dayOfWeek: weekday.isoDay,
        isClosed: false,
        ranges: [{ closesAt: "22:30", opensAt: "19:00" }],
      }))
    );

    const day = addDays(parisDayKey(new Date()), 3);
    const tooEarly = await attempt(day, "12:00");
    expect(tooEarly.ok).toBe(false);
    if (!tooEarly.ok) {
      expect(tooEarly.code).toBe("OUTSIDE_OPENING_HOURS");
    }

    const inService = await attempt(day, "19:30");
    expect(inService.ok).toBe(true);
  });

  test("refuse une demande couverte par une fermeture exceptionnelle", async () => {
    const week = await openingHoursService.getWeek();
    await openingHoursService.replaceWeek(
      week.map((weekday) => ({
        dayOfWeek: weekday.isoDay,
        isClosed: false,
        ranges: [{ closesAt: "22:30", opensAt: "11:00" }],
      }))
    );

    const day = addDays(parisDayKey(new Date()), 5);
    await openingHoursService.upsertException({
      day,
      isClosed: true,
      label: "TEST-congés",
    });

    const refused = await attempt(day, "19:30");
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.code).toBe("OUTSIDE_OPENING_HOURS");
      // Le motif saisi au back-office remonte jusqu'au client.
      expect(refused.message).toContain("TEST-congés");
    }
  });

  test("n'expose que des créneaux alignés sur la cadence configurée", async () => {
    const week = await openingHoursService.getWeek();
    await openingHoursService.replaceWeek(
      week.map((weekday) => ({
        dayOfWeek: weekday.isoDay,
        isClosed: false,
        ranges: [{ closesAt: "22:30", opensAt: "11:00" }],
      }))
    );

    const day = addDays(parisDayKey(new Date()), 4);
    const availability = await reservationService.getAvailability(day);
    expect(availability.isClosed).toBe(false);
    expect(availability.slots.length).toBeGreaterThan(0);
    // Un horaire arbitraire comme 11h07 n'existe pas dans la liste.
    expect(availability.slots.some((slot) => slot.time === "11:07")).toBe(
      false
    );
    expect(availability.slots[0]?.time).toBe("11:00");

    const offGrid = await attempt(day, "11:07");
    expect(offGrid.ok).toBe(false);
    if (!offGrid.ok) {
      expect(offGrid.code).toBe("OUTSIDE_OPENING_HOURS");
    }
  });

  test("respecte les deux services et leur coupure pour la journée choisie", async () => {
    const week = await openingHoursService.getWeek();
    await openingHoursService.replaceWeek(
      week.map((weekday) => ({
        dayOfWeek: weekday.isoDay,
        isClosed: false,
        ranges: [
          { closesAt: "14:30", label: "Déjeuner", opensAt: "12:00" },
          { closesAt: "22:30", label: "Dîner", opensAt: "19:00" },
        ],
      }))
    );

    const day = addDays(parisDayKey(new Date()), 4);
    const availability = await reservationService.getAvailability(day);
    const times = availability.slots.map((slot) => slot.time);

    expect(availability.services).toEqual([
      { closesAt: "14:30", label: "Déjeuner", opensAt: "12:00" },
      { closesAt: "22:30", label: "Dîner", opensAt: "19:00" },
    ]);
    expect(times).toContain("12:00");
    expect(times).toContain("19:00");
    expect(times).not.toContain("16:00");
    expect(
      times.every(
        (time) =>
          (time >= "12:00" && time < "14:30") ||
          (time >= "19:00" && time < "22:30")
      )
    ).toBe(true);

    const duringBreak = await attempt(day, "16:00");
    expect(duringBreak.ok).toBe(false);
    if (!duringBreak.ok) {
      expect(duringBreak.code).toBe("OUTSIDE_OPENING_HOURS");
    }
  });
});
