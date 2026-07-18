import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { contentService } from "@/api/modules/content/service";
import { ContentForm } from "@/components/admin/content-form";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "content:write");
    return contentService.get();
  },
  component: (content) => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-muted-foreground">Accueil, contact et informations</p>
        <h1 className="font-display text-4xl">Contenu</h1>
      </div>
      <ContentForm initialContent={content} />
    </div>
  ),
});
