import * as v from "valibot";
import type { reservations } from "@/db/schema/reservations";
import { UuidSchema, VersionSchema } from "../shared";

const optionalMessage = v.optional(v.pipe(v.string(), v.maxLength(1000)), "");

export const ReservationCreateSchema = v.object({
  fullName: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(2, "Indiquez votre nom."),
    v.maxLength(100),
  ),
  email: v.pipe(
    v.string(),
    v.trim(),
    v.email("Indiquez une adresse email valide."),
  ),
  phone: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(10, "Indiquez un numéro de téléphone."),
    v.maxLength(30),
  ),
  partySize: v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.integer(),
    v.minValue(1),
    v.maxValue(20, "Pour plus de 20 personnes, contactez-nous par téléphone."),
  ),
  requestedDate: v.pipe(v.string(), v.isoDate("Choisissez une date valide.")),
  requestedTime: v.pipe(
    v.string(),
    v.regex(/^\d{2}:\d{2}$/, "Choisissez un horaire valide."),
  ),
  occasion: v.optional(v.pipe(v.string(), v.maxLength(80)), ""),
  message: optionalMessage,
  consent: v.pipe(
    v.boolean(),
    v.check(
      (value) => value,
      "Votre accord est nécessaire pour traiter la demande.",
    ),
  ),
  website: v.optional(v.string(), ""),
});

export const ReservationStatusSchema = v.picklist([
  "CONFIRMED",
  "DECLINED",
  "CANCELLED",
]);

export const ReservationStatusUpdateSchema = v.object({
  status: ReservationStatusSchema,
  adminNote: optionalMessage,
  version: VersionSchema,
});

export const ReservationParamsSchema = v.object({ id: UuidSchema });

export type ReservationCreateInput = v.InferOutput<
  typeof ReservationCreateSchema
>;
export type ReservationStatusUpdate = v.InferOutput<
  typeof ReservationStatusUpdateSchema
>;
export type ReservationPublicResult = {
  reservation: { id: string; reference: string; status: "PENDING" };
  message: string;
};
export type ReservationAdminView = typeof reservations.$inferSelect;
