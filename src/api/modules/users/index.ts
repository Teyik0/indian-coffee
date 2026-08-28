import { Elysia } from "elysia";
import { UserService } from "@/api/effect/domain-services";
import { runApiService } from "@/api/effect/runtime";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import {
  UserBanUpdateSchema,
  UserCreateSchema,
  UserParamsSchema,
  UserRoleUpdateSchema,
} from "./model";

/**
 * La gestion des comptes reste réservée aux administrateurs : la macro
 * `onlyUserAdmin` l'assure côté API et la même matrice garde les pages.
 */
export const adminUsersRouter = new Elysia({
  name: "admin-users",
  prefix: "/api/admin/users",
})
  .use(betterAuthPlugin)
  .get(
    "/",
    ({ request }) =>
      runApiService(UserService, (service) => service.list(), request.signal),
    { onlyUserAdmin: true }
  )
  .get(
    "/pending",
    ({ request }) =>
      runApiService(
        UserService,
        (service) => service.listPendingAccess(),
        request.signal
      ),
    {
      onlyUserAdmin: true,
    }
  )
  .post(
    "/",
    ({ body, request }) =>
      runApiService(
        UserService,
        (service) => service.create(body),
        request.signal
      ),
    {
      body: UserCreateSchema,
      onlyUserAdmin: true,
      sync: false,
    }
  )
  .patch(
    "/:id/role",
    ({ params, body, request, user: actor }) =>
      runApiService(
        UserService,
        (service) => service.setRole(params.id, body.role, actor.id),
        request.signal
      ),
    {
      body: UserRoleUpdateSchema,
      onlyUserAdmin: true,
      params: UserParamsSchema,
      sync: false,
    }
  )
  .patch(
    "/:id/ban",
    ({ params, body, request, user: actor }) =>
      runApiService(
        UserService,
        (service) =>
          service.setBanned(params.id, body.banned, body.reason, actor.id),
        request.signal
      ),
    {
      body: UserBanUpdateSchema,
      onlyUserAdmin: true,
      params: UserParamsSchema,
      sync: false,
    }
  )
  .delete(
    "/:id",
    ({ params, request, user: actor }) =>
      runApiService(
        UserService,
        (service) => service.remove(params.id, actor.id),
        request.signal
      ),
    { onlyUserAdmin: true, params: UserParamsSchema, sync: false }
  );
