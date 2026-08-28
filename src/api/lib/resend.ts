import { Resend } from "resend";
import { env, reveal } from "./env";

let client: Resend | undefined;

export function getResend() {
  if (!env.RESEND_API_KEY) {
    return null;
  }

  client ??= new Resend(reveal(env.RESEND_API_KEY));
  return client;
}
