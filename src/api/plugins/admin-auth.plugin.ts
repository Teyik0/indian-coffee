import { Elysia } from "elysia";
import { getSession, isBackOfficeUser } from "./better-auth.plugin";

function isPublicAdminRequest(url: URL) {
  const path = url.pathname;
  if (path === "/admin/login" || path.startsWith("/admin/_client/")) {
    return true;
  }
  if (path.startsWith("/admin/public/") || path === "/admin/favicon.ico") {
    return true;
  }
  return path === "/admin/_furin/data" && url.searchParams.get("path") === "/login";
}

export const adminAuthPlugin = new Elysia({ name: "admin-auth-boundary" })
  .onAfterHandle({ as: "global" }, ({ request, set }) => {
    if (new URL(request.url).pathname.startsWith("/admin")) {
      set.headers["x-robots-tag"] = "noindex, nofollow";
    }
  })
  .onBeforeHandle({ as: "global" }, async ({ request, status }) => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/admin") || isPublicAdminRequest(url)) return;

    const current = await getSession(request);
    if (!current) {
      if (request.headers.get("accept")?.includes("text/html")) {
        return Response.redirect(new URL("/admin/login", url), 302);
      }
      return status(401, { code: "UNAUTHORIZED", message: "Authentification requise." });
    }

    if (!isBackOfficeUser(current)) {
      return status(403, { code: "FORBIDDEN", message: "Accès refusé." });
    }
  });
