import { describe, expect, test } from "bun:test";
import {
  addDays,
  formatFrenchTime,
  isoWeekday,
  minutesToTime,
  parisDateTimeToUtc,
  parisDayKey,
  timeToMinutes,
} from "@/api/lib/paris-time";
import {
  groupWeekForDisplay,
  initialWeeklyHours,
  type ResolvedDay,
} from "@/api/modules/content/opening-hours.service";

function day(
  isoDay: number,
  ranges: [string, string][],
  dayName = `J${isoDay}`
): ResolvedDay {
  return {
    dayName,
    exception: null,
    isClosed: ranges.length === 0,
    isoDay,
    ranges: ranges.map(([opensAt, closesAt]) => ({
      closesAt: timeToMinutes(closesAt),
      label: null,
      opensAt: timeToMinutes(opensAt),
    })),
  };
}

describe("conversions horaires parisiennes", () => {
  test("convertit une heure locale en UTC en tenant compte de l'heure d'été", () => {
    // Fin juillet : Paris est à UTC+2.
    expect(parisDateTimeToUtc("2026-07-27", "19:30")?.toISOString()).toBe(
      "2026-07-27T17:30:00.000Z"
    );
    // Mi-janvier : Paris est à UTC+1.
    expect(parisDateTimeToUtc("2026-01-15", "19:30")?.toISOString()).toBe(
      "2026-01-15T18:30:00.000Z"
    );
  });

  test("rejette une date malformée au lieu de produire un instant invalide", () => {
    expect(parisDateTimeToUtc("pas-une-date", "19:30")).toBeNull();
    expect(parisDateTimeToUtc("2026-07-27", "midi")).toBeNull();
  });

  test("donne le jour civil parisien, pas le jour UTC", () => {
    // 23h30 UTC un 27 juillet, c'est déjà le 28 à Paris.
    expect(parisDayKey(new Date("2026-07-27T23:30:00Z"))).toBe("2026-07-28");
  });

  test("numérote les jours en ISO, dimanche compris", () => {
    expect(isoWeekday("2026-07-27")).toBe(1); // lundi
    expect(isoWeekday("2026-08-02")).toBe(7); // dimanche
  });

  test("décale un jour civil sans dériver au changement de mois", () => {
    expect(addDays("2026-07-31", 1)).toBe("2026-08-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  test("formate les minutes dans les deux notations attendues", () => {
    expect(minutesToTime(690)).toBe("11:30");
    expect(formatFrenchTime(690)).toBe("11h30");
    expect(timeToMinutes("22:30:00")).toBe(1350);
  });
});

describe("regroupement d'affichage des horaires", () => {
  test("fusionne les jours consécutifs identiques", () => {
    const week = [
      day(1, [["11:00", "22:30"]], "Lundi"),
      day(2, [["11:00", "22:30"]], "Mardi"),
      day(3, [["11:00", "22:30"]], "Mercredi"),
      day(4, [["11:00", "22:30"]], "Jeudi"),
      day(5, [["11:00", "23:00"]], "Vendredi"),
      day(6, [["11:00", "23:00"]], "Samedi"),
      day(7, [["12:00", "22:30"]], "Dimanche"),
    ];
    expect(groupWeekForDisplay(week)).toEqual([
      { day: "Lundi — Jeudi", isoDays: [1, 2, 3, 4], value: "11h00 — 22h30" },
      { day: "Vendredi — Samedi", isoDays: [5, 6], value: "11h00 — 23h00" },
      { day: "Dimanche", isoDays: [7], value: "12h00 — 22h30" },
    ]);
  });

  test("affiche « Fermé » et n'agrège pas par-dessus une coupure", () => {
    const week = [
      day(1, [], "Lundi"),
      day(2, [["11:00", "22:30"]], "Mardi"),
      day(3, [], "Mercredi"),
      day(4, [["11:00", "22:30"]], "Jeudi"),
      day(5, [["11:00", "22:30"]], "Vendredi"),
      day(6, [["11:00", "22:30"]], "Samedi"),
      day(7, [["11:00", "22:30"]], "Dimanche"),
    ];
    const groups = groupWeekForDisplay(week);
    expect(groups[0]).toEqual({
      day: "Lundi",
      isoDays: [1],
      value: "Fermé",
    });
    // Mardi ne doit pas fusionner avec jeudi : mercredi les sépare.
    expect(groups[1]).toEqual({
      day: "Mardi",
      isoDays: [2],
      value: "11h00 — 22h30",
    });
    expect(groups[3]).toEqual({
      day: "Jeudi — Dimanche",
      isoDays: [4, 5, 6, 7],
      value: "11h00 — 22h30",
    });
  });

  test("rend les deux services d'une même journée", () => {
    const groups = groupWeekForDisplay([
      day(
        1,
        [
          ["12:00", "14:30"],
          ["19:00", "22:30"],
        ],
        "Lundi"
      ),
    ]);
    expect(groups[0]?.value).toBe("12h00 — 14h30 · 19h00 — 22h30");
  });
});

describe("grille de départ du seed", () => {
  test("couvre les sept jours, condition de la validation des réservations", () => {
    expect(initialWeeklyHours).toHaveLength(7);
    expect(initialWeeklyHours.map((slot) => slot.dayOfWeek)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(initialWeeklyHours.every((slot) => !slot.isClosed)).toBe(true);
  });
});
