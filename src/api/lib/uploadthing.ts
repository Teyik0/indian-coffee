import { UTApi } from "uploadthing/server";
import { env } from "./env";

let client: UTApi | undefined;

export function getUploadThing() {
  if (!env.UPLOADTHING_TOKEN) {
    return null;
  }

  client ??= new UTApi({ token: env.UPLOADTHING_TOKEN });
  return client;
}
