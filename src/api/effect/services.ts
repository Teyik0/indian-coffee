import * as Context from "effect4/Context";
import type * as Effect from "effect4/Effect";
import type { db, sqlClient } from "@/api/lib/db";
import type { env } from "@/api/lib/env";
import type { getResend } from "@/api/lib/resend";
import type { getUploadThing } from "@/api/lib/uploadthing";
import type { auth } from "@/api/plugins/better-auth.plugin";
import type { PersistenceError } from "./errors";

export class AppConfig extends Context.Service<AppConfig, typeof env>()(
  "@indian-coffee/AppConfig"
) {}

export class Database extends Context.Service<
  Database,
  {
    readonly db: typeof db;
    readonly ready: Effect.Effect<void, PersistenceError>;
    readonly sql: typeof sqlClient;
  }
>()("@indian-coffee/Database") {}

export class Auth extends Context.Service<
  Auth,
  { readonly client: typeof auth }
>()("@indian-coffee/Auth") {}

export class Crypto extends Context.Service<
  Crypto,
  {
    readonly randomUUID: Effect.Effect<string>;
    readonly sha256: (
      input: string | ArrayBuffer
    ) => Effect.Effect<string, never>;
  }
>()("@indian-coffee/Crypto") {}

export class ObjectStorage extends Context.Service<
  ObjectStorage,
  { readonly getClient: typeof getUploadThing }
>()("@indian-coffee/ObjectStorage") {}

export class EmailSender extends Context.Service<
  EmailSender,
  { readonly client: ReturnType<typeof getResend> }
>()("@indian-coffee/EmailSender") {}
