import * as Effect from "effect4/Effect";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

function signOut() {
  Effect.runPromise(
    authClient.signOut().pipe(
      Effect.ensuring(
        Effect.sync(() => {
          window.location.href = "/admin/login";
        })
      )
    )
  );
}

/** Déconnexion réutilisable, hors du shell : l'écran 403 n'a pas de sidebar. */
export function LogoutButton({ label = "Se déconnecter" }: { label?: string }) {
  return (
    <Button onClick={signOut} variant="default">
      <LogOutIcon data-icon="inline-start" />
      {label}
    </Button>
  );
}
