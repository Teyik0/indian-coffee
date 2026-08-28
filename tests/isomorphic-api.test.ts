import { expect, spyOn, test } from "bun:test";
import * as Effect from "effect4/Effect";
import { apiEffect, getApi } from "@/lib/api-client";

test("server-side Eden calls execute in-process without localhost fetch", async () => {
  const fetchSpy = spyOn(globalThis, "fetch");

  try {
    const health = await Effect.runPromise(
      apiEffect(() => getApi().api.health.get())
    );
    expect(health.status).toBe("ok");
    expect(fetchSpy).not.toHaveBeenCalled();
  } finally {
    fetchSpy.mockRestore();
  }
});

test("synchronized mutations require an Idempotency-Key before reaching the handler", async () => {
  const result = await getApi().api.reservations.post({
    consent: true,
    email: "client@example.com",
    fullName: "Client Test",
    message: "",
    occasion: "",
    partySize: 2,
    phone: "0612345678",
    requestedDate: "2027-01-15",
    requestedTime: "19:30",
    website: "",
  });

  expect(result.status).toBe(428);
  expect(String(result.error?.value)).toBe("Missing Idempotency-Key header");
});
