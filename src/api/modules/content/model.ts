import * as v from "valibot";
import { UuidSchema, VersionSchema } from "../shared";
import type { ResolvedDay } from "./opening-hours.service";

const OptionalUrlSchema = v.optional(
  v.union([
    v.pipe(v.string(), v.url("Indiquez une URL valide.")),
    v.literal(""),
  ])
);

const TimeSchema = v.pipe(
  v.string(),
  v.regex(/^\d{2}:\d{2}(:\d{2})?$/, "Utilisez le format HH:MM.")
);

export const SiteSettingsSchema = v.object({
  addressLine: v.pipe(v.string(), v.minLength(5), v.maxLength(160)),
  city: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
  email: v.pipe(v.string(), v.email()),
  facebookUrl: OptionalUrlSchema,
  instagramUrl: OptionalUrlSchema,
  mapUrl: v.pipe(v.string(), v.url()),
  phone: v.pipe(v.string(), v.minLength(10), v.maxLength(30)),
  postalCode: v.pipe(v.string(), v.regex(/^\d{5}$/)),
  reservationNotice: v.pipe(v.string(), v.minLength(10), v.maxLength(300)),
  restaurantName: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
  tagline: v.pipe(v.string(), v.minLength(10), v.maxLength(180)),
  version: VersionSchema,
});

/** Bloc éditorial de l'accueil : jusqu'ici en base mais absent du back-office. */
export const HomeContentSchema = v.object({
  eyebrow: v.pipe(v.string(), v.minLength(3), v.maxLength(80)),
  heroIntro: v.pipe(v.string(), v.minLength(20), v.maxLength(400)),
  heroMediaId: v.optional(v.union([UuidSchema, v.literal("")])),
  heroTitle: v.pipe(v.string(), v.minLength(5), v.maxLength(120)),
  storyBody: v.pipe(v.string(), v.minLength(20), v.maxLength(1200)),
  storyMediaId: v.optional(v.union([UuidSchema, v.literal("")])),
  storyTitle: v.pipe(v.string(), v.minLength(5), v.maxLength(120)),
  version: VersionSchema,
});

/** Réglages qui gouvernent la validation des réservations. */
export const ReservationSettingsSchema = v.object({
  bookingHorizonDays: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(1),
    v.maxValue(365)
  ),
  lastServiceMinutes: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0),
    v.maxValue(180)
  ),
  leadTimeMinutes: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(0),
    v.maxValue(2880)
  ),
  maxCoversPerSlot: v.pipe(
    v.number(),
    v.integer(),
    v.minValue(1),
    v.maxValue(500)
  ),
  maxPartySize: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
  slotMinutes: v.pipe(v.number(), v.integer(), v.minValue(5), v.maxValue(120)),
});

export const WeeklyHoursSchema = v.object({
  days: v.pipe(
    v.array(
      v.object({
        dayOfWeek: v.pipe(
          v.number(),
          v.integer(),
          v.minValue(1),
          v.maxValue(7)
        ),
        isClosed: v.boolean(),
        ranges: v.pipe(
          v.array(
            v.pipe(
              v.object({
                closesAt: TimeSchema,
                label: v.optional(v.union([v.string(), v.null()])),
                opensAt: TimeSchema,
              }),
              v.check(
                (range) => range.opensAt < range.closesAt,
                "L’heure de fermeture doit suivre l’heure d’ouverture."
              )
            )
          ),
          v.maxLength(3, "Trois services par jour au maximum.")
        ),
      })
    ),
    v.length(7, "La grille doit couvrir les sept jours.")
  ),
});

export const SpecialHoursSchema = v.pipe(
  v.object({
    closesAt: v.optional(v.union([TimeSchema, v.literal("")])),
    day: v.pipe(v.string(), v.isoDate("Choisissez une date valide.")),
    isClosed: v.boolean(),
    label: v.optional(v.pipe(v.string(), v.maxLength(120))),
    opensAt: v.optional(v.union([TimeSchema, v.literal("")])),
  }),
  v.check(
    (input) => input.isClosed || Boolean(input.opensAt && input.closesAt),
    "Renseignez les horaires exceptionnels ou cochez « fermé »."
  )
);

export const SpecialHoursParamsSchema = v.object({ id: UuidSchema });

export type SiteSettingsInput = v.InferOutput<typeof SiteSettingsSchema>;
export type HomeContentInput = v.InferOutput<typeof HomeContentSchema>;
export type ReservationSettingsInput = v.InferOutput<
  typeof ReservationSettingsSchema
>;
export type WeeklyHoursFormInput = v.InferOutput<typeof WeeklyHoursSchema>;
export type SpecialHoursInput = v.InferOutput<typeof SpecialHoursSchema>;

export interface OpenState {
  closesAt: string | null;
  exception: { label: string | null } | null;
  isOpen: boolean;
  nextOpensAt: string | null;
  nextOpensDay: string | null;
}

export type SiteContent = SiteSettingsInput & {
  id: string;
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  story: {
    title: string;
    body: string;
  };
  /** Version propre à `home_content`, requise par le verrou optimiste. */
  homeVersion: number;
  /** Journées consécutives identiques regroupées pour l'affichage public. */
  hours: Array<{ day: string; value: string; isoDays: number[] }>;
  /** Grille brute des sept jours, pour l'édition et le JSON-LD. */
  week: ResolvedDay[];
  openState: OpenState;
  todayIsoDay: number;
};
