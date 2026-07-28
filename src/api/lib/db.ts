import "@teyik0/furin/server-only";
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { schema } from "@/db/schema";
import { env } from "./env";

export const sqlClient = new SQL(env.DATABASE_URL, {
  connectionTimeout: 10,
  idleTimeout: 20,
  max: 5,
});

export const db = drizzle({ client: sqlClient, schema });

export type { SQL as DrizzleSQL } from "drizzle-orm";
export {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";

export async function assertDatabaseReady() {
  const rows = await sqlClient`
    select
      exists(select 1 from site_settings where id = 'default') as settings,
      exists(select 1 from home_content where id = 'default') as home
  `;
  const readiness = rows[0] as
    | { settings?: boolean; home?: boolean }
    | undefined;
  if (!(readiness?.settings && readiness.home)) {
    throw new Error(
      "La base est migrée mais son contenu obligatoire est absent. Exécutez le seed."
    );
  }
}
