import "@teyik0/furin/server-only";
import type { SyncNotifier, SyncRuntimeOptions } from "@teyik0/furin/sync";
import { postgresSyncAdapter } from "@teyik0/furin/sync/postgres";
import { sqlClient } from "@/api/lib/db";
import { auth } from "@/api/plugins/better-auth.plugin";

const SYNC_CHANNEL = "indian_coffee_v1_furin_sync";

const notifier: SyncNotifier = {
  publish: async (cursor) => {
    await sqlClient.notify(SYNC_CHANNEL, cursor);
  },
  subscribe: async (listener) => {
    const subscription = await sqlClient.listen(SYNC_CHANNEL, listener);
    return { unsubscribe: () => subscription.unlisten() };
  },
};

export const sync = {
  adapter: postgresSyncAdapter({
    namespace: "indian-coffee-v1",
    sql: sqlClient,
  }),
  notifier,
  principal: async ({ request }) => {
    const current = await auth.api.getSession({ headers: request.headers });
    return current?.user.id ?? "anonymous";
  },
} satisfies SyncRuntimeOptions;
