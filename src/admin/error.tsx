import type { ErrorProps } from "@teyik0/furin";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: ErrorProps) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-semibold text-destructive text-xs uppercase tracking-[0.2em]">
        Incident {error.digest}
      </p>
      <h1 className="mt-4 font-display text-5xl">
        La donnée n’a pas pu être chargée.
      </h1>
      <p className="mt-4 max-w-lg text-muted-foreground">{error.message}</p>
      <Button className="mt-7" onClick={reset}>
        <RotateCcwIcon data-icon="inline-start" />
        Réessayer
      </Button>
    </section>
  );
}
