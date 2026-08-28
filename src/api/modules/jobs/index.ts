import { Elysia } from "elysia";
import { JobService } from "@/api/effect/domain-services";
import { runApiService } from "@/api/effect/runtime";
import { env, reveal } from "@/api/lib/env";

export const jobsRouter = new Elysia({
  name: "internal-jobs",
  prefix: "/internal/jobs",
}).get("/drain", ({ headers, request, status }) => {
  if (
    !env.CRON_SECRET ||
    headers.authorization !== `Bearer ${reveal(env.CRON_SECRET)}`
  ) {
    return status(401, {
      code: "UNAUTHORIZED",
      message: "Signature cron invalide.",
    });
  }
  return runApiService(
    JobService,
    (service) => service.drain(),
    request.signal
  );
});
