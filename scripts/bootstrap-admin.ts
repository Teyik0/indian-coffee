import * as Effect from "effect4/Effect";
import * as Schema from "effect4/Schema";
import { AuthProviderError, PersistenceError } from "@/api/effect/errors";
import { boundedString, Email } from "@/api/effect/schema";
import { Auth, Database } from "@/api/effect/services";
import { eq } from "@/api/lib/db";
import { user } from "@/db/schema/auth";
import { runManagedScript } from "./effect-main";

const InputSchema = Schema.Struct({
  email: Email,
  name: boundedString(2, 120),
  password: boundedString(12, 128),
});

const main = Effect.fn("bootstrap-admin.main")(function* () {
  const input = yield* Schema.decodeUnknownEffect(InputSchema)({
    email: process.env.BOOTSTRAP_ADMIN_EMAIL,
    name: process.env.BOOTSTRAP_ADMIN_NAME ?? "Administration Indian Coffee",
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
  });
  const auth = yield* Auth;
  const database = yield* Database;
  const created = yield* Effect.tryPromise({
    catch: (cause) =>
      new AuthProviderError({ cause, operation: "auth.createAdmin" }),
    try: () =>
      auth.client.api.createUser({
        body: { ...input, role: "admin" },
      }),
  });
  yield* Effect.tryPromise({
    catch: (cause) =>
      new PersistenceError({ cause, operation: "database.promoteAdmin" }),
    try: () =>
      database.db
        .update(user)
        .set({ emailVerified: true, role: "admin" })
        .where(eq(user.id, created.user.id)),
  });
  yield* Effect.logInfo("administrator_created").pipe(
    Effect.annotateLogs({ userId: created.user.id })
  );
});

await runManagedScript("bootstrap-admin", main());
