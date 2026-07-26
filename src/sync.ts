import "@teyik0/furin/server-only";
import type { SyncRuntimeOptions } from "@teyik0/furin/sync";
import { postgresSyncAdapter } from "@teyik0/furin/sync/postgres";
import { sqlClient } from "@/api/lib/db";
import { auth } from "@/api/plugins/better-auth.plugin";

export const sync = {
  adapter: postgresSyncAdapter({
    namespace: "indian-coffee-v1",
    sql: sqlClient,
  }),
  principal: async ({ request }) => {
    const current = await auth.api.getSession({ headers: request.headers });
    return current?.user.id ?? "anonymous";
  },
} satisfies SyncRuntimeOptions;
