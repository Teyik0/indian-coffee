// biome-ignore-all lint/performance/noJsxPropsBind: Furin composite slots are component factories
import { createRoute } from "@teyik0/furin/client";
import {
  CompositeComponent,
  createCompositeComponent,
} from "@teyik0/furin/rsc";
import { t } from "elysia";
import type { ComponentType } from "react";
import { MenuView } from "@/components/public/menu-view";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route as rootRoute } from "../root";

const menuCategoryRoute = createRoute({
  parent: rootRoute,
  mode: "isr",
  revalidate: 300,
  params: t.Object({ slug: t.String() }),
});

export default menuCategoryRoute.page({
  loader: async ({ params }) => {
    const categories = unwrapApiResult(
      await getApi().api.menu.get({
        query: { category: (params as { slug: string }).slug },
      }),
    );
    const title = categories[0]?.name ?? "La carte";
    return {
      categories,
      shell: await createCompositeComponent<{ Menu: ComponentType }>(
        ({ Menu }) => (
          <>
            <section className="bg-tamarind px-5 py-16 text-primary-foreground lg:px-8">
              <div className="mx-auto max-w-7xl">
                <p className="mb-3 uppercase tracking-[0.22em] text-saffron text-xs">
                  Indian Coffee
                </p>
                <h1 className="font-display text-5xl">{title}</h1>
              </div>
            </section>
            <Menu />
          </>
        ),
      ),
    };
  },
  tags: ["content", "menu"],
  head: ({ categories }) => ({
    meta: [{ title: `${categories[0]?.name ?? "La carte"} · Indian Coffee` }],
  }),
  component: ({ categories, shell }) => (
    <CompositeComponent
      src={shell}
      Menu={() => <MenuView categories={categories} />}
    />
  ),
});
