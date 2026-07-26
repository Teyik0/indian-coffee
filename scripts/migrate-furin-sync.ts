import { fileURLToPath } from "node:url";
import { sqlClient } from "@/api/lib/db";

const migrationPath = fileURLToPath(
  import.meta.resolve("@teyik0/furin/sync/postgres/migration.sql"),
);
const migration = await Bun.file(migrationPath).text();

await sqlClient.unsafe(migration);
await sqlClient.close();

console.log("Migration Furin sync appliquée.");
