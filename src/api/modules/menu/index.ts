import { Elysia } from "elysia";
import { MenuService } from "@/api/effect/domain-services";
import { runApiService } from "@/api/effect/runtime";
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

export const publicMenuRouter = new Elysia({
  name: "public-menu",
  prefix: "/api/menu",
}).get(
  "/",
  ({ query, request }) =>
    runApiService(
      MenuService,
      (service) => service.getPublic(query),
      request.signal
    ),
  {
    query: MenuQuerySchema,
  }
);

/** Toute mutation de la carte invalide le tag `menu` consommé par l'ISR public. */
const invalidateMenu = { invalidate: { tags: ["menu"] } } as const;

export const adminMenuRouter = new Elysia({
  name: "admin-menu",
  prefix: "/api/admin/menu",
})
  .use(betterAuthPlugin)
  // `getAdmin` et non `getPublic` : le back-office doit voir les plats masqués.
  .get(
    "/",
    ({ request }) =>
      runApiService(
        MenuService,
        (service) => service.getAdmin(),
        request.signal
      ),
    { onlyAdmin: true }
  )

  .post(
    "/categories",
    ({ body, request }) =>
      runApiService(
        MenuService,
        (service) => service.createCategory(body),
        request.signal
      ),
    {
      body: MenuCategoryCreateSchema,
      onlyAdmin: true,
      sync: invalidateMenu,
    }
  )
  .patch(
    "/categories/:id",
    ({ params, body, request }) =>
      runApiService(
        MenuService,
        (service) => service.updateCategory(params.id, body),
        request.signal
      ),
    {
      body: MenuCategoryUpdateSchema,
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )
  .delete(
    "/categories/:id",
    ({ params, request }) =>
      runApiService(
        MenuService,
        (service) => service.deleteCategory(params.id),
        request.signal
      ),
    {
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )

  .post(
    "/sections",
    ({ body, request }) =>
      runApiService(
        MenuService,
        (service) => service.createSection(body),
        request.signal
      ),
    {
      body: MenuSectionCreateSchema,
      onlyAdmin: true,
      sync: invalidateMenu,
    }
  )
  .patch(
    "/sections/:id",
    ({ params, body, request }) =>
      runApiService(
        MenuService,
        (service) => service.updateSection(params.id, body),
        request.signal
      ),
    {
      body: MenuSectionUpdateSchema,
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )
  .delete(
    "/sections/:id",
    ({ params, request }) =>
      runApiService(
        MenuService,
        (service) => service.deleteSection(params.id),
        request.signal
      ),
    {
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )

  .post(
    "/items",
    ({ body, request }) =>
      runApiService(
        MenuService,
        (service) => service.createItem(body),
        request.signal
      ),
    {
      body: MenuItemCreateSchema,
      onlyAdmin: true,
      sync: invalidateMenu,
    }
  )
  .patch(
    "/items/:id",
    ({ params, body, request }) =>
      runApiService(
        MenuService,
        (service) => service.updateItem(params.id, body),
        request.signal
      ),
    {
      body: MenuItemUpdateSchema,
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )
  .patch(
    "/items/:id/status",
    ({ params, body, request }) =>
      runApiService(
        MenuService,
        (service) => service.updateStatus(params.id, body),
        request.signal
      ),
    {
      body: UpdateMenuStatusSchema,
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )
  .delete(
    "/items/:id",
    async ({ params, request }) => {
      const [row] = await runApiService(
        MenuService,
        (service) => service.deleteItems([params.id]),
        request.signal
      );
      return row ?? { id: params.id };
    },
    {
      onlyAdmin: true,
      params: MenuParamsSchema,
      sync: invalidateMenu,
    }
  )

  .patch(
    "/reorder",
    ({ body, request }) =>
      runApiService(
        MenuService,
        (service) => service.reorder(body),
        request.signal
      ),
    {
      body: MenuReorderSchema,
      onlyAdmin: true,
      sync: invalidateMenu,
    }
  );
