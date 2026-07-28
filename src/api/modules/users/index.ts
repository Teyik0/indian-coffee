import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import {
  UserBanUpdateSchema,
  UserCreateSchema,
  UserParamsSchema,
  UserRoleUpdateSchema,
} from "./model";
import { userService } from "./service";

/**
 * La gestion des comptes reste réservée aux administrateurs : la macro
 * `onlyUserAdmin` l'assure côté API et la même matrice garde les pages.
 */
export const adminUsersRouter = new Elysia({
  name: "admin-users",
  prefix: "/api/admin/users",
})
  .use(betterAuthPlugin)
  .get("/", () => userService.list(), { onlyUserAdmin: true })
  .get("/pending", () => userService.listPendingAccess(), {
    onlyUserAdmin: true,
  })
  .post("/", ({ body }) => userService.create(body), {
    body: UserCreateSchema,
    onlyUserAdmin: true,
    sync: false,
  })
  .patch(
    "/:id/role",
    ({ params, body, user: actor }) =>
      userService.setRole(params.id, body.role, actor.id),
    {
      body: UserRoleUpdateSchema,
      onlyUserAdmin: true,
      params: UserParamsSchema,
      sync: false,
    }
  )
  .patch(
    "/:id/ban",
    ({ params, body, user: actor }) =>
      userService.setBanned(params.id, body.banned, body.reason, actor.id),
    {
      body: UserBanUpdateSchema,
      onlyUserAdmin: true,
      params: UserParamsSchema,
      sync: false,
    }
  )
  .delete(
    "/:id",
    ({ params, user: actor }) => userService.remove(params.id, actor.id),
    { onlyUserAdmin: true, params: UserParamsSchema, sync: false }
  );
