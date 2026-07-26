import { Elysia } from "elysia";
import { env } from "@/api/lib/env";
import { jobService } from "./service";

export const jobsRouter = new Elysia({
  name: "internal-jobs",
  prefix: "/internal/jobs",
}).get("/drain", ({ headers, status }) => {
  if (
    !env.CRON_SECRET ||
    headers.authorization !== `Bearer ${env.CRON_SECRET}`
  ) {
    return status(401, {
      code: "UNAUTHORIZED",
      message: "Signature cron invalide.",
    });
  }
  return jobService.drain();
});
