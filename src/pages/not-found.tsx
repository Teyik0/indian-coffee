import type { NotFoundProps } from "@teyik0/furin";
import { Link } from "@teyik0/furin/link";
import { ArrowLeftIcon, PhoneIcon, UtensilsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicNotFound({ error }: NotFoundProps) {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-4xl flex-col items-center justify-center px-5 py-20 text-center">
      <p className="eyebrow text-primary">Erreur 404</p>
      <h1 className="mt-4 font-display text-display">
        Cette table n’existe pas.
      </h1>
      <p className="mt-5 max-w-xl text-lead text-muted-foreground">
        {error.message || "La page demandée a peut-être quitté la carte."}
      </p>
      {/* Trois issues plutôt qu'un seul retour : la page 404 doit rattraper le
          visiteur au lieu de le renvoyer à la case départ. */}
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button nativeButton={false} render={<Link to="/" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Retour à l’accueil
        </Button>
        <Button
          nativeButton={false}
          render={<Link to="/menu" />}
          variant="outline"
        >
          <UtensilsIcon data-icon="inline-start" />
          Voir la carte
        </Button>
        <Button
          nativeButton={false}
          render={<Link to="/contact" />}
          variant="ghost"
        >
          <PhoneIcon data-icon="inline-start" />
          Nous contacter
        </Button>
      </div>
    </section>
  );
}
