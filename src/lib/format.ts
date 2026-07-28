/**
 * Formatage partagé par les deux applications. Chaque écran construisait son
 * propre `Intl.DateTimeFormat`, avec des fuseaux et des styles divergents.
 */

const PARIS = "Europe/Paris";

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "2-digit",
  timeZone: PARIS,
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  timeZone: PARIS,
});

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  timeZone: PARIS,
  weekday: "short",
});

const longDayFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: PARIS,
  weekday: "long",
  year: "numeric",
});

function parts(value: Date | string) {
  return Object.fromEntries(
    dateTimeFormatter
      .formatToParts(new Date(value))
      .map((part) => [part.type, part.value])
  );
}

export function formatDateTime(value: Date | string) {
  const p = parts(value);
  return `${p.day}/${p.month}/${p.year} · ${p.hour}:${p.minute}`;
}

export function formatTime(value: Date | string) {
  return timeFormatter.format(new Date(value)).replace(":", "h");
}

export function formatDay(value: Date | string) {
  return dayFormatter.format(new Date(value));
}

export function formatLongDay(value: Date | string) {
  return longDayFormatter.format(new Date(value));
}

/**
 * Ramène une valeur de jour civil à `YYYY-MM-DD`. La même donnée n'a pas la
 * même forme selon le chemin emprunté : chaîne brute via HTTP, instant étendu
 * ou véritable `Date` via l'appel direct d'Eden côté serveur. Toute comparaison
 * de jours et toute borne de champ `date` doit passer par ici.
 *
 * Une `Date` issue de ce type de valeur porte minuit UTC du jour civil : la
 * découpe de son ISO donne donc bien le bon jour.
 */
export function toIsoDay(value: string | Date) {
  return (value instanceof Date ? value.toISOString() : String(value)).slice(
    0,
    10
  );
}

/**
 * Formate un jour civil. La valeur peut arriver sous deux formes : `2026-07-27`
 * tel qu'écrit en base, ou `2026-07-27T00:00:00.000Z` après passage par la
 * sérialisation de l'API. On ne garde que la partie date, sans quoi la
 * concaténation produit un instant invalide et `Intl` lève une `RangeError`.
 */
export function formatIsoDay(day: string | Date) {
  return longDayFormatter.format(new Date(`${toIsoDay(day)}T12:00:00Z`));
}

const relativeFormatter = new Intl.RelativeTimeFormat("fr-FR", {
  numeric: "auto",
});

/** « il y a 3 heures » : lisible dans un journal d'activité. */
export function formatRelative(value: Date | string, now = new Date()) {
  const diffMs = new Date(value).getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, "hour");
  }
  return relativeFormatter.format(Math.round(diffHours / 24), "day");
}

/** Centimes → `"12,50 €"`, en évitant un import serveur côté client. */
const priceFormatter = new Intl.NumberFormat("fr-FR", {
  currency: "EUR",
  style: "currency",
});

export function formatPriceCents(priceCents: number) {
  return priceFormatter.format(priceCents / 100);
}

/** Fourchette de prix d'un plat à variantes multiples. */
export function formatPriceRange(prices: number[]) {
  if (prices.length === 0) {
    return "—";
  }
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? formatPriceCents(min)
    : `${formatPriceCents(min)} – ${formatPriceCents(max)}`;
}

export const RESERVATION_STATUS_LABELS = {
  CANCELLED: "Annulée",
  CONFIRMED: "Confirmée",
  DECLINED: "Refusée",
  PENDING: "À confirmer",
} as const;

export const MENU_STATUS_LABELS = {
  AVAILABLE: "Disponible",
  HIDDEN: "Masqué",
  UNAVAILABLE: "Indisponible",
} as const;

export const SPICE_LABELS = {
  HOT: "Épicé",
  MEDIUM: "Relevé",
  MILD: "Doux",
} as const;
