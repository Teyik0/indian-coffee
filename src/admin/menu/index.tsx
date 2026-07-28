import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { MenuManager } from "@/components/admin/menu-manager";
import { AdminPage } from "@/components/admin/page-shell";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "menu:write");
    const categories = unwrapApiResult(
      await getApi().api.admin.menu.get({ headers: request.headers })
    );
    const total = categories.reduce(
      (sum, category) =>
        sum +
        category.sections.reduce(
          (sectionSum, section) => sectionSum + section.items.length,
          0
        ),
      0
    );
    return { categories, total };
  },
  component: ({ categories, total }) => (
    <AdminPage
      description={`${total} plats répartis dans ${categories.length} catégories. Toute modification est publiée immédiatement sur le site.`}
      title="La carte"
    >
      <MenuManager initialCategories={categories} />
    </AdminPage>
  ),
  head: () => ({
    meta: [
      { title: "La carte · Administration Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
