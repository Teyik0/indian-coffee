import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Elysia } from "elysia";
import { db } from "@/api/lib/db";
import { env } from "@/api/lib/env";
import { schema } from "@/db/schema";

const trustedOrigins = new Set([
  env.APP_URL,
  env.BETTER_AUTH_URL ?? env.APP_URL,
]);
if (env.NODE_ENV === "development") {
  const appUrl = new URL(env.APP_URL);
  const ports = new Set(
    [appUrl.port ?? "3000", process.env.PORT].filter(Boolean) as string[],
  );
  for (const port of ports) {
    trustedOrigins.add(`${appUrl.protocol}//localhost:${port}`);
    trustedOrigins.add(`${appUrl.protocol}//127.0.0.1:${port}`);
  }
}

export const auth = betterAuth({
  appName: "Indian Coffee",
  baseURL: env.BETTER_AUTH_URL ?? env.APP_URL,
  secret:
    env.BETTER_AUTH_SECRET ??
    "development-only-secret-change-before-production",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [...trustedOrigins],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false,
      },
    },
  },
  plugins: [admin({ defaultRole: "editor", adminRoles: ["admin"] })],
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },
});

export type AdminSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    session: {
      async resolve({ request, status }) {
        const current = await auth.api.getSession({ headers: request.headers });
        if (!current) {
          return status(401, {
            code: "UNAUTHORIZED",
            message: "Authentification requise.",
          });
        }
        return current;
      },
    },
    onlyAdmin: {
      async resolve({ request, status }) {
        const current = await auth.api.getSession({ headers: request.headers });
        if (!current) {
          return status(401, {
            code: "UNAUTHORIZED",
            message: "Authentification requise.",
          });
        }
        if (current.user.role !== "admin") {
          return status(403, { code: "FORBIDDEN", message: "Accès refusé." });
        }
        return current;
      },
    },
  });
