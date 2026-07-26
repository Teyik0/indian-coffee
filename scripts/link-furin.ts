import { lstatSync, symlinkSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const furinPackage = resolve(projectRoot, "../furin/packages/core");
const peers = [
  "@elysiajs/static",
  "elysia",
  "evlog",
  "react",
  "react-dom",
] as const;

async function run(command: string[], cwd: string) {
  const process = Bun.spawn(command, {
    cwd,
    stderr: "inherit",
    stdout: "inherit",
  });
  const exitCode = await process.exited;
  if (exitCode !== 0) {
    throw new Error(`La commande ${command.join(" ")} a échoué dans ${cwd}.`);
  }
}

await run(["bun", "install", "--linker", "isolated"], projectRoot);
await run(["bun", "link"], furinPackage);
await run(["bun", "link", "@teyik0/furin", "--no-save"], projectRoot);

for (const peer of peers) {
  const source = join(projectRoot, "node_modules", peer);
  const destination = join(furinPackage, "node_modules", peer);
  try {
    const entry = lstatSync(destination);
    if (!entry.isSymbolicLink()) {
      throw new Error(`${destination} existe et n’est pas un lien symbolique.`);
    }
    unlinkSync(destination);
  } catch (error) {
    if (
      !(error instanceof Error && "code" in error && error.code === "ENOENT")
    ) {
      throw error;
    }
  }
  symlinkSync(source, destination);
}

console.log(
  "Furin et ses peer dependencies utilisent désormais Indian Coffee.",
);
