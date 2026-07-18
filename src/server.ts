import { furin } from "@teyik0/furin";
import { Elysia } from "elysia";
import { apiPlugin } from "@/api";
import { assertDatabaseReady } from "@/api/lib/db";
import { requireProductionSecrets } from "@/api/lib/env";
import { adminAuthPlugin } from "@/api/plugins/admin-auth.plugin";

requireProductionSecrets();
await assertDatabaseReady();

const port = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  .use(apiPlugin)
  .use(adminAuthPlugin)
  .use(await furin({ pagesDir: "./src/pages", sync: false }))
  .use(await furin({ pagesDir: "./src/admin", prefix: "/admin", sync: false }))
  .listen(port);

console.log(`Indian Coffee est disponible sur http://localhost:${app.server?.port}`);

export type App = typeof app;
