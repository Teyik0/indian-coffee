import { treaty } from "@elysiajs/eden";
import type { App } from "@/server";

const origin = typeof window === "undefined" ? "http://localhost:3000" : window.location.origin;

export const api = treaty<App>(origin, {
  fetch: {
    credentials: "include",
    cache: "no-store",
  },
});

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
