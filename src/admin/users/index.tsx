import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { AdminPage } from "@/components/admin/page-shell";
import { UsersManager } from "@/components/admin/users-manager";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    const current = await requireBackOfficeSession(
      request,
      redirect,
      "users:read"
    );
    const [users, pendingAccounts] = await Promise.all([
      getApi()
        .api.admin.users.get({ headers: request.headers })
        .then(unwrapApiResult),
      getApi()
        .api.admin.users.pending.get({ headers: request.headers })
        .then(unwrapApiResult),
    ]);
    return { currentUserId: current.user.id, pendingAccounts, users };
  },
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
