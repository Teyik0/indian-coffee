import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { schema } from "@/db/schema";
import { env } from "./env";

const client = new SQL(env.DATABASE_URL, {
  max: 5,
  idleTimeout: 20,
  connectionTimeout: 10,
});

export const db = drizzle({ client, schema });

export async function assertDatabaseReady() {
  const rows = await client`
    select
      exists(select 1 from site_settings where id = 'default') as settings,
      exists(select 1 from home_content where id = 'default') as home
  `;
  const readiness = rows[0] as { settings?: boolean; home?: boolean } | undefined;
  if (!(readiness?.settings && readiness.home)) {
    throw new Error(
      "La base est migrée mais son contenu obligatoire est absent. Exécutez le seed.",
    );
  }
}

export { and, asc, eq, inArray, lte, sql } from "drizzle-orm";
