import * as Schema from "effect4/Schema";
import {
  boundedInt,
  boundedString,
  Email,
  IsoDate,
  mutableArray,
  standard,
  UrlString,
} from "@/api/effect/schema";
import { UuidSchema, VersionSchema } from "../shared";
import type { ResolvedDay } from "./opening-hours.service";

const OptionalUrlSchema = Schema.optional(
  Schema.Union([UrlString, Schema.Literal("")])
);

const TimeSchema = Schema.String.check(
  Schema.isPattern(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: "Utilisez le format HH:MM.",
  })
);

export const SiteSettingsEffectSchema = Schema.Struct({
  addressLine: boundedString(5, 160),
  city: boundedString(2, 80),
  email: Email,
  facebookUrl: OptionalUrlSchema,
  instagramUrl: OptionalUrlSchema,
  mapUrl: UrlString,
  phone: boundedString(10, 30),
  postalCode: Schema.String.check(Schema.isPattern(/^\d{5}$/)),
  reservationNotice: boundedString(10, 300),
  restaurantName: boundedString(2, 80),
  tagline: boundedString(10, 180),
  version: VersionSchema,
});
export const SiteSettingsSchema = standard(SiteSettingsEffectSchema);

/** Bloc éditorial de l'accueil : jusqu'ici en base mais absent du back-office. */
export const HomeContentEffectSchema = Schema.Struct({
  eyebrow: boundedString(3, 80),
  heroIntro: boundedString(20, 400),
  heroMediaId: Schema.optional(Schema.Union([UuidSchema, Schema.Literal("")])),
  heroTitle: boundedString(5, 120),
  storyBody: boundedString(20, 1200),
  storyMediaId: Schema.optional(Schema.Union([UuidSchema, Schema.Literal("")])),
  storyTitle: boundedString(5, 120),
  version: VersionSchema,
});
export const HomeContentSchema = standard(HomeContentEffectSchema);

/** Réglages qui gouvernent la validation des réservations. */
export const ReservationSettingsEffectSchema = Schema.Struct({
  bookingHorizonDays: boundedInt(1, 365),
  lastServiceMinutes: boundedInt(0, 180),
  leadTimeMinutes: boundedInt(0, 2880),
  maxCoversPerSlot: boundedInt(1, 500),
  maxPartySize: boundedInt(1, 100),
  slotMinutes: boundedInt(5, 120),
});
export const ReservationSettingsSchema = standard(
  ReservationSettingsEffectSchema
);

const HoursRangeSchema = Schema.Struct({
  closesAt: TimeSchema,
  label: Schema.optional(Schema.NullOr(Schema.String)),
  opensAt: TimeSchema,
}).check(
  Schema.makeFilter((range) => range.opensAt < range.closesAt, {
    message: "L’heure de fermeture doit suivre l’heure d’ouverture.",
  })
);

const WeeklyDaySchema = Schema.Struct({
  dayOfWeek: boundedInt(1, 7),
  isClosed: Schema.Boolean,
  ranges: mutableArray(HoursRangeSchema).check(
    Schema.isMaxLength(3, {
      message: "Trois services par jour au maximum.",
    })
  ),
});

export const WeeklyHoursEffectSchema = Schema.Struct({
  days: mutableArray(WeeklyDaySchema).check(
    Schema.makeFilter((days) => days.length === 7, {
      message: "La grille doit couvrir les sept jours.",
    })
  ),
});
export const WeeklyHoursSchema = standard(WeeklyHoursEffectSchema);

export const SpecialHoursEffectSchema = Schema.Struct({
  closesAt: Schema.optional(Schema.Union([TimeSchema, Schema.Literal("")])),
  day: IsoDate,
  isClosed: Schema.Boolean,
  label: Schema.optional(boundedString(0, 120)),
  opensAt: Schema.optional(Schema.Union([TimeSchema, Schema.Literal("")])),
}).check(
  Schema.makeFilter(
    (input) => input.isClosed || Boolean(input.opensAt && input.closesAt),
    {
      message: "Renseignez les horaires exceptionnels ou cochez « fermé ».",
    }
  )
);
export const SpecialHoursSchema = standard(SpecialHoursEffectSchema);

export const SpecialHoursParamsEffectSchema = Schema.Struct({
  id: UuidSchema,
});
export const SpecialHoursParamsSchema = standard(
  SpecialHoursParamsEffectSchema
);

export type SiteSettingsInput = typeof SiteSettingsEffectSchema.Type;
export type HomeContentInput = typeof HomeContentEffectSchema.Type;
export type ReservationSettingsInput =
  typeof ReservationSettingsEffectSchema.Type;
export type WeeklyHoursFormInput = typeof WeeklyHoursEffectSchema.Type;
export type SpecialHoursInput = typeof SpecialHoursEffectSchema.Type;

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
