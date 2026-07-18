import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { galleryService } from "@/api/modules/gallery/service";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "gallery:write");
    return galleryService.getPage(1);
  },
  component: (gallery) => (
    <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-muted-foreground">Médiathèque optimisée</p>
        <h1 className="font-display text-4xl">Galerie</h1>
        <p className="mt-3 text-muted-foreground">{gallery.total} images publiées.</p>
      </div>
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
  ),
});
