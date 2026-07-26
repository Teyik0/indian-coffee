import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/api/plugins/better-auth.plugin";
import {
  MenuParamsSchema,
  MenuQuerySchema,
  UpdateMenuStatusSchema,
} from "./model";
import { menuService } from "./service";

export const publicMenuRouter = new Elysia({
  name: "public-menu",
  prefix: "/api/menu",
}).get("/", ({ query }) => menuService.getPublic(query), {
  query: MenuQuerySchema,
});

export const adminMenuRouter = new Elysia({
  name: "admin-menu",
  prefix: "/api/admin/menu",
})
  .use(betterAuthPlugin)
  .get("/", () => menuService.getPublic({}), { onlyAdmin: true })
  .patch(
    "/items/:id/status",
    ({ params, body }) => menuService.updateStatus(params.id, body),
    {
      onlyAdmin: true,
      params: MenuParamsSchema,
      body: UpdateMenuStatusSchema,
      sync: { invalidate: { tags: ["menu"] } },
    },
  );
