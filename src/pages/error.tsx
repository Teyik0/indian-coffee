import type { ErrorProps } from "@teyik0/furin";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({ error, reset }: ErrorProps) {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="font-semibold uppercase tracking-[0.22em] text-primary text-xs">
        Incident {error.digest}
      </p>
      <h1 className="mt-4 font-display text-6xl">
        Le service marque une courte pause.
      </h1>
      <p className="mt-5 text-muted-foreground">{error.message}</p>
      <Button className="mt-8" onClick={reset}>
        <RotateCcwIcon data-icon="inline-start" />
        Réessayer
      </Button>
    </section>
  );
}
