import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { menuService } from "@/api/modules/menu/service";
import { MenuManager } from "@/components/admin/menu-manager";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "menu:write");
    return { categories: await menuService.getPublic({}) };
  },
  component: ({ categories }) => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-muted-foreground">Disponibilité et publication</p>
        <h1 className="font-display text-4xl">La carte</h1>
      </div>
      <MenuManager initialCategories={categories} />
    </div>
  ),
});
