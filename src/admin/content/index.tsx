import * as Effect from "effect4/Effect";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { ContentForm } from "@/components/admin/content-form";
import { AdminPage } from "@/components/admin/page-shell";
import { apiEffect, getApi, runLoaderEffect } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: ({ request, redirect }) =>
    runLoaderEffect(
      Effect.gen(function* () {
        yield* requireBackOfficeSession(request, redirect, "content:write");
        const content = yield* apiEffect((signal) =>
          getApi().api.admin.content.get({
            fetch: { signal },
            headers: request.headers,
          })
        );
        return { content };
      }),
      request.signal
    ),
  component: ({ content }) => (
    <AdminPage
      description="Coordonnées, textes de la page d’accueil et liens sociaux. Les pages publiques se rafraîchissent dans les cinq minutes."
      title="Contenu"
    >
      <ContentForm initialContent={content} />
    </AdminPage>
  ),
  head: () => ({
    meta: [
      { title: "Contenu · Administration Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
