import type * as EffectType from "effect4/Effect";
import * as Effect from "effect4/Effect";
import type { DomainError, PersistenceError } from "./errors";
import { persistenceError } from "./errors";

type AnyMethod = (...args: never[]) => unknown;

export type EffectService<T extends Record<string, AnyMethod>> = {
  readonly [K in keyof T]: T[K] extends (...args: infer Args) => infer Result
    ? (
        ...args: Args
      ) => EffectType.Effect<Awaited<Result>, DomainError | PersistenceError>
    : never;
};

/**
 * Keeps Promise-only vendor and Drizzle code behind a typed Effect service
 * boundary while the application is migrated. The adapter deliberately never
 * retries: mutations keep their existing idempotency and outbox semantics.
 */
export function effectService<const T extends Record<string, AnyMethod>>(
  name: string,
  implementation: T
): EffectService<T> {
  const entries = Object.entries(implementation).map(([operation, method]) => [
    operation,
    Effect.fn(`${name}.${operation}`)((...args: never[]) =>
      Effect.tryPromise({
        catch: (cause) => persistenceError(`${name}.${operation}`, cause),
        try: () => Promise.resolve(method.apply(implementation, args)),
      })
    ),
  ]);
  return Object.fromEntries(entries) as EffectService<T>;
}
