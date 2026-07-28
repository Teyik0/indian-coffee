import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Elysia } from "elysia";
import { db } from "@/api/lib/db";
import { env } from "@/api/lib/env";
import { hasAdminPermission, isBackOfficeRole } from "@/api/lib/permissions";
import { schema } from "@/db/schema";

const trustedOrigins = new Set([
  env.APP_URL,
  env.BETTER_AUTH_URL ?? env.APP_URL,
]);
if (env.NODE_ENV === "development") {
  const appUrl = new URL(env.APP_URL);
  const ports = new Set(
    [appUrl.port ?? "3000", process.env.PORT].filter(Boolean) as string[]
  );
  for (const port of ports) {
    trustedOrigins.add(`${appUrl.protocol}//localhost:${port}`);
    trustedOrigins.add(`${appUrl.protocol}//127.0.0.1:${port}`);
  }
}

export const auth = betterAuth({
  appName: "Indian Coffee",
  baseURL: env.BETTER_AUTH_URL ?? env.APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    disableSignUp: true,
    enabled: true,
    minPasswordLength: 12,
    revokeSessionsOnPasswordReset: true,
  },
  plugins: [admin({ adminRoles: ["admin"], defaultRole: "editor" })],
  rateLimit: {
    customRules: {
      "/sign-in/email": { max: 5, window: 60 },
    },
    enabled: true,
    max: 100,
    window: 60,
  },
  secret:
    env.BETTER_AUTH_SECRET ??
    "development-only-secret-change-before-production",
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [...trustedOrigins],
  user: {
    additionalFields: {
      role: {
        defaultValue: "customer",
        input: false,
        type: "string",
      },
    },
  },
});

export type AdminSession = Awaited<ReturnType<typeof auth.api.getSession>>;

/** Préfixe servi par Better Auth, arbitré à la racine de l'application. */
export const AUTH_PATH_PREFIX = "/api/auth/";

const UNAUTHORIZED = {
  code: "UNAUTHORIZED",
  message: "Authentification requise.",
};
const SUSPENDED = {
  code: "ACCOUNT_SUSPENDED",
  message: "Ce compte est suspendu.",
};
const FORBIDDEN = { code: "FORBIDDEN", message: "Accès refusé." };
const LOGIN_PAGE = "/admin/login";
const FORBIDDEN_PAGE = "/admin/forbidden";
const OPEN_ADMIN_PAGES = new Set([LOGIN_PAGE, FORBIDDEN_PAGE]);

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .macro("session", {
    async resolve({ request: { headers } }) {
      const current = await auth.api.getSession({ headers });
      return { session: current?.session ?? null, user: current?.user ?? null };
    },
  })
  .macro("onlyAdmin", {
    session: true,
    resolve: ({ session, status, user }) => {
      if (!(session && user)) {
        return status(401, UNAUTHORIZED);
      }
      if (user.banned) {
        return status(403, SUSPENDED);
      }
      if (!isBackOfficeRole(user.role)) {
        return status(403, FORBIDDEN);
      }
      return { session, user };
    },
  })
  .macro("onlyUserAdmin", {
    session: true,
    resolve: ({ session, status, user }) => {
      if (!(session && user)) {
        return status(401, UNAUTHORIZED);
      }
      if (user.banned || !hasAdminPermission(user.role, "users:write")) {
        return status(403, FORBIDDEN);
      }
      return { session, user };
    },
  })
  .macro("adminArea", {
    session: true,
    afterHandle: ({ set }) => {
      set.headers["x-robots-tag"] = "noindex, nofollow";
    },
    resolve: ({ path, redirect, request, status, user }) => {
      const isPageNavigation =
        request.headers.get("accept")?.includes("text/html") ?? false;

      if (!isPageNavigation || OPEN_ADMIN_PAGES.has(path)) {
        return {};
      }
      if (!user) {
        return redirect(LOGIN_PAGE, 302);
      }
      if (user.banned) {
        return status(403, SUSPENDED);
      }
      if (!isBackOfficeRole(user.role)) {
        return status(403, FORBIDDEN);
      }
      return {};
    },
  });
