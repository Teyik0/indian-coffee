import type * as Layer from "effect4/Layer";
import * as ManagedRuntime from "effect4/ManagedRuntime";

export function makeTestRuntime<R, E>(layer: Layer.Layer<R, E, never>) {
  return ManagedRuntime.make(layer);
}
