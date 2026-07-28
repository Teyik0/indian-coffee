import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import {
  MenuCategoryCreateSchema,
  MenuCategoryUpdateSchema,
  MenuItemCreateSchema,
  MenuItemUpdateSchema,
  MenuParamsSchema,
  MenuQuerySchema,
  MenuReorderSchema,
  MenuSectionCreateSchema,
  MenuSectionUpdateSchema,
  UpdateMenuStatusSchema,
} from "./model";
import { menuService } from "./service";

export const publicMenuRouter = new Elysia({
  name: "public-menu",
  prefix: "/api/menu",
}).get("/", ({ query }) => menuService.getPublic(query), {
  query: MenuQuerySchema,
});

/** Toute mutation de la carte invalide le tag `menu` consommé par l'ISR public. */
const invalidateMenu = { invalidate: { tags: ["menu"] } } as const;

export const adminMenuRouter = new Elysia({
  name: "admin-menu",
  prefix: "/api/admin/menu",
})
  .use(betterAuthPlugin)
  // `getAdmin` et non `getPublic` : le back-office doit voir les plats masqués.
  .get("/", () => menuService.getAdmin(), { onlyAdmin: true })

  .post("/categories", ({ body }) => menuService.createCategory(body), {
    body: MenuCategoryCreateSchema,
    onlyAdmin: true,
    sync: invalidateMenu,
  })
  .patch(
    "/categories/:id",
    ({ params, body }) => menuService.updateCategory(params.id, body),
    {
      body: MenuCategoryUpdateSchema,
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )
  .delete(
    "/categories/:id",
    ({ params }) => menuService.deleteCategory(params.id),
    {
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )

  .post("/sections", ({ body }) => menuService.createSection(body), {
    body: MenuSectionCreateSchema,
    onlyAdmin: true,
    sync: invalidateMenu,
  })
  .patch(
    "/sections/:id",
    ({ params, body }) => menuService.updateSection(params.id, body),
    {
      body: MenuSectionUpdateSchema,
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )
  .delete(
    "/sections/:id",
    ({ params }) => menuService.deleteSection(params.id),
    {
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )

  .post("/items", ({ body }) => menuService.createItem(body), {
    body: MenuItemCreateSchema,
    onlyAdmin: true,
    sync: invalidateMenu,
  })
  .patch(
    "/items/:id",
    ({ params, body }) => menuService.updateItem(params.id, body),
    {
      body: MenuItemUpdateSchema,
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )
  .patch(
    "/items/:id/status",
    ({ params, body }) => menuService.updateStatus(params.id, body),
    {
      body: UpdateMenuStatusSchema,
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )
  .delete(
    "/items/:id",
    async ({ params }) => {
      const [row] = await menuService.deleteItems([params.id]);
      return row ?? { id: params.id };
    },
    {
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )

  .patch("/reorder", ({ body }) => menuService.reorder(body), {
    body: MenuReorderSchema,
    onlyAdmin: true,
    sync: invalidateMenu,
  });
