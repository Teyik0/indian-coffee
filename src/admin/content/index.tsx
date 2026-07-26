// biome-ignore-all lint/performance/noJsxPropsBind: Furin composite slots are component factories
import { CompositeComponent } from "@teyik0/furin/rsc";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { createAdminPageShell } from "@/components/admin/admin-page-rsc";
import { ContentForm } from "@/components/admin/content-form";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "content:write");
    const content = unwrapApiResult(
      await getApi().api.admin.content.get({ headers: request.headers }),
    );
    return {
      ...content,
      shell: await createAdminPageShell(
        "Accueil, contact et informations",
        "Contenu",
      ),
    };
  },
  component: ({ shell, ...content }) => (
    <CompositeComponent
      src={shell}
      Content={() => <ContentForm initialContent={content} />}
    />
  ),
});
