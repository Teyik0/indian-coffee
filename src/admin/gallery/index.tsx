import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { AdminPage } from "@/components/admin/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "gallery:write");
    const gallery = unwrapApiResult(
      await getApi().api.admin.gallery.get({
        headers: request.headers,
        query: { page: 1, pageSize: 24 },
      })
    );
    return { gallery };
  },
  component: ({ gallery }) => (
    <AdminPage
      description={`${gallery.total} images. Trois formats WebP et un aperçu flouté sont générés automatiquement à l’envoi.`}
      title="Galerie"
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem] xl:items-start">
        <GalleryManager
          collections={gallery.collections}
          initialEntries={gallery.entries}
          initialPage={gallery.page}
          initialPageCount={gallery.pageCount}
          initialTotal={gallery.total}
        />
        <Card className="xl:sticky xl:top-20">
          <CardHeader>
            <CardTitle>Ajouter une image</CardTitle>
            <CardDescription>
              15 Mo maximum. Les doublons sont détectés par empreinte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MediaUploadForm />
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  ),
  head: () => ({
    meta: [
      { title: "Galerie · Administration Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
