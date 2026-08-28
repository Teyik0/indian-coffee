import { describe, expect, test } from "bun:test";
import { useForm } from "@formisch/react";
import * as Cause from "effect4/Cause";
import * as Effect from "effect4/Effect";
import * as Exit from "effect4/Exit";
import * as Layer from "effect4/Layer";
import * as Option from "effect4/Option";
import * as Schema from "effect4/Schema";
import * as v from "valibot";
import {
  DomainError,
  DomainErrorSchema,
  isDomainError,
} from "@/api/effect/errors";
import { Crypto } from "@/api/effect/services";
import { env } from "@/api/lib/env";
import { GalleryAdminQueryEffectSchema } from "@/api/modules/gallery/model";
import { MenuItemCreateEffectSchema } from "@/api/modules/menu/model";
import {
  ApiClientError,
  apiClientErrorResponse,
  apiEffect,
} from "@/lib/api-client";

describe("Effect services and typed failures", () => {
  test("replaces an infrastructure service with a test Layer", async () => {
    const TestCrypto = Layer.succeed(Crypto, {
      randomUUID: Effect.succeed("deterministic-id"),
      sha256: () => Effect.succeed("deterministic-hash"),
    });
    const value = await Effect.runPromise(
      Effect.flatMap(Crypto, (service) => service.randomUUID).pipe(
        Effect.provide(TestCrypto)
      )
    );
    expect(value).toBe("deterministic-id");
  });

  test("keeps a DomainError in the typed error channel", async () => {
    const error = new DomainError(
      "SLOT_UNAVAILABLE",
      "Créneau indisponible",
      409
    );
    const exit = await Effect.runPromiseExit(Effect.fail(error));
    expect(error._tag).toBe("DomainError");
    expect(v.safeParse(DomainErrorSchema, error).success).toBe(true);
    expect(
      isDomainError({ code: error.code, message: error.message, status: 409 })
    ).toBe(false);
    expect(
      () => new DomainError("INVALID_STATUS", "Statut invalide", 500 as never)
    ).toThrow();
    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const failure = Cause.findErrorOption(exit.cause);
      expect(Option.isSome(failure)).toBe(true);
      if (Option.isSome(failure)) {
        expect(failure.value).toBe(error);
        expect((failure.value as DomainError).code).toBe("SLOT_UNAVAILABLE");
      }
    }
  });

  test("maps client errors to the exact loader Response", async () => {
    // Bun 1.4 canary currently waits for synchronous callbacks in this file.
    await Promise.resolve();
    const response = new Response("redirect", {
      headers: { location: "/admin/login" },
      status: 302,
    });
    expect(
      apiClientErrorResponse(
        new ApiClientError({
          message: "redirect",
          status: 302,
          value: response,
        })
      )
    ).toBe(response);
    expect(
      apiClientErrorResponse(
        new ApiClientError({ message: "infrastructure hidden", status: 500 })
      ).status
    ).toBe(500);
  });
});

describe("Effect Schema parity", () => {
  test("applies HTTP query defaults and string-number transformations", async () => {
    await Promise.resolve();
    expect(Schema.decodeUnknownSync(GalleryAdminQueryEffectSchema)({})).toEqual(
      {
        page: 1,
        pageSize: 24,
      }
    );
    const menuItem = Schema.decodeUnknownSync(MenuItemCreateEffectSchema)({
      name: "  Dal maison  ",
      sectionId: "00000000-0000-0000-0000-000000000000",
      variants: [{ priceCents: "1250" }],
    });
    expect(menuItem.name).toBe("Dal maison");
    expect(menuItem.variants[0]?.priceCents).toBe(1250);
    expect(menuItem.status).toBe("AVAILABLE");
    expect(menuItem.dietaryFlags).toEqual([]);
  });

  test("keeps database credentials redacted", async () => {
    await Promise.resolve();
    expect(String(env.DATABASE_URL)).not.toContain("postgres");
  });
});

describe("Effect Promise boundaries", () => {
  test("propagates interruption to the API AbortSignal", async () => {
    let aborted = false;
    const controller = new AbortController();
    const program = apiEffect<never>(
      (signal) =>
        new Promise((_, reject) => {
          signal.addEventListener("abort", () => {
            aborted = true;
            reject(new Error("aborted"));
          });
        })
    );
    const pending = Effect.runPromiseExit(program, {
      signal: controller.signal,
    });
    controller.abort();
    await pending;
    expect(aborted).toBe(true);
  });

  test("does not retry a failed mutation", async () => {
    let attempts = 0;
    await Effect.runPromiseExit(
      apiEffect(() => {
        attempts += 1;
        return Promise.reject(new Error("mutation failed"));
      })
    );
    expect(attempts).toBe(1);
  });
});

test("Valibot remains the React form validation layer", async () => {
  await Promise.resolve();
  expect(typeof v.object).toBe("function");
  expect(typeof v.safeParse).toBe("function");
  expect(typeof useForm).toBe("function");
});
