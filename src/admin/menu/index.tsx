import * as Effect from "effect4/Effect";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { MenuManager } from "@/components/admin/menu-manager";
import { AdminPage } from "@/components/admin/page-shell";
import { apiEffect, getApi, runLoaderEffect } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: ({ request, redirect }) =>
    runLoaderEffect(
      Effect.gen(function* () {
        yield* requireBackOfficeSession(request, redirect, "menu:write");
        const categories = yield* apiEffect((signal) =>
          getApi().api.admin.menu.get({
            fetch: { signal },
            headers: request.headers,
          })
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
      }),
      request.signal
    ),
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
