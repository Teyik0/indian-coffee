import { MenuView } from "@/components/public/menu-view";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { appUrl, headLinks, headScripts, socialMeta } from "@/lib/head";
import { jsonLdScript, menuJsonLd } from "@/lib/structured-data";
import { route } from "../root";

export default route.page({
  component: ({ categories }) => (
    <>
      <section className="madras-page-hero grain">
        <div className="madras-page-hero-inner">
          <div className="madras-page-hero-copy">
            <p className="eyebrow mb-5 text-saffron">Cuisine de maison</p>
            <h1>
              La carte,
              <br />
              <em>au fil des saisons.</em>
            </h1>
            <p>
              Tout est préparé sur place. Les plats marqués indisponibles
              reviendront : la carte est mise à jour au fil du service.
            </p>
          </div>
          <div className="madras-page-hero-image">
            <img
              alt="Thali de spécialités indiennes"
              decoding="async"
              fetchPriority="high"
              height={667}
              src="/public/cover4.webp"
              width={1000}
            />
          </div>
        </div>
      </section>
      <MenuView categories={categories} />
    </>
  ),
  head: ({ jsonLd, total }) => ({
    links: headLinks({ href: `${appUrl}/menu`, rel: "canonical" }),
    meta: socialMeta({
      description: `${total} plats indiens et sri-lankais préparés maison, à Savigny-le-Temple. Prix, régimes et niveaux d’épice.`,
      image: `${appUrl}/public/thali.webp`,
      title: "La carte · Indian Coffee",
      url: `${appUrl}/menu`,
    }),
    scripts: headScripts({
      children: jsonLd,
      type: "application/ld+json",
    }),
  }),
  loader: async () => {
    const categories = unwrapApiResult(await getApi().api.menu.get());
    return {
      categories,
      // La carte complète en données structurées : chaque plat devient un
      // `MenuItem` avec son offre, ce qui la rend éligible aux résultats
      // enrichis de Google.
      jsonLd: jsonLdScript(
        menuJsonLd(categories, { restaurantName: "Indian Coffee" }, appUrl)
      ),
      total: categories.reduce(
        (sum, category) =>
          sum +
          category.sections.reduce(
            (sectionSum, section) => sectionSum + section.items.length,
            0
          ),
        0
      ),
    };
  },
  tags: ["content", "menu"],
});
