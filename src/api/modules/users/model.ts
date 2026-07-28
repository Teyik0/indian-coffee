import * as v from "valibot";

/**
 * Deux rôles seulement dans le back-office. `customer` est le rôle par défaut
 * d'une inscription sociale : il n'ouvre aucun accès et déclenche l'écran
 * « accès refusé » plutôt qu'une réponse 403 en texte brut.
 */
export const BackOfficeRoleSchema = v.picklist(["admin", "editor"]);

export const UserCreateSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.email("Indiquez une adresse email valide.")
  ),
  name: v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(80)),
  password: v.pipe(
    v.string(),
    v.minLength(12, "Le mot de passe contient au moins 12 caractères."),
    v.maxLength(128)
  ),
  role: BackOfficeRoleSchema,
});

export const UserRoleUpdateSchema = v.object({
  role: BackOfficeRoleSchema,
});

export const UserBanUpdateSchema = v.object({
  banned: v.boolean(),
  reason: v.optional(v.pipe(v.string(), v.maxLength(200))),
});

export const UserParamsSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
});

export type BackOfficeRole = v.InferOutput<typeof BackOfficeRoleSchema>;
export type UserCreateInput = v.InferOutput<typeof UserCreateSchema>;

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
