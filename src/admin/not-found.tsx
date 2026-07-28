import type { NotFoundProps } from "@teyik0/furin";
import { LayoutDashboardIcon } from "lucide-react";
import { AdminLink } from "@/components/admin/admin-link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound({ error }: NotFoundProps) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-semibold text-primary text-xs uppercase tracking-[0.2em]">
        404 · Administration
      </p>
      <h1 className="mt-4 font-display text-5xl">Écran introuvable</h1>
      <p className="mt-4 max-w-lg text-muted-foreground">
        {error.message || "Cette section du back-office n’existe pas."}
      </p>
      <Button
        className="mt-7"
        nativeButton={false}
        render={<AdminLink to="/" />}
      >
        <LayoutDashboardIcon data-icon="inline-start" />
        Tableau de bord
      </Button>
    </section>
  );
}
