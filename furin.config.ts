import { defineConfig } from "@teyik0/furin/config";
import tailwind from "bun-plugin-tailwind";

export default defineConfig({
  apps: [
    { pagesDir: "./src/pages" },
    { pagesDir: "./src/admin", prefix: "/admin" },
  ],
  plugins: [{ ...tailwind, buildOnly: true }],
});
