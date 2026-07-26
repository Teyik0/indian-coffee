const port = 32_000 + Math.floor(Math.random() * 1_000);
const binary = `${process.cwd()}/.furin/build/bun/server`;
const runtimeEnv = { ...process.env };
runtimeEnv.NODE_ENV = "test";
runtimeEnv.PORT = String(port);

const server = Bun.spawn([binary], {
  cwd: "/tmp",
  env: runtimeEnv,
  stdout: "pipe",
  stderr: "pipe",
});

async function fetchWhenReady(path: string, init?: RequestInit) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      return await fetch(`http://127.0.0.1:${port}${path}`, init);
    } catch (error) {
      lastError = error;
      await Bun.sleep(100);
    }
  }
  throw lastError;
}

function clientScript(html: string) {
  const match = /<script[^>]+src="([^"]+_client[^"]+\.js)"/.exec(html);
  if (!match?.[1]) throw new Error("Client bundle was not found in the HTML.");
  return match[1];
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

try {
  const health = await fetchWhenReady("/api/health");
  assert(health.status === 200, "The health check must return 200.");
  const anonymousSession = await fetchWhenReady("/api/auth/get-session");
  assert(
    anonymousSession.status === 200,
    "The Better Auth session endpoint must return 200.",
  );
  assert(
    (await anonymousSession.text()) === "null",
    "The smoke client must remain anonymous.",
  );

  const home = await fetchWhenReady("/", { headers: { accept: "text/html" } });
  const menu = await fetchWhenReady("/menu", {
    headers: { accept: "text/html" },
  });
  const gallery = await fetchWhenReady("/gallery", {
    headers: { accept: "text/html" },
  });
  const contact = await fetchWhenReady("/contact", {
    headers: { accept: "text/html" },
  });
  const privacy = await fetchWhenReady("/privacy", {
    headers: { accept: "text/html" },
  });
  const login = await fetchWhenReady("/admin/login", {
    headers: { accept: "text/html" },
  });
  const admin = await fetchWhenReady("/admin", {
    headers: { accept: "text/html" },
    redirect: "manual",
  });
  const missing = await fetchWhenReady("/missing-page", {
    headers: { accept: "text/html" },
  });

  const homeHtml = await home.text();
  const contactHtml = await contact.text();
  const loginHtml = await login.text();
  const missingHtml = await missing.text();
  const publicBuild = home.headers.get("x-furin-build-id");
  const adminBuild = login.headers.get("x-furin-build-id");

  assert(home.status === 200, "The public / route must return 200.");
  assert(menu.status === 200, "The public /menu route must return 200.");
  assert(gallery.status === 200, "The public /gallery route must return 200.");
  assert(contact.status === 200, "The public /contact route must return 200.");
  assert(privacy.status === 200, "The public /privacy route must return 200.");
  assert(login.status === 200, "The /admin/login route must remain public.");
  assert(
    admin.status === 302,
    "The admin root must redirect without a session.",
  );
  assert(
    admin.headers.get("location")?.endsWith("/admin/login"),
    "The admin redirect is invalid.",
  );
  assert(missing.status === 404, "The public not-found route must return 404.");
  assert(
    home.headers.get("cache-control")?.includes("s-maxage=300"),
    "The public home route must use five-minute ISR.",
  );
  assert(
    menu.headers.get("cache-control")?.includes("s-maxage=300"),
    "The public menu route must use five-minute ISR.",
  );
  assert(
    login.headers.get("cache-control")?.includes("no-store"),
    "The administration login must not be cached.",
  );
  assert(
    login.headers.get("x-robots-tag") === "noindex, nofollow",
    "Administration pages must not be indexed.",
  );
  assert(
    !home.headers.has("x-robots-tag"),
    "Public pages must not receive admin robot headers.",
  );
  assert(
    !health.headers.has("x-robots-tag"),
    "API responses must not receive admin robot headers.",
  );
  assert(
    homeHtml.includes('href="/admin">Administration</a>'),
    "The public administration link must remain a native document navigation.",
  );
  assert(
    contactHtml.includes("Prenons le temps de vous recevoir."),
    "The public contact page must render its reservation shell.",
  );
  assert(
    missingHtml.includes("Cette table n’existe pas"),
    "The public not-found boundary is missing.",
  );
  assert(
    publicBuild && adminBuild && publicBuild !== adminBuild,
    "The two Furin builds must be distinct.",
  );

  const publicScript = clientScript(homeHtml);
  const adminScript = clientScript(loginHtml);
  assert(
    publicScript.startsWith("/_client/"),
    "The public bundle uses an invalid prefix.",
  );
  assert(
    adminScript.startsWith("/admin/_client/"),
    "The admin bundle uses an invalid prefix.",
  );
  assert(
    publicScript !== adminScript,
    "The two applications must not share a client entry point.",
  );
  assert(
    (await fetchWhenReady(publicScript)).status === 200,
    "The public client asset is missing.",
  );
  assert(
    (await fetchWhenReady(adminScript)).status === 200,
    "The admin client asset is missing.",
  );

  console.info("Multi-plugin smoke test passed", {
    publicBuild,
    adminBuild,
    publicScript,
    adminScript,
  });
} finally {
  server.kill();
  await server.exited;
}
