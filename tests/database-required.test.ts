import { expect, test } from "bun:test";

test("the server refuses to start without DATABASE_URL in development", async () => {
  const runtimeEnv = { ...process.env };
  runtimeEnv.DATABASE_URL = undefined;
  runtimeEnv.NODE_ENV = "development";

  const server = Bun.spawn(
    [process.execPath, "--no-env-file", "src/server.ts"],
    {
      cwd: process.cwd(),
      env: runtimeEnv,
      stderr: "pipe",
      stdout: "pipe",
    }
  );

  const [exitCode, stdout, stderr] = await Promise.all([
    server.exited,
    new Response(server.stdout).text(),
    new Response(server.stderr).text(),
  ]);

  expect(exitCode).not.toBe(0);
  expect(`${stdout}\n${stderr}`).toContain("DATABASE_URL");
});
