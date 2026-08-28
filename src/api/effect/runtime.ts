import * as Cause from "effect4/Cause";
import type * as Effect from "effect4/Effect";
import * as EffectRuntime from "effect4/Effect";
import * as Exit from "effect4/Exit";
import * as ManagedRuntime from "effect4/ManagedRuntime";
import * as Option from "effect4/Option";
import { InternalApiError, isDomainError } from "./errors";
import { AppLive } from "./layers";

export const appRuntime = ManagedRuntime.make(AppLive);

export async function runApiEffect<A, E, R>(
  effect: Effect.Effect<A, E, R>,
  signal?: AbortSignal
): Promise<A> {
  const exit = await appRuntime.runPromiseExit(
    effect as Effect.Effect<A, E, never>,
    signal ? { signal } : undefined
  );
  if (Exit.isSuccess(exit)) {
    return exit.value;
  }

  const failure = Cause.findErrorOption(exit.cause);
  if (Option.isSome(failure) && isDomainError(failure.value)) {
    throw failure.value;
  }

  EffectRuntime.runSync(
    EffectRuntime.logError("effect_request_failed").pipe(
      EffectRuntime.annotateLogs({ cause: Cause.pretty(exit.cause) })
    )
  );
  throw new InternalApiError("Unexpected Effect failure", {
    cause: Cause.squash(exit.cause),
  });
}

export function runApiService<S, A, E, RService, ROperation>(
  service: Effect.Effect<S, never, RService>,
  operation: (value: S) => Effect.Effect<A, E, ROperation>,
  signal?: AbortSignal
): Promise<A> {
  return runApiEffect(EffectRuntime.flatMap(service, operation), signal);
}

export async function disposeAppRuntime() {
  await appRuntime.dispose();
}
