import { furin } from "@teyik0/furin";
import { Elysia } from "elysia";
import { apiPlugin } from "@/api";
import { assertDatabaseReady } from "@/api/lib/db";
import { requireProductionSecrets } from "@/api/lib/env";
import { sync } from "@/sync";

requireProductionSecrets();
await assertDatabaseReady();

const app = new Elysia()
  .use(await furin({ pagesDir: "./src/pages", sync }))
  .use(apiPlugin)
  .onAfterHandle(({ request, set }) => {
    if (new URL(request.url).pathname.startsWith("/admin")) {
      set.headers["x-robots-tag"] = "noindex, nofollow";
    }
  })
  .guard({ onlyAdmin: true })
  .use(
    await furin({
      pagesDir: "./src/admin",
      prefix: "/admin",
      sync,
    }),
  )
  .listen(Number(process.env.PORT ?? 3000));

console.log(
  `Indian Coffee est disponible sur http://localhost:${app.server?.port}`,
);

export type App = typeof app;
