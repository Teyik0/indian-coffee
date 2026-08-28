import * as Schema from "effect4/Schema";
import * as SchemaGetter from "effect4/SchemaGetter";
import {
  boundedNumberInput,
  boundedString,
  defaulted,
  IsoDate,
  mutableArray,
  standard,
} from "@/api/effect/schema";
import type { reservationEvents, reservations } from "@/db/schema/reservations";
import { UuidSchema, VersionSchema } from "../shared";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const optionalMessage = defaulted(boundedString(0, 1000), "");

export const ReservationCreateEffectSchema = Schema.Struct({
  consent: Schema.Boolean.check(
    Schema.makeFilter((value) => value, {
      message: "Votre accord est nécessaire pour traiter la demande.",
    })
  ),
  email: Schema.Trim.check(
    Schema.makeFilter((value) => EMAIL_PATTERN.test(value), {
      message: "Indiquez une adresse email valide.",
    })
  ),
  fullName: boundedString(2, 100, {
    minimumMessage: "Indiquez votre nom.",
    trim: true,
  }),
  message: optionalMessage,
  occasion: defaulted(boundedString(0, 80), ""),
  partySize: boundedNumberInput(
    1,
    // Le plafond métier réel vit en base (`site_settings.max_party_size`) et est
    // appliqué par le service ; cette borne ne protège que la requête.
    100
  ),
  phone: boundedString(10, 30, {
    minimumMessage: "Indiquez un numéro de téléphone.",
    trim: true,
  }),
  requestedDate: IsoDate,
  requestedTime: Schema.String.check(
    Schema.isPattern(/^\d{2}:\d{2}$/, {
      message: "Choisissez un horaire valide.",
    })
  ),
  website: defaulted(Schema.String, ""),
});
export const ReservationCreateSchema = standard(ReservationCreateEffectSchema);

export const ReservationStatusEffectSchema = Schema.Literals([
  "PENDING",
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
]);
export const ReservationStatusSchema = standard(ReservationStatusEffectSchema);

export const ReservationStatusUpdateEffectSchema = Schema.Struct({
  // Optionnelle : ne pas transmettre de note laisse la note existante intacte.
  adminNote: Schema.optional(boundedString(0, 1000)),
  status: Schema.Literals(["CONFIRMED", "DECLINED", "CANCELLED"]),
  version: VersionSchema,
});
export const ReservationStatusUpdateSchema = standard(
  ReservationStatusUpdateEffectSchema
);

export const ReservationParamsEffectSchema = Schema.Struct({ id: UuidSchema });
export const ReservationParamsSchema = standard(ReservationParamsEffectSchema);

/**
 * Les paramètres de requête arrivent en chaînes par HTTP mais en valeurs
 * natives lorsque le serveur appelle l'API directement via Eden. Les schémas
 * acceptent donc les deux formes et normalisent vers un type de sortie unique.
 */
const NumericQuerySchema = boundedNumberInput(1, Number.MAX_SAFE_INTEGER);

const StatusQuerySchema = Schema.Union([
  Schema.String,
  mutableArray(Schema.String),
]).pipe(
  Schema.decodeTo(mutableArray(ReservationStatusEffectSchema), {
    decode: SchemaGetter.transform(
      (value) =>
        (Array.isArray(value) ? value : value.split(",")).filter(
          Boolean
        ) as (typeof ReservationStatusEffectSchema.Type)[]
    ),
    encode: SchemaGetter.transform((value) => value),
  })
);

export const ReservationListQueryEffectSchema = Schema.Struct({
  from: Schema.optional(IsoDate),
  order: defaulted(Schema.Literals(["asc", "desc"]), "desc"),
  page: defaulted(NumericQuerySchema, 1),
  pageSize: defaulted(NumericQuerySchema, 25),
  search: Schema.optional(boundedString(0, 120)),
  status: Schema.optional(StatusQuerySchema),
  to: Schema.optional(IsoDate),
});
export const ReservationListQuerySchema = standard(
  ReservationListQueryEffectSchema
);

export const AvailabilityQueryEffectSchema = Schema.Struct({
  date: IsoDate,
});
export const AvailabilityQuerySchema = standard(AvailabilityQueryEffectSchema);

export const CalendarQueryEffectSchema = Schema.Struct({
  days: defaulted(NumericQuerySchema, 60),
  from: Schema.optional(IsoDate),
});
export const CalendarQuerySchema = standard(CalendarQueryEffectSchema);

export type ReservationCreateInput = typeof ReservationCreateEffectSchema.Type;
export type ReservationStatus = typeof ReservationStatusEffectSchema.Type;
export type ReservationStatusUpdate =
  typeof ReservationStatusUpdateEffectSchema.Type;
export type ReservationListQuery = Partial<
  typeof ReservationListQueryEffectSchema.Type
>;
export interface ReservationPublicResult {
  message: string;
  reservation: { id: string; reference: string; status: "PENDING" };
}
export type ReservationAdminView = typeof reservations.$inferSelect;
export type ReservationEventView = typeof reservationEvents.$inferSelect;

export interface ReservationSlot {
  isAvailable: boolean;
  remaining: number;
  time: string;
}

export interface ReservationServiceRange {
  closesAt: string;
  label: string | null;
  opensAt: string;
}

export interface ReservationAvailability {
  day: string;
  exception: { label: string | null } | null;
  isClosed: boolean;
  maxPartySize: number;
  reason: "OUT_OF_RANGE" | "CLOSED" | null;
  services: ReservationServiceRange[];
  slots: ReservationSlot[];
}
