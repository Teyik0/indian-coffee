import * as Config from "effect4/Config";
import * as Effect from "effect4/Effect";
import * as Option from "effect4/Option";
import * as Redacted from "effect4/Redacted";
import * as Schema from "effect4/Schema";
import { boundedString, Email, UrlString } from "@/api/effect/schema";

function optional<A>(config: Config.Config<A>) {
  return Config.option(config).pipe(Config.map(Option.getOrUndefined));
}

const secret = (name: string, minimum = 0) =>
  Config.schema(
    Schema.Redacted(
      minimum > 0
        ? boundedString(minimum, Number.MAX_SAFE_INTEGER)
        : Schema.String
    ),
    name
  );

export const AppConfigDefinition = Config.unwrap({
  APP_URL: Config.schema(UrlString, "APP_URL").pipe(
    Config.withDefault("http://localhost:3000")
  ),
  BETTER_AUTH_SECRET: optional(secret("BETTER_AUTH_SECRET", 32)),
  BETTER_AUTH_URL: optional(Config.schema(UrlString, "BETTER_AUTH_URL")),
  CRON_SECRET: optional(secret("CRON_SECRET")),
  DATABASE_URL: secret("DATABASE_URL", 1),
  GOOGLE_CLIENT_ID: optional(secret("GOOGLE_CLIENT_ID")),
  GOOGLE_CLIENT_SECRET: optional(secret("GOOGLE_CLIENT_SECRET")),
  NODE_ENV: Config.literals(
    ["development", "test", "production"],
    "NODE_ENV"
  ).pipe(Config.withDefault("development")),
  RESEND_API_KEY: optional(secret("RESEND_API_KEY")),
  RESEND_FROM: Config.string("RESEND_FROM").pipe(
    Config.withDefault("Indian Coffee <reservation@indiancoffee.fr>")
  ),
  RESTAURANT_NOTIFICATION_EMAIL: Config.schema(
    Email,
    "RESTAURANT_NOTIFICATION_EMAIL"
  ).pipe(Config.withDefault("indiancoffee77@gmail.com")),
  UPLOADTHING_TOKEN: optional(secret("UPLOADTHING_TOKEN")),
});

export type AppConfig = Config.Success<typeof AppConfigDefinition>;

// Database/auth are composition-root singletons and therefore require decoded
// configuration as soon as their modules are imported.
export const env: AppConfig = Effect.runSync(AppConfigDefinition);

export const productionConfig = Effect.gen(function* () {
  const config = yield* AppConfigDefinition;
  if (config.NODE_ENV !== "production") {
    return config;
  }
  const missing = [
    ["BETTER_AUTH_SECRET", config.BETTER_AUTH_SECRET],
    ["UPLOADTHING_TOKEN", config.UPLOADTHING_TOKEN],
    ["RESEND_API_KEY", config.RESEND_API_KEY],
    ["CRON_SECRET", config.CRON_SECRET],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length > 0) {
    return yield* Effect.fail(
      new Error(`Secrets de production manquants: ${missing.join(", ")}`)
    );
  }
  return config;
});

export function reveal(secretValue: Redacted.Redacted<string>) {
  return Redacted.value(secretValue);
}
