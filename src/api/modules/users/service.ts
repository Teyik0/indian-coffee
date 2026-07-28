import { asc, count, db, desc, eq, sql } from "@/api/lib/db";
import { auth } from "@/api/plugins/better-auth.plugin";
import { session, user } from "@/db/schema/auth";
import { DomainError } from "../shared";
import type { BackOfficeRole, BackOfficeUser, UserCreateInput } from "./model";

const BACK_OFFICE_ROLES = ["admin", "editor"] as const;

export const userService = {
  /** Empêche de se retrouver sans aucun administrateur actif. */
  async assertNotLastAdmin(id: string, willRemainAdmin: boolean) {
    if (willRemainAdmin) {
      return;
    }
    const [target] = await db
      .select({ banned: user.banned, role: user.role })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);
    if (target?.role !== "admin" || target.banned) {
      return;
    }

    const [row] = await db
      .select({ total: count() })
      .from(user)
      .where(eq(user.role, "admin"));
    if (Number(row?.total ?? 0) <= 1) {
      throw new DomainError(
        "LAST_ADMIN",
        "Ce compte est le dernier administrateur : nommez-en un autre d’abord.",
        409
      );
    }
  },

  async create(input: UserCreateInput) {
    const existing = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, input.email))
      .limit(1);
    if (existing[0]) {
      throw new DomainError(
        "EMAIL_TAKEN",
        "Un compte utilise déjà cette adresse.",
        409,
        { email: ["Adresse déjà utilisée."] }
      );
    }

    const created = await auth.api.createUser({
      body: { email: input.email, name: input.name, password: input.password },
    });
    // Better Auth crée le compte avec le rôle par défaut ; le rôle demandé est
    // appliqué ensuite pour rester la seule source de vérité côté base.
    await db
      .update(user)
      .set({ emailVerified: true, role: input.role, updatedAt: new Date() })
      .where(eq(user.id, created.user.id));
    return { email: input.email, id: created.user.id, role: input.role };
  },
  async list(): Promise<BackOfficeUser[]> {
    const rows = await db
      .select({
        banned: user.banned,
        banReason: user.banReason,
        createdAt: user.createdAt,
        email: user.email,
        emailVerified: user.emailVerified,
        id: user.id,
        lastSessionAt: sql<Date | null>`max(${session.createdAt})`,
        name: user.name,
        role: user.role,
      })
      .from(user)
      .leftJoin(session, eq(session.userId, user.id))
      .groupBy(
        user.id,
        user.name,
        user.email,
        user.role,
        user.banned,
        user.banReason,
        user.emailVerified,
        user.createdAt
      )
      .orderBy(desc(user.createdAt));

    return rows.map((row) => ({
      ...row,
      banned: row.banned ?? false,
      lastSessionAt: row.lastSessionAt ? new Date(row.lastSessionAt) : null,
    }));
  },

  /** Comptes connectés récemment mais sans accès : diagnostic de l'écran 403. */
  listPendingAccess() {
    return db
      .select({
        createdAt: user.createdAt,
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
      })
      .from(user)
      .where(
        sql`${user.role} not in (${sql.join(
          BACK_OFFICE_ROLES.map((role) => sql`${role}`),
          sql`, `
        )})`
      )
      .orderBy(asc(user.createdAt))
      .limit(20);
  },

  async remove(id: string, actorId: string) {
    if (id === actorId) {
      throw new DomainError(
        "CANNOT_DELETE_SELF",
        "Vous ne pouvez pas supprimer votre propre compte.",
        409
      );
    }
    await this.assertNotLastAdmin(id, false);
    const [row] = await db
      .delete(user)
      .where(eq(user.id, id))
      .returning({ id: user.id });
    if (!row) {
      throw new DomainError("USER_NOT_FOUND", "Ce compte n’existe plus.", 404);
    }
    return row;
  },

  async setBanned(
    id: string,
    banned: boolean,
    reason: string | undefined,
    actorId: string
  ) {
    if (id === actorId) {
      throw new DomainError(
        "CANNOT_BAN_SELF",
        "Vous ne pouvez pas suspendre votre propre compte.",
        409
      );
    }
    if (banned) {
      await this.assertNotLastAdmin(id, false);
    }
    const [row] = await db
      .update(user)
      .set({
        banExpires: null,
        banned,
        banReason: banned ? (reason ?? null) : null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning({ banned: user.banned, id: user.id });
    if (!row) {
      throw new DomainError("USER_NOT_FOUND", "Ce compte n’existe plus.", 404);
    }
    // Suspendre sans révoquer les sessions laisserait le compte actif.
    if (banned) {
      await db.delete(session).where(eq(session.userId, id));
    }
    return row;
  },

  async setRole(id: string, role: BackOfficeRole, actorId: string) {
    if (id === actorId && role !== "admin") {
      throw new DomainError(
        "CANNOT_DEMOTE_SELF",
        "Vous ne pouvez pas retirer vos propres droits d’administration.",
        409
      );
    }
    await this.assertNotLastAdmin(id, role === "admin");
    const [row] = await db
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning({ id: user.id, role: user.role });
    if (!row) {
      throw new DomainError("USER_NOT_FOUND", "Ce compte n’existe plus.", 404);
    }
    return row;
  },
};
