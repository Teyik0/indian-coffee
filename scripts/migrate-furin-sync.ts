import { fileURLToPath } from "node:url";
import * as Effect from "effect4/Effect";
import { PersistenceError } from "@/api/effect/errors";
import { Database } from "@/api/effect/services";
import { runManagedScript } from "./effect-main";

const main = Effect.fn("migrate-furin-sync.main")(function* () {
  const database = yield* Database;
  const migrationPath = fileURLToPath(
    import.meta.resolve("@teyik0/furin/sync/postgres/migration.sql")
  );
  const migration = yield* Effect.tryPromise(() =>
    Bun.file(migrationPath).text()
  );
  yield* Effect.tryPromise({
    catch: (cause) =>
      new PersistenceError({ cause, operation: "furinSync.migrate" }),
    try: () => database.sql.unsafe(migration),
  });
  yield* Effect.logInfo("furin_sync_migrated");
});

await runManagedScript("migrate-furin-sync", main());
