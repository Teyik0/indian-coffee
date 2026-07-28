import { createRoute } from "@teyik0/furin/client";
import { t } from "elysia";
import { MenuView } from "@/components/public/menu-view";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { appUrl, headLinks, headScripts, socialMeta } from "@/lib/head";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/structured-data";
import { route as rootRoute } from "../root";

const menuCategoryRoute = createRoute({
  mode: "isr",
  params: t.Object({ slug: t.String() }),
  parent: rootRoute,
  revalidate: 300,
});

export default menuCategoryRoute.page({
  loader: async ({ params }) => {
    const { slug } = params as { slug: string };
    const categories = unwrapApiResult(
      await getApi().api.menu.get({ query: { category: slug } })
    );
    const title = categories[0]?.name ?? "La carte";
    return {
      categories,
      description: categories[0]?.description ?? "",
      jsonLd: jsonLdScript(
        breadcrumbJsonLd(
          [
            { name: "Accueil", path: "/" },
            { name: "La carte", path: "/menu" },
            { name: title, path: `/menu/${slug}` },
          ],
          appUrl
        )
      ),
      slug,
      title,
    };
  },
  component: ({ categories, title, description }) => (
    <>
      <section className="madras-page-hero madras-page-hero-compact grain">
        <div className="madras-page-hero-inner">
          <div className="madras-page-hero-copy">
            <nav aria-label="Fil d’Ariane" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-paper/70 text-sm">
                <li>
                  <a className="hover:text-saffron" href="/">
                    Accueil
                  </a>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <a className="hover:text-saffron" href="/menu">
                    La carte
                  </a>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page">{title}</li>
              </ol>
            </nav>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
        </div>
      </section>
      <MenuView categories={categories} />
    </>
  ),
  head: ({ title, description, slug, jsonLd }) => ({
    links: headLinks({
      href: `${appUrl}/menu/${slug}`,
      rel: "canonical",
    }),
    meta: socialMeta({
      description:
        description ||
        `Découvrez notre sélection « ${title} » chez Indian Coffee à Savigny-le-Temple.`,
      image: `${appUrl}/public/thali.webp`,
      title: `${title} · Indian Coffee`,
      url: `${appUrl}/menu/${slug}`,
    }),
    scripts: headScripts({
      children: jsonLd,
      type: "application/ld+json",
    }),
  }),
  tags: ["content", "menu"],
});
