// biome-ignore-all lint/performance/noJsxPropsBind: Furin composite slots are component factories
import {
  CompositeComponent,
  createCompositeComponent,
} from "@teyik0/furin/rsc";
import type { ComponentType } from "react";
import { MenuView } from "@/components/public/menu-view";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  head: () => ({
    meta: [
      { title: "La carte · Indian Coffee" },
      {
        name: "description",
        content: "Découvrez la carte indienne et sri-lankaise d’Indian Coffee.",
      },
    ],
  }),
  loader: async () => ({
    categories: unwrapApiResult(await getApi().api.menu.get()),
    shell: await createCompositeComponent<{ Menu: ComponentType }>(
      ({ Menu }) => (
        <>
          <section className="bg-tamarind px-5 py-18 text-primary-foreground lg:px-8">
            <div className="mx-auto max-w-7xl">
              <p className="mb-4 font-semibold uppercase tracking-[0.22em] text-saffron text-xs">
                Cuisine de maison
              </p>
              <h1 className="max-w-4xl text-balance font-display text-5xl sm:text-7xl">
                La carte, vivante au fil des saisons.
              </h1>
            </div>
          </section>
          <Menu />
        </>
      ),
    ),
  }),
  tags: ["content", "menu"],
  component: ({ categories, shell }) => (
    <CompositeComponent
      src={shell}
      Menu={() => <MenuView categories={categories} />}
    />
  ),
});
