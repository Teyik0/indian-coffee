import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { ContentForm } from "@/components/admin/content-form";
import { AdminPage } from "@/components/admin/page-shell";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "content:write");
    const content = unwrapApiResult(
      await getApi().api.admin.content.get({ headers: request.headers })
    );
    return { content };
  },
  component: ({ content }) => (
    <AdminPage
      description="Coordonnées, textes de la page d’accueil et liens sociaux. Les pages publiques se rafraîchissent dans les cinq minutes."
      title="Contenu"
    >
      <ContentForm initialContent={content} />
    </AdminPage>
  ),
  head: () => ({
    meta: [
      { title: "Contenu · Administration Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
