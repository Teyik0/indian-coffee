import * as v from "valibot";

const EnvSchema = v.object({
  DATABASE_URL: v.pipe(
    v.string(),
    v.nonEmpty("DATABASE_URL est requise."),
    v.url(),
  ),
  BETTER_AUTH_SECRET: v.optional(v.pipe(v.string(), v.minLength(32))),
  BETTER_AUTH_URL: v.optional(v.pipe(v.string(), v.url())),
  UPLOADTHING_TOKEN: v.optional(v.string()),
  RESEND_API_KEY: v.optional(v.string()),
  RESEND_FROM: v.optional(
    v.string(),
    "Indian Coffee <reservation@indiancoffee.fr>",
  ),
  RESTAURANT_NOTIFICATION_EMAIL: v.optional(
    v.pipe(v.string(), v.email()),
    "indiancoffee77@gmail.com",
  ),
  APP_URL: v.optional(v.pipe(v.string(), v.url()), "http://localhost:3000"),
  CRON_SECRET: v.optional(v.string()),
  NODE_ENV: v.optional(
    v.picklist(["development", "test", "production"]),
    "development",
  ),
});

const parsed = v.safeParse(EnvSchema, process.env);

if (!parsed.success) {
  const details = parsed.issues.map((issue) => issue.message).join(", ");
  throw new Error(`Configuration invalide: ${details}`);
}

export const env = parsed.output;

export function requireProductionSecrets() {
  if (env.NODE_ENV !== "production") {
    return;
  }

  const missing = [
    ["BETTER_AUTH_SECRET", env.BETTER_AUTH_SECRET],
    ["UPLOADTHING_TOKEN", env.UPLOADTHING_TOKEN],
    ["RESEND_API_KEY", env.RESEND_API_KEY],
    ["CRON_SECRET", env.CRON_SECRET],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Secrets de production manquants: ${missing.join(", ")}`);
  }
}
