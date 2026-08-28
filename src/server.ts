import { furin } from "@teyik0/furin";
import * as Effect from "effect4/Effect";
import { Elysia } from "elysia";
import { apiPlugin } from "@/api";
import { appRuntime, disposeAppRuntime } from "@/api/effect/runtime";
import { Database } from "@/api/effect/services";
import { productionConfig } from "@/api/lib/env";
import { AUTH_PATH_PREFIX, auth } from "@/api/plugins/better-auth.plugin";
import { sync } from "@/sync";

const startup = Effect.fn("server.start")(function* () {
  yield* productionConfig;
  const database = yield* Database;
  yield* database.ready;

  const [publicPages, adminPages] = yield* Effect.all(
    [
      Effect.tryPromise(() => furin({ pagesDir: "./src/pages", sync })),
      Effect.tryPromise(() =>
        furin({ pagesDir: "./src/admin", prefix: "/admin", sync })
      ),
    ],
    { concurrency: "unbounded" }
  );

  const app = new Elysia()
    .onRequest(({ request }) => {
      if (new URL(request.url).pathname.startsWith(AUTH_PATH_PREFIX)) {
        return auth.handler(request);
      }
    })
    .use(apiPlugin)
    .use(publicPages)
    .guard({ adminArea: true })
    .use(adminPages)
    .listen(Number(process.env.PORT ?? 3000));

  yield* Effect.logInfo("server_started").pipe(
    Effect.annotateLogs({ port: app.server?.port ?? 3000 })
  );
  return app;
});

export const app = await appRuntime.runPromise(startup());

let shutdownStarted = false;

function requestShutdown(signal: "SIGINT" | "SIGTERM") {
  if (shutdownStarted) {
    return;
  }
  shutdownStarted = true;
  const shutdown = Effect.fn("server.stop")(function* () {
    yield* Effect.logInfo("server_stopping").pipe(
      Effect.annotateLogs({ signal })
    );
    yield* Effect.tryPromise(() => app.stop(true));
    yield* Effect.logInfo("server_http_stopped");
    yield* Effect.tryPromise(disposeAppRuntime);
    yield* Effect.logInfo("server_runtime_disposed");
  });
  Effect.runPromise(shutdown()).then(
    () => process.exit(0),
    (cause) => {
      Effect.runSync(
        Effect.logError("server_shutdown_failed").pipe(
          Effect.annotateLogs({ cause: String(cause) })
        )
      );
      process.exit(1);
    }
  );
}

process.once("SIGINT", () => requestShutdown("SIGINT"));
process.once("SIGTERM", () => requestShutdown("SIGTERM"));

export type App = typeof app;
