import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

/** Déconnexion réutilisable, hors du shell : l'écran 403 n'a pas de sidebar. */
export function LogoutButton({ label = "Se déconnecter" }: { label?: string }) {
  async function signOut() {
    await authClient.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <Button onClick={signOut} variant="default">
      <LogOutIcon data-icon="inline-start" />
      {label}
    </Button>
  );
}
