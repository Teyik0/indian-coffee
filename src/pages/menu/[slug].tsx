import { createRoute } from "@teyik0/furin/client";
import { t } from "elysia";
import { menuService } from "@/api/modules/menu/service";
import { MenuView } from "@/components/public/menu-view";
import { route as rootRoute } from "../root";

const menuCategoryRoute = createRoute({
  parent: rootRoute,
  params: t.Object({ slug: t.String() }),
});

export default menuCategoryRoute.page({
  loader: async ({ params }) => ({
    categories: await menuService.getPublic({ category: (params as { slug: string }).slug }),
  }),
  head: ({ categories }) => ({
    meta: [{ title: `${categories[0]?.name ?? "La carte"} · Indian Coffee` }],
  }),
  component: ({ categories }) => (
    <>
      <section className="bg-tamarind px-5 py-16 text-primary-foreground lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 uppercase tracking-[0.22em] text-saffron text-xs">Indian Coffee</p>
          <h1 className="font-display text-5xl">{categories[0]?.name ?? "La carte"}</h1>
        </div>
      </section>
      <MenuView categories={categories} />
    </>
  ),
});
