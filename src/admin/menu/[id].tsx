import { createRoute } from "@teyik0/furin/client";
import { t } from "elysia";
import { ArrowLeftIcon } from "lucide-react";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { AdminLink } from "@/components/admin/admin-link";
import { MenuItemForm } from "@/components/admin/menu-item-form";
import { AdminPage } from "@/components/admin/page-shell";
import { adminRoutes } from "@/components/admin/routes";
import { Button } from "@/components/ui/button";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route as rootRoute } from "../root";

const menuItemRoute = createRoute({
  params: t.Object({ id: t.String() }),
  parent: rootRoute,
});

export default menuItemRoute.page({
  loader: async ({ request, redirect, params }) => {
    await requireBackOfficeSession(request, redirect, "menu:write");
    const { id } = params as { id: string };
    const [categories, media] = await Promise.all([
      getApi()
        .api.admin.menu.get({ headers: request.headers })
        .then(unwrapApiResult),
      getApi()
        .api.admin.gallery.media.get({ headers: request.headers })
        .then(unwrapApiResult),
    ]);

    // Parcours en une passe avec sortie anticipée : la carte compte plus de
    // deux cents plats, inutile de construire des tableaux intermédiaires.
    let located:
      | {
          item: (typeof categories)[number]["sections"][number]["items"][number];
          categoryName: string;
          sectionName: string;
        }
      | undefined;
    for (const category of categories) {
      for (const section of category.sections) {
        const item = section.items.find((entry) => entry.id === id);
        if (item) {
          located = {
            categoryName: category.name,
            item,
            sectionName: section.name,
          };
          break;
        }
      }
      if (located) {
        break;
      }
    }

    // Laisse la frontière « introuvable » de l'application rendre l'écran 404.
    if (!located) {
      throw new Response("Ce plat n’existe pas.", { status: 404 });
    }

    return {
      ...located,
      mediaOptions: media.map((asset) => ({
        alt: asset.alt,
        id: asset.id,
        thumbUrl: asset.thumbUrl,
      })),
    };
  },
  component: ({ item, categoryName, sectionName, mediaOptions }) => (
    <AdminPage
      breadcrumbs={
        <Button
          className="-ml-2 self-start"
          nativeButton={false}
          render={<AdminLink to={adminRoutes.menu} />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Retour à la carte
        </Button>
      }
      description={`${categoryName} · ${sectionName}`}
      title={item.name}
    >
      <MenuItemForm
        categoryName={categoryName}
        item={item}
        mediaOptions={mediaOptions}
        sectionName={sectionName}
      />
    </AdminPage>
  ),
  head: ({ item }) => ({
    meta: [
      { title: `${item.name} · Administration Indian Coffee` },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
