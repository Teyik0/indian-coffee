/**
 * Le restaurant vit à Paris ; la base et le serveur vivent en UTC. Toutes les
 * conversions passent par ce module afin que la validation des réservations, le
 * badge « ouvert maintenant », le JSON-LD et le back-office partagent
 * exactement la même notion de « jour » et d'« heure ».
 */

export const PARIS_TIME_ZONE = "Europe/Paris";

const parisFormatter = new Intl.DateTimeFormat("fr-CA", {
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "2-digit",
  timeZone: PARIS_TIME_ZONE,
  year: "numeric",
});

interface ParisParts {
  day: number;
  hour: number;
  minute: number;
  month: number;
  year: number;
}

export function parisParts(date: Date): ParisParts {
  const parts = Object.fromEntries(
    parisFormatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  return {
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    month: Number(parts.month),
    year: Number(parts.year),
  };
}

/** Jour civil parisien au format `YYYY-MM-DD`. */
export function parisDayKey(date: Date) {
  const { year, month, day } = parisParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Minutes écoulées depuis minuit, heure de Paris. */
export function parisMinutesOfDay(date: Date) {
  const { hour, minute } = parisParts(date);
  return hour * 60 + minute;
}

/**
 * Convertit une date et une heure locales parisiennes en instant UTC. La
 * double itération absorbe les bascules d'heure d'été : le premier passage
 * corrige le décalage, le second valide la correction.
 */
export function parisDateTimeToUtc(day: string, time: string) {
  const [year, month, date] = day.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if ([year, month, date, hour, minute].some((value) => Number.isNaN(value))) {
    return null;
  }

  const desired = Date.UTC(
    year ?? 0,
    (month ?? 1) - 1,
    date ?? 1,
    hour ?? 0,
    minute ?? 0
  );
  let candidate = desired;
  for (let iteration = 0; iteration < 2; iteration += 1) {
    const parts = parisParts(new Date(candidate));
    const represented = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute
    );
    candidate += desired - represented;
  }
  return new Date(candidate);
}

/** Jour de la semaine ISO (1 = lundi … 7 = dimanche) d'un jour `YYYY-MM-DD`. */
export function isoWeekday(day: string) {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

/** Décale un jour `YYYY-MM-DD` d'un nombre de jours civils. */
export function addDays(day: string, amount: number) {
  const base = new Date(`${day}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + amount);
  return base.toISOString().slice(0, 10);
}

/** `"11:00:00"` ou `"11:00"` → 660. */
export function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return (hour ?? 0) * 60 + (minute ?? 0);
}

/** 660 → `"11:00"`. */
export function minutesToTime(value: number) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** 660 → `"11h00"`, la notation attendue par le public francophone. */
export function formatFrenchTime(value: number) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}h${String(minute).padStart(2, "0")}`;
}

export const WEEKDAY_NAMES = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

export function weekdayName(isoDay: number) {
  return WEEKDAY_NAMES[isoDay - 1] ?? String(isoDay);
}
