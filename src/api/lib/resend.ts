import { Resend } from "resend";
import { env } from "./env";

let client: Resend | undefined;

export function getResend() {
  if (!env.RESEND_API_KEY) {
    return null;
  }

  client ??= new Resend(env.RESEND_API_KEY);
  return client;
}
