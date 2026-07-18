import * as v from "valibot";
import { and, asc, db, eq, lte } from "@/api/lib/db";
import { env } from "@/api/lib/env";
import { getResend } from "@/api/lib/resend";
import { getUploadThing } from "@/api/lib/uploadthing";
import { reservations } from "@/db/schema/reservations";
import { outboxJobs } from "@/db/schema/system";
import { EmailJobSchema, MediaDeleteJobSchema } from "./model";

function emailCopy(template: string, reference: string) {
  if (template === "reservation-received") {
    return {
      subject: `Demande de réservation ${reference}`,
      text: `Nous avons bien reçu votre demande ${reference}. Elle reste soumise à confirmation par notre équipe.`,
    };
  }
  if (template === "reservation-confirmed") {
    return {
      subject: `Réservation ${reference} confirmée`,
      text: `Votre réservation ${reference} est confirmée.`,
    };
  }
  if (template === "reservation-declined") {
    return {
      subject: `Réservation ${reference}`,
      text: `Nous ne pouvons malheureusement pas confirmer la demande ${reference}.`,
    };
  }
  return {
    subject: `Nouvelle réservation ${reference}`,
    text: `Une nouvelle demande ${reference} attend votre confirmation dans l’administration.`,
  };
}

async function processJob(job: typeof outboxJobs.$inferSelect) {
  if (job.kind === "MEDIA_DELETE") {
    const payload = v.parse(MediaDeleteJobSchema, job.payload);
    const uploadThing = getUploadThing();
    if (!uploadThing) throw new Error("UploadThing is not configured");
    const result = await uploadThing.deleteFiles(payload.keys);
    if (!result.success) throw new Error("UploadThing deletion was rejected");
    return;
  }

  const payload = v.parse(EmailJobSchema, job.payload);
  const resend = getResend();
  if (!resend) throw new Error("Resend is not configured");
  const reservation = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(eq(reservations.id, payload.reservationId))
    .limit(1);
  if (!reservation[0]) throw new Error("Reservation was not found");
  const copy = emailCopy(payload.template, payload.reference);
  const response = await resend.emails.send({
    from: env.RESEND_FROM,
    to: payload.to,
    subject: copy.subject,
    text: copy.text,
  });
  if (response.error) throw new Error(response.error.message);
}

export const jobService = {
  async drain() {
    const jobs = await db
      .select()
      .from(outboxJobs)
      .where(and(eq(outboxJobs.state, "PENDING"), lte(outboxJobs.nextAttemptAt, new Date())))
      .orderBy(asc(outboxJobs.createdAt))
      .limit(10);
    let processed = 0;
    let failed = 0;
    for (const job of jobs) {
      await db
        .update(outboxJobs)
        .set({ state: "PROCESSING", lockedAt: new Date() })
        .where(and(eq(outboxJobs.id, job.id), eq(outboxJobs.state, "PENDING")));
      try {
        await processJob(job);
        await db
          .update(outboxJobs)
          .set({ state: "DONE", processedAt: new Date(), lastError: null })
          .where(eq(outboxJobs.id, job.id));
        processed += 1;
      } catch (error) {
        const attempts = job.attempts + 1;
        await db
          .update(outboxJobs)
          .set({
            state: attempts >= 10 ? "FAILED" : "PENDING",
            attempts,
            lockedAt: null,
            lastError: error instanceof Error ? error.message.slice(0, 500) : "Unknown error",
            nextAttemptAt: new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000),
          })
          .where(eq(outboxJobs.id, job.id));
        failed += 1;
      }
    }
    return { processed, failed };
  },
};
