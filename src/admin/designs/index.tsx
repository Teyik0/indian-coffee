import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { AdminDesignLab } from "@/components/admin/admin-design-lab";
import { AdminPage } from "@/components/admin/page-shell";
import { Badge } from "@/components/ui/badge";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "dashboard:read");
    return {};
  },
  component: () => (
    <AdminPage
      actions={<Badge variant="outline">Laboratoire visuel</Badge>}
      className="admin-design-page"
      description="Trois façons réellement différentes d’organiser la même journée de service. La piste choisie pourra ensuite être déclinée sur tous les écrans."
      title="Quel back-office te ressemble ?"
    >
      <AdminDesignLab />
    </AdminPage>
  ),
  head: () => ({
    meta: [
      { title: "Pistes visuelles · Administration Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
