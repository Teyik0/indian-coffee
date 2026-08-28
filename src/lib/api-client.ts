import { treaty } from "@elysiajs/eden";
import { createIsomorphicFn } from "@teyik0/furin";
import * as Cause from "effect4/Cause";
import * as Data from "effect4/Data";
import * as Effect from "effect4/Effect";
import * as Exit from "effect4/Exit";
import * as Option from "effect4/Option";
import * as v from "valibot";
import { type Api, apiPlugin } from "@/api";

export const getApi = createIsomorphicFn()
  .server(() => treaty(apiPlugin))
  .client(() =>
    treaty<Api>(window.location.origin, {
      fetch: {
        cache: "no-store",
        credentials: "include",
      },
    })
  );

export const api = getApi();

interface ApiError {
  status?: number;
  value?: unknown;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

export const ApiClientErrorSchema = v.object({
  cause: v.optional(v.unknown()),
  message: v.string(),
  status: v.number(),
  value: v.optional(v.unknown()),
});

type ApiClientErrorFields = v.InferOutput<typeof ApiClientErrorSchema>;

export class ApiClientError extends Data.TaggedError(
  "ApiClientError"
)<ApiClientErrorFields> {
  constructor(input: ApiClientErrorFields) {
    super(v.parse(ApiClientErrorSchema, input));
  }
}

export function apiEffect<T>(
  request: (signal: AbortSignal) => Promise<ApiResult<T>>
) {
  return Effect.tryPromise(request).pipe(
    Effect.mapError(
      (cause) =>
        new ApiClientError({
          cause,
          message: "La requête API n’a pas pu être exécutée.",
          status: 502,
        })
    ),
    Effect.flatMap((result) => {
      if (result.error) {
        return Effect.fail(
          new ApiClientError({
            message: apiErrorMessage(result.error, "La requête a échoué."),
            status: result.error.status ?? 500,
            value: result.error.value,
          })
        );
      }
      return result.data === null
        ? Effect.fail(
            new ApiClientError({
              message: "Réponse API vide.",
              status: 502,
            })
          )
        : Effect.succeed(result.data);
    })
  );
}

export function apiClientErrorResponse(error: ApiClientError): Response {
  if (error.value instanceof Response) {
    return error.value;
  }
  return new Response(error.message, { status: error.status });
}

/** Promise/Response boundary required by Furin loaders. */
export async function runLoaderEffect<A, E>(
  effect: Effect.Effect<A, E>,
  signal?: AbortSignal
): Promise<A> {
  const exit = await Effect.runPromiseExit(
    effect,
    signal ? { signal } : undefined
  );
  if (Exit.isSuccess(exit)) {
    return exit.value;
  }
  const failure = Cause.findErrorOption(exit.cause);
  if (Option.isSome(failure) && failure.value instanceof ApiClientError) {
    throw apiClientErrorResponse(failure.value);
  }
  throw Cause.squash(exit.cause);
}

/**
 * Code métier renvoyé par `errorPlugin`. Eden ne connaît que les statuts
 * déclarés sur chaque route, donc un `409` levé par `DomainError` n'est pas
 * comparable via `error.status` : on lit le code du corps.
 */
export function apiErrorCode(error: unknown) {
  if (error && typeof error === "object" && "value" in error) {
    const { value } = error;
    if (
      value &&
      typeof value === "object" &&
      "code" in value &&
      typeof value.code === "string"
    ) {
      return value.code;
    }
  }
  return null;
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "value" in error) {
    const { value } = error;
    if (
      value &&
      typeof value === "object" &&
      "message" in value &&
      typeof value.message === "string"
    ) {
      return value.message;
    }
  }
  return fallback;
}
