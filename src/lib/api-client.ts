import { treaty } from "@elysiajs/eden";
import { createIsomorphicFn } from "@teyik0/furin";
import { type Api, apiPlugin } from "@/api";

export const getApi = createIsomorphicFn()
  .server(() => treaty(apiPlugin))
  .client(() =>
    treaty<Api>(window.location.origin, {
      fetch: {
        credentials: "include",
        cache: "no-store",
      },
    }),
  );

export const api = getApi();

interface ApiError {
  status?: number;
  value?: unknown;
}

interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

export function unwrapApiResult<T>(result: ApiResult<T>): T {
  if (result.error) {
    const value = result.error.value;
    if (value instanceof Response) throw value;
    throw new Response(apiErrorMessage(result.error, "La requête a échoué."), {
      status: result.error.status ?? 500,
    });
  }
  if (result.data === null) {
    throw new Response("Réponse API vide.", { status: 502 });
  }
  return result.data;
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "value" in error) {
    const value = error.value;
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
