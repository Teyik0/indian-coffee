import * as Cause from "effect4/Cause";
import type * as EffectType from "effect4/Effect";
import * as Effect from "effect4/Effect";
import * as Exit from "effect4/Exit";

function reportFailure(name: string, cause: Cause.Cause<unknown>) {
  Effect.runSync(
    Effect.logError("script_failed").pipe(
      Effect.annotateLogs({ cause: Cause.pretty(cause), script: name })
    )
  );
  process.exitCode = 1;
}

export async function runManagedScript<A, E, R>(
  name: string,
  effect: EffectType.Effect<A, E, R>
) {
  const { appRuntime, disposeAppRuntime } = await import(
    "@/api/effect/runtime"
  );
  const exit = await appRuntime.runPromiseExit(
    effect as EffectType.Effect<A, E, never>
  );
  await disposeAppRuntime();
  if (Exit.isFailure(exit)) {
    reportFailure(name, exit.cause);
  }
}

export async function runStandaloneScript<A, E>(
  name: string,
  effect: EffectType.Effect<A, E>
) {
  const exit = await Effect.runPromiseExit(effect);
  if (Exit.isFailure(exit)) {
    reportFailure(name, exit.cause);
  }
}
