import * as v from "valibot";

export const UuidSchema = v.pipe(v.string(), v.uuid("Identifiant invalide."));
export const VersionSchema = v.pipe(v.number(), v.integer(), v.minValue(1));

export interface ApiError {
  code: string;
  fieldErrors?: Record<string, string[]>;
  message: string;
}

export class DomainError extends Error {
  readonly code: string;
  readonly status: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 502;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    code: string,
    message: string,
    status: DomainError["status"] = 400,
    fieldErrors?: Record<string, string[]>,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("fr-FR", {
    currency: "EUR",
    style: "currency",
  }).format(priceCents / 100);
}

export async function sha256(input: string | ArrayBuffer) {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}
