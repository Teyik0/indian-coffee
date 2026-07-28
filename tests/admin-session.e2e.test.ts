import { afterAll, beforeAll, expect, test } from "bun:test";
import { or } from "drizzle-orm";
import { db, eq } from "@/api/lib/db";
import { auth } from "@/api/plugins/better-auth.plugin";
import { user } from "@/db/schema/auth";

// Cycle de vie complet de la session du back-office, exercé de bout en bout contre
// un serveur réel : anonyme -> connexion -> session -> accès protégé -> déconnexion.

const TEST_EMAIL = "e2e-session@indiancoffee.test";
const TEST_PASSWORD = "e2e-Session-Password-123456";
const EDITOR_EMAIL = "e2e-editor@indiancoffee.test";
const EDITOR_PASSWORD = "e2e-Editor-Password-123456";

const port = 33_000 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;
let server: Bun.Subprocess<"ignore", "pipe", "pipe">;

async function ensureBackOfficeUser(
  email: string,
  password: string,
  role: "admin" | "editor"
) {
  const [existing] = await db.select().from(user).where(eq(user.email, email));
  const id =
    existing?.id ??
    (
      await auth.api.createUser({
        body: {
          email,
          name: "E2E Session",
          password,
        },
      })
    ).user.id;
  await db
    .update(user)
    .set({ emailVerified: true, role })
    .where(eq(user.id, id));
}

async function fetchWhenReady(path: string, init?: RequestInit) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: cette boucle attend volontairement le démarrage du serveur.
      return await fetch(`${baseUrl}${path}`, init);
    } catch (error) {
      lastError = error;
      await Bun.sleep(100);
    }
  }
  throw lastError;
}

beforeAll(async () => {
  await Promise.all([
    ensureBackOfficeUser(TEST_EMAIL, TEST_PASSWORD, "admin"),
    ensureBackOfficeUser(EDITOR_EMAIL, EDITOR_PASSWORD, "editor"),
  ]);
  const runtimeEnv = { ...process.env };
  runtimeEnv.NODE_ENV = "development";
  // On garde APP_URL par défaut (:3000) et on écoute sur un autre port : le serveur
  // doit faire confiance à l'origine sur laquelle il écoute réellement, sinon Better
  // Auth rejette la connexion (403) et aucune session n'est émise.
  runtimeEnv.PORT = String(port);
  server = Bun.spawn([process.execPath, "--hot", "src/server.ts"], {
    cwd: process.cwd(),
    env: runtimeEnv,
    stderr: "pipe",
    stdout: "pipe",
  });
  // Attend que le serveur réponde.
  const health = await fetchWhenReady("/api/health");
  if (health.status !== 200) {
    const stderr = await new Response(server.stderr).text();
    throw new Error(
      `Server not ready (status ${health.status}). Logs:\n${stderr}`
    );
  }
  expect(health.status).toBe(200);
}, 30_000);

afterAll(async () => {
  server?.kill();
  await server?.exited;
  await db
    .delete(user)
    .where(or(eq(user.email, TEST_EMAIL), eq(user.email, EDITOR_EMAIL)));
});

test("a session cannot be retrieved before signing in", async () => {
  const anonymous = await fetchWhenReady("/api/auth/get-session");
  expect(anonymous.status).toBe(200);
  expect(await anonymous.text()).toBe("null");
});

test("signing in issues a session cookie and the session is retrievable", async () => {
  const signIn = await fetchWhenReady("/api/auth/sign-in/email", {
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    headers: { "Content-Type": "application/json", Origin: baseUrl },
    method: "POST",
  });
  expect(signIn.status).toBe(200);

  const cookies = signIn.headers.getSetCookie();
  const sessionCookie = cookies.find((value) =>
    value.startsWith("better-auth.session_token=")
  );
  expect(sessionCookie).toBeDefined();

  const cookieHeader = cookies.map((value) => value.split(";")[0]).join("; ");

  const session = await fetchWhenReady("/api/auth/get-session", {
    headers: { Cookie: cookieHeader },
  });
  expect(session.status).toBe(200);
  const payload = (await session.json()) as {
    user?: { email?: string; role?: string };
  } | null;
  expect(payload?.user?.email).toBe(TEST_EMAIL);
  expect(payload?.user?.role).toBe("admin");
});

test("the session cookie unlocks the protected admin surface", async () => {
  const cookieHeader = await signInCookie();

  // Sans session, l'espace admin (HTML) renvoie vers la page de connexion.
  const anonymousHtml = await fetchWhenReady("/admin", {
    headers: { accept: "text/html" },
    redirect: "manual",
  });
  expect(anonymousHtml.status).toBe(302);
  expect(anonymousHtml.headers.get("location")?.endsWith("/admin/login")).toBe(
    true
  );

  // Avec session, l'espace admin (HTML) se charge.
  const authedHtml = await fetchWhenReady("/admin", {
    headers: { accept: "text/html", Cookie: cookieHeader },
    redirect: "manual",
  });
  expect(authedHtml.status).toBe(200);
  expect(await authedHtml.text()).toContain("Vue d’ensemble");

  // L'API admin est protégée par la macro onlyAdmin.
  const anonymousApi = await fetchWhenReady("/api/admin/menu");
  expect(anonymousApi.status).toBe(401);
  const authedApi = await fetchWhenReady("/api/admin/menu", {
    headers: { Cookie: cookieHeader },
  });
  expect(authedApi.status).toBe(200);
});

// Le rôle `editor` est celui de l'équipe de salle : il gère le service et la
// carte, mais jamais les comptes. L'assertion précédente lui refusait tout accès,
// ce qui rendait ce rôle — pourtant le défaut de Better Auth — inutilisable.
test("an editor reaches the service screens but not account management", async () => {
  const cookieHeader = await signInCookie(EDITOR_EMAIL, EDITOR_PASSWORD);

  const dashboard = await fetchWhenReady("/admin", {
    headers: { accept: "text/html", Cookie: cookieHeader },
    redirect: "manual",
  });
  expect(dashboard.status).toBe(200);

  const menu = await fetchWhenReady("/api/admin/menu", {
    headers: { Cookie: cookieHeader },
  });
  expect(menu.status).toBe(200);

  // La gestion des comptes reste réservée aux administrateurs.
  const users = await fetchWhenReady("/api/admin/users", {
    headers: { Cookie: cookieHeader },
  });
  expect(users.status).toBe(403);

  const usersPage = await fetchWhenReady("/admin/users", {
    headers: { accept: "text/html", Cookie: cookieHeader },
    redirect: "manual",
  });
  expect(usersPage.status).toBe(302);
  expect(usersPage.headers.get("location")?.endsWith("/admin/forbidden")).toBe(
    true
  );
});

test("signing out invalidates the session", async () => {
  const cookieHeader = await signInCookie();

  const signOut = await fetchWhenReady("/api/auth/sign-out", {
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
      Origin: baseUrl,
    },
    method: "POST",
  });
  expect(signOut.status).toBe(200);

  const afterSignOut = await fetchWhenReady("/api/auth/get-session", {
    headers: { Cookie: cookieHeader },
  });
  expect(afterSignOut.status).toBe(200);
  expect(await afterSignOut.text()).toBe("null");
});

async function signInCookie(email = TEST_EMAIL, password = TEST_PASSWORD) {
  const signIn = await fetchWhenReady("/api/auth/sign-in/email", {
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json", Origin: baseUrl },
    method: "POST",
  });
  expect(signIn.status).toBe(200);
  return signIn.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
}
