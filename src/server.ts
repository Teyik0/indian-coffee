import { furin } from "@teyik0/furin";
import { Elysia } from "elysia";
import { apiPlugin } from "@/api";
import { assertDatabaseReady } from "@/api/lib/db";
import { requireProductionSecrets } from "@/api/lib/env";
import { AUTH_PATH_PREFIX, auth } from "@/api/plugins/better-auth.plugin";
import { sync } from "@/sync";

requireProductionSecrets();
await assertDatabaseReady();

const app = new Elysia()
  .onRequest(({ request }) => {
    if (new URL(request.url).pathname.startsWith(AUTH_PATH_PREFIX)) {
      return auth.handler(request);
    }
  })
  .use(apiPlugin)
  .use(await furin({ pagesDir: "./src/pages", sync }))
  .guard({ adminArea: true })
  .use(
    await furin({
      pagesDir: "./src/admin",
      prefix: "/admin",
      sync,
    })
  )
  .listen(Number(process.env.PORT ?? 3000));

console.log(
  `Indian Coffee est disponible sur http://localhost:${app.server?.port}`
);

export type App = typeof app;
