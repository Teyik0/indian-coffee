import type { NotFoundProps } from "@teyik0/furin";
import { Link } from "@teyik0/furin/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicNotFound({ error }: NotFoundProps) {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-4xl flex-col items-center justify-center px-5 text-center">
      <p className="font-semibold uppercase tracking-[0.22em] text-primary text-xs">
        Erreur 404
      </p>
      <h1 className="mt-4 text-balance font-display text-6xl sm:text-8xl">
        Cette table n’existe pas.
      </h1>
      <p className="mt-5 max-w-xl text-muted-foreground">
        {error.message || "La page demandée a peut-être quitté la carte."}
      </p>
      <Button className="mt-8" nativeButton={false} render={<Link to="/" />}>
        <ArrowLeftIcon data-icon="inline-start" />
        Retour à l’accueil
      </Button>
    </section>
  );
}
