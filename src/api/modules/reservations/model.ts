import * as v from "valibot";
import type { reservationEvents, reservations } from "@/db/schema/reservations";
import { UuidSchema, VersionSchema } from "../shared";

const optionalMessage = v.optional(v.pipe(v.string(), v.maxLength(1000)), "");

export const ReservationCreateSchema = v.object({
  consent: v.pipe(
    v.boolean(),
    v.check(
      (value) => value,
      "Votre accord est nécessaire pour traiter la demande."
    )
  ),
  email: v.pipe(
    v.string(),
    v.trim(),
    v.email("Indiquez une adresse email valide.")
  ),
  fullName: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(2, "Indiquez votre nom."),
    v.maxLength(100)
  ),
  message: optionalMessage,
  occasion: v.optional(v.pipe(v.string(), v.maxLength(80)), ""),
  partySize: v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.integer(),
    v.minValue(1),
    // Le plafond métier réel vit en base (`site_settings.max_party_size`) et est
    // appliqué par le service ; cette borne ne protège que la requête.
    v.maxValue(100)
  ),
  phone: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(10, "Indiquez un numéro de téléphone."),
    v.maxLength(30)
  ),
  requestedDate: v.pipe(v.string(), v.isoDate("Choisissez une date valide.")),
  requestedTime: v.pipe(
    v.string(),
    v.regex(/^\d{2}:\d{2}$/, "Choisissez un horaire valide.")
  ),
  website: v.optional(v.string(), ""),
});

export const ReservationStatusSchema = v.picklist([
  "PENDING",
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
]);

export const ReservationStatusUpdateSchema = v.object({
  // Optionnelle : ne pas transmettre de note laisse la note existante intacte.
  adminNote: v.optional(v.pipe(v.string(), v.maxLength(1000))),
  status: v.picklist(["CONFIRMED", "DECLINED", "CANCELLED"]),
  version: VersionSchema,
});

export const ReservationParamsSchema = v.object({ id: UuidSchema });

/**
 * Les paramètres de requête arrivent en chaînes par HTTP mais en valeurs
 * natives lorsque le serveur appelle l'API directement via Eden. Les schémas
 * acceptent donc les deux formes et normalisent vers un type de sortie unique.
 */
const NumericQuerySchema = v.pipe(
  v.union([v.string(), v.number()]),
  v.transform(Number),
  v.integer(),
  v.minValue(1)
);

export const ReservationListQuerySchema = v.object({
  from: v.optional(v.pipe(v.string(), v.isoDate())),
  order: v.optional(v.picklist(["asc", "desc"]), "desc"),
  page: v.optional(NumericQuerySchema, 1),
  pageSize: v.optional(NumericQuerySchema, 25),
  search: v.optional(v.pipe(v.string(), v.maxLength(120))),
  status: v.optional(
    v.pipe(
      v.union([v.string(), v.array(v.string())]),
      v.transform((value) =>
        (Array.isArray(value) ? value : value.split(",")).filter(Boolean)
      ),
      v.array(ReservationStatusSchema)
    )
  ),
  to: v.optional(v.pipe(v.string(), v.isoDate())),
});

export const AvailabilityQuerySchema = v.object({
  date: v.pipe(v.string(), v.isoDate("Choisissez une date valide.")),
});

export const CalendarQuerySchema = v.object({
  days: v.optional(NumericQuerySchema, 60),
  from: v.optional(v.pipe(v.string(), v.isoDate())),
});

export type ReservationCreateInput = v.InferOutput<
  typeof ReservationCreateSchema
>;
export type ReservationStatus = v.InferOutput<typeof ReservationStatusSchema>;
export type ReservationStatusUpdate = v.InferOutput<
  typeof ReservationStatusUpdateSchema
>;
export type ReservationListQuery = Partial<
  v.InferOutput<typeof ReservationListQuerySchema>
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
