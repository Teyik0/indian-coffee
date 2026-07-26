// biome-ignore-all lint/performance/noJsxPropsBind: Furin composite slots are component factories
import { CompositeComponent } from "@teyik0/furin/rsc";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { createAdminPageShell } from "@/components/admin/admin-page-rsc";
import { MenuManager } from "@/components/admin/menu-manager";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "menu:write");
    const categories = unwrapApiResult(
      await getApi().api.admin.menu.get({ headers: request.headers }),
    );
    return {
      categories,
      shell: await createAdminPageShell(
        "Disponibilité et publication",
        "La carte",
      ),
    };
  },
  component: ({ categories, shell }) => (
    <CompositeComponent
      src={shell}
      Content={() => <MenuManager initialCategories={categories} />}
    />
  ),
});
