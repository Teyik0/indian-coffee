import * as Effect from "effect4/Effect";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { AdminPage } from "@/components/admin/page-shell";
import { UsersManager } from "@/components/admin/users-manager";
import { apiEffect, getApi, runLoaderEffect } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: ({ request, redirect }) =>
    runLoaderEffect(
      Effect.gen(function* () {
        const current = yield* requireBackOfficeSession(
          request,
          redirect,
          "users:read"
        );
        const { pendingAccounts, users } = yield* Effect.all(
          {
            users: apiEffect((signal) =>
              getApi().api.admin.users.get({
                fetch: { signal },
                headers: request.headers,
              })
            ),
            pendingAccounts: apiEffect((signal) =>
              getApi().api.admin.users.pending.get({
                fetch: { signal },
                headers: request.headers,
              })
            ),
          },
          { concurrency: "unbounded" }
        );
        return { currentUserId: current.user.id, pendingAccounts, users };
      }),
      request.signal
    ),
  component: ({ users, pendingAccounts, currentUserId }) => (
    <AdminPage
      description="Les administrateurs gèrent tout ; l’équipe de salle gère la carte, les réservations, les horaires et le contenu, mais pas les comptes."
      title="Utilisateurs"
    >
      <UsersManager
        currentUserId={currentUserId}
        initialUsers={users}
        pendingAccounts={pendingAccounts}
      />
    </AdminPage>
  ),
  head: () => ({
    meta: [
      { title: "Utilisateurs · Administration Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
