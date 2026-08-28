import * as Effect from "effect4/Effect";
import { ApiClientError, apiEffect, getApi } from "@/lib/api-client";
import type { AdminPermission } from "./permissions";
import { hasAdminPermission } from "./permissions";

type Redirect = (
  location: string,
  status?: 301 | 302 | 303 | 307 | 308
) => Response;

export type { AdminPermission } from "./permissions";
export { hasAdminPermission, isBackOfficeRole } from "./permissions";

export const requireBackOfficeSession = Effect.fn("AdminSession.require")(
  (request: Request, redirect: Redirect, permission: AdminPermission) =>
    apiEffect((signal) =>
      getApi().api.admin.session.get({
        fetch: { signal },
        headers: request.headers,
      })
    ).pipe(
      Effect.catchTag("ApiClientError", (error) => {
        if (error.status === 401) {
          return Effect.fail(
            new ApiClientError({
              message: "Authentification requise.",
              status: 302,
              value: redirect("/admin/login", 302),
            })
          );
        }
        // Un compte social arrive avec le rôle `customer` : l’écran dédié est
        // plus utile qu’une réponse 403 brute.
        if (error.status === 403) {
          return Effect.fail(
            new ApiClientError({
              message: "Accès refusé.",
              status: 302,
              value: redirect("/admin/forbidden", 302),
            })
          );
        }
        return Effect.fail(error);
      }),
      Effect.flatMap((current) =>
        hasAdminPermission(current.user.role, permission)
          ? Effect.succeed(current)
          : Effect.fail(
              new ApiClientError({
                message: "Accès refusé.",
                status: 302,
                value: redirect("/admin/forbidden", 302),
              })
            )
      )
    )
);
