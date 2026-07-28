import { Elysia } from "elysia";
import { DomainError } from "@/api/modules/shared";

export const errorPlugin = new Elysia({ name: "domain-errors" }).onError(
  { as: "global" },
  ({ code, error, status }) => {
    if (error instanceof DomainError) {
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

    const cause =
      error instanceof Error ? error : new Error("Unknown request error");
    console.error("request_failed", {
      message: cause.message,
      name: cause.name,
    });

    return status(500, {
      code: "INTERNAL_ERROR",
      message: "Une erreur inattendue est survenue.",
    });
  }
);
