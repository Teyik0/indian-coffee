import { ShieldAlertIcon } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApi } from "@/lib/api-client";
import { route } from "./root";

/**
 * Un compte sans droits recevait jusqu'ici « Accès refusé. » en texte brut, sans
 * aucune issue. C'est le cas systématique après une connexion Google, qui crée
 * le compte avec le rôle `customer`.
 */
export default route.page({
  loader: async ({ request }) => {
    const { data } = await getApi().api.admin.session.get({
      headers: request.headers,
    });
    return { email: data?.user.email ?? null };
  },
  component: ({ email }) => (
    <main className="flex min-h-screen items-center justify-center bg-background p-5">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <span className="mb-2 flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <ShieldAlertIcon />
          </span>
          <CardTitle className="text-2xl">
            Ce compte n’a pas accès au back-office
          </CardTitle>
          <CardDescription>
            {email
              ? `Vous êtes connecté avec ${email}, mais aucun droit d’administration n’est associé à ce compte.`
              : "Aucun droit d’administration n’est associé à ce compte."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="text-muted-foreground text-sm">
            Un administrateur doit vous attribuer un rôle depuis l’écran «
            Utilisateurs ». Si vous vous êtes connecté avec Google, demandez à
            ce qu’on accorde l’accès à cette adresse.
          </p>
          <div className="flex flex-wrap gap-2">
            <LogoutButton />
            <Button
              nativeButton={false}
              render={<a aria-label="Revenir au site public" href="/" />}
              variant="outline"
            >
              Retour au site
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  ),
  head: () => ({
    links: [
      { href: "/admin/public/favicon.webp", rel: "icon", type: "image/webp" },
    ],
    meta: [
      { title: "Accès refusé · Administration Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
