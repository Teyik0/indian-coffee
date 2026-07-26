// biome-ignore-all lint/performance/noJsxPropsBind: Furin composite slots are component factories
import { CompositeComponent } from "@teyik0/furin/rsc";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { createAdminPageShell } from "@/components/admin/admin-page-rsc";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
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
      await getApi().api.admin.gallery.get({ headers: request.headers }),
    );
    return {
      ...gallery,
      shell: await createAdminPageShell("Médiathèque optimisée", "Galerie"),
    };
  },
  component: ({ shell, total }) => (
    <CompositeComponent
      src={shell}
      Content={() => (
        <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <p className="mt-3 text-muted-foreground">{total} images publiées.</p>
          <Card>
            <CardHeader>
              <CardTitle>Ajouter une image</CardTitle>
              <CardDescription>
                Le serveur Bun crée automatiquement les formats responsives.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUploadForm />
            </CardContent>
          </Card>
        </div>
      )}
    />
  ),
});
