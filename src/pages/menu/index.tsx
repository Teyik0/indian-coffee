import { menuService } from "@/api/modules/menu/service";
import { MenuView } from "@/components/public/menu-view";
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
  loader: async () => ({ categories: await menuService.getPublic({}) }),
  component: ({ categories }) => (
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
      <MenuView categories={categories} />
    </>
  ),
});
