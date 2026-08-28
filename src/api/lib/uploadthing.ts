import type { UTApi } from "uploadthing/server";
import { env, reveal } from "./env";

let clientPromise: Promise<UTApi> | undefined;

export function getUploadThing() {
  if (!env.UPLOADTHING_TOKEN) {
    return null;
  }

  const token = env.UPLOADTHING_TOKEN;
  clientPromise ??= import("uploadthing/server").then(
    ({ UTApi: UploadThingApi }) => new UploadThingApi({ token: reveal(token) })
  );
  return clientPromise;
}
