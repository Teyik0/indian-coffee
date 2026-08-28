import * as Effect from "effect4/Effect";
import { Elysia } from "elysia";
import { InternalApiError, isDomainError } from "@/api/effect/errors";

export const errorPlugin = new Elysia({ name: "domain-errors" }).onError(
  { as: "global" },
  ({ code, error, status }) => {
    if (isDomainError(error)) {
      return status(error.status, {
        code: error.code,
        fieldErrors: error.fieldErrors,
        message: error.message,
      });
    }

    if (code === "VALIDATION") {
      return status(422, {
        code: "VALIDATION_ERROR",
        message: "Certaines données sont invalides.",
      });
    }
    if (code === "PARSE") {
      return status(400, {
        code: "INVALID_BODY",
        message: "Le corps de la requête est invalide.",
      });
    }
    if (code === "NOT_FOUND") {
      return;
    }

    if (!(error instanceof InternalApiError)) {
      const cause =
        error instanceof Error ? error : new Error("Unknown request error");
      Effect.runSync(
        Effect.logError("request_failed").pipe(
          Effect.annotateLogs({ message: cause.message, name: cause.name })
        )
      );
    }

    return status(500, {
      code: "INTERNAL_ERROR",
      message: "Une erreur inattendue est survenue.",
    });
  }
);
