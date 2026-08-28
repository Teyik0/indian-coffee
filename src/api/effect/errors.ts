import * as Data from "effect4/Data";
import * as v from "valibot";

export const HttpErrorStatusSchema = v.picklist([
  400, 401, 403, 404, 409, 422, 429, 502,
]);

export type HttpErrorStatus = v.InferOutput<typeof HttpErrorStatusSchema>;

export const DomainErrorSchema = v.object({
  code: v.string(),
  fieldErrors: v.optional(v.record(v.string(), v.array(v.string()))),
  message: v.string(),
  status: HttpErrorStatusSchema,
});

type DomainErrorFields = v.InferOutput<typeof DomainErrorSchema>;

/** An expected, client-visible failure. Its shape is the public API contract. */
export class DomainError extends Data.TaggedError(
  "DomainError"
)<DomainErrorFields> {
  constructor(
    code: string,
    message: string,
    status: HttpErrorStatus = 400,
    fieldErrors?: Record<string, string[]>,
    options?: ErrorOptions
  ) {
    super(
      v.parse(DomainErrorSchema, {
        code,
        message,
        status,
        ...(fieldErrors === undefined ? {} : { fieldErrors }),
      })
    );
    if (options?.cause !== undefined) {
      Object.defineProperty(this, "cause", {
        configurable: true,
        enumerable: false,
        value: options.cause,
      });
    }
  }
}

export const InfrastructureErrorSchema = v.object({
  cause: v.unknown(),
  operation: v.string(),
});

type InfrastructureErrorFields = v.InferOutput<
  typeof InfrastructureErrorSchema
>;

function parseInfrastructureError(input: InfrastructureErrorFields) {
  return v.parse(InfrastructureErrorSchema, input);
}

export class PersistenceError extends Data.TaggedError(
  "PersistenceError"
)<InfrastructureErrorFields> {
  constructor(input: InfrastructureErrorFields) {
    super(parseInfrastructureError(input));
  }
}

export class AuthProviderError extends Data.TaggedError(
  "AuthProviderError"
)<InfrastructureErrorFields> {
  constructor(input: InfrastructureErrorFields) {
    super(parseInfrastructureError(input));
  }
}

export class StorageError extends Data.TaggedError(
  "StorageError"
)<InfrastructureErrorFields> {
  constructor(input: InfrastructureErrorFields) {
    super(parseInfrastructureError(input));
  }
}

export class EmailDeliveryError extends Data.TaggedError(
  "EmailDeliveryError"
)<InfrastructureErrorFields> {
  constructor(input: InfrastructureErrorFields) {
    super(parseInfrastructureError(input));
  }
}

export class ImageProcessingError extends Data.TaggedError(
  "ImageProcessingError"
)<InfrastructureErrorFields> {
  constructor(input: InfrastructureErrorFields) {
    super(parseInfrastructureError(input));
  }
}

export type InfrastructureError =
  | PersistenceError
  | AuthProviderError
  | StorageError
  | EmailDeliveryError
  | ImageProcessingError;

/** Internal marker: the cause has already been logged at the Effect boundary. */
export class InternalApiError extends Error {
  override readonly name = "InternalApiError";
}

export function isDomainError(value: unknown): value is DomainError {
  return (
    value instanceof DomainError ||
    (typeof value === "object" &&
      value !== null &&
      "_tag" in value &&
      value._tag === "DomainError" &&
      v.safeParse(DomainErrorSchema, value).success)
  );
}

export function persistenceError(operation: string, cause: unknown) {
  return isDomainError(cause)
    ? cause
    : new PersistenceError({ cause, operation });
}
