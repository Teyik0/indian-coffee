import * as Effect from "effect4/Effect";
import * as Layer from "effect4/Layer";
import { assertDatabaseReady, db, sqlClient } from "@/api/lib/db";
import { env } from "@/api/lib/env";
import { getResend } from "@/api/lib/resend";
import { getUploadThing } from "@/api/lib/uploadthing";
import { auth } from "@/api/plugins/better-auth.plugin";
import { DomainServicesLive } from "./domain-services";
import { PersistenceError } from "./errors";
import {
  AppConfig,
  Auth,
  Crypto,
  Database,
  EmailSender,
  ObjectStorage,
} from "./services";

export const AppConfigLive = Layer.succeed(AppConfig, env);

export const DatabaseLive = Layer.effect(
  Database,
  Effect.acquireRelease(
    Effect.succeed({
      db,
      ready: Effect.tryPromise({
        catch: (cause) =>
          new PersistenceError({ cause, operation: "database.readiness" }),
        try: assertDatabaseReady,
      }),
      sql: sqlClient,
    }),
    () => Effect.promise(() => sqlClient.close({ timeout: 1 }))
  )
);

export const AuthLive = Layer.succeed(Auth, { client: auth });

export const CryptoLive = Layer.succeed(Crypto, {
  randomUUID: Effect.sync(() => crypto.randomUUID()),
  sha256: (input) =>
    Effect.promise(async () => {
      const bytes =
        typeof input === "string" ? new TextEncoder().encode(input) : input;
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
    }),
});

export const ObjectStorageLive = Layer.succeed(ObjectStorage, {
  getClient: getUploadThing,
});

export const EmailSenderLive = Layer.succeed(EmailSender, {
  client: getResend(),
});

export const InfrastructureLive = Layer.mergeAll(
  AppConfigLive,
  DatabaseLive,
  AuthLive,
  CryptoLive,
  ObjectStorageLive,
  EmailSenderLive
);

export const AppLive = Layer.merge(InfrastructureLive, DomainServicesLive);
