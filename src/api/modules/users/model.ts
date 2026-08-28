import * as Schema from "effect4/Schema";
import { boundedString, standard } from "@/api/effect/schema";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Deux rôles seulement dans le back-office. `customer` est le rôle par défaut
 * d'une inscription sociale : il n'ouvre aucun accès et déclenche l'écran
 * « accès refusé » plutôt qu'une réponse 403 en texte brut.
 */
export const BackOfficeRoleEffectSchema = Schema.Literals(["admin", "editor"]);
export const BackOfficeRoleSchema = standard(BackOfficeRoleEffectSchema);

export const UserCreateEffectSchema = Schema.Struct({
  email: Schema.Trim.pipe(
    Schema.check(
      Schema.makeFilter((value) => EMAIL_PATTERN.test(value), {
        message: "Indiquez une adresse email valide.",
      })
    )
  ),
  name: boundedString(2, 80, { trim: true }),
  password: boundedString(12, 128, {
    minimumMessage: "Le mot de passe contient au moins 12 caractères.",
  }),
  role: BackOfficeRoleEffectSchema,
});
export const UserCreateSchema = standard(UserCreateEffectSchema);

export const UserRoleUpdateEffectSchema = Schema.Struct({
  role: BackOfficeRoleEffectSchema,
});
export const UserRoleUpdateSchema = standard(UserRoleUpdateEffectSchema);

export const UserBanUpdateEffectSchema = Schema.Struct({
  banned: Schema.Boolean,
  reason: Schema.optional(boundedString(0, 200)),
});
export const UserBanUpdateSchema = standard(UserBanUpdateEffectSchema);

export const UserParamsEffectSchema = Schema.Struct({
  id: Schema.String.check(Schema.isMinLength(1)),
});
export const UserParamsSchema = standard(UserParamsEffectSchema);

export type BackOfficeRole = typeof BackOfficeRoleEffectSchema.Type;
export type UserCreateInput = typeof UserCreateEffectSchema.Type;

export interface BackOfficeUser {
  banned: boolean;
  banReason: string | null;
  createdAt: Date;
  email: string;
  emailVerified: boolean;
  id: string;
  lastSessionAt: Date | null;
  name: string;
  role: string;
}
