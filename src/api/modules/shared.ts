export { DomainError } from "@/api/effect/errors";

import { Uuid, Version } from "@/api/effect/schema";

export const UuidSchema = Uuid;
export const VersionSchema = Version;

export interface ApiError {
  code: string;
  fieldErrors?: Record<string, string[]>;
  message: string;
}

export async function sha256(input: string | ArrayBuffer) {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}
