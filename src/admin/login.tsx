import { LoginForm } from "@/components/admin/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApi } from "@/lib/api-client";
import { route } from "./root";

export default route.page({
  component: () => (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="grain relative hidden overflow-hidden bg-tamarind p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <img
            alt=""
            className="size-10 rounded-full object-cover"
            height={40}
            src="/admin/public/indian-coffee-logo.webp"
            width={40}
          />
          <p className="font-display text-xl">Indian Coffee</p>
        </div>

        <div className="max-w-xl">
          <p className="eyebrow mb-4 text-saffron">Back-office privé</p>
          <h1 className="font-display text-5xl leading-[0.98] xl:text-6xl">
            La carte, le service et les réservations, au même endroit.
          </h1>
          <p className="mt-6 max-w-md text-primary-foreground/70">
            Modifiez un prix, fermez un jour férié, confirmez une table : les
            changements sont publiés sur le site en quelques minutes.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-6 border-primary-foreground/15 border-t pt-8">
          <div>
            <dt className="text-primary-foreground/60 text-xs">Carte</dt>
            <dd className="font-display text-2xl">Prix & photos</dd>
          </div>
          <div>
            <dt className="text-primary-foreground/60 text-xs">Service</dt>
            <dd className="font-display text-2xl">Réservations</dd>
          </div>
          <div>
            <dt className="text-primary-foreground/60 text-xs">Horaires</dt>
            <dd className="font-display text-2xl">Fermetures</dd>
          </div>
        </dl>
      </section>

      <section className="flex items-center justify-center bg-background p-5">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Connexion</CardTitle>
            <CardDescription>
              Utilisez le compte créé par un administrateur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </section>
    </main>
  ),
  head: () => ({
    links: [
      { href: "/admin/public/favicon.webp", rel: "icon", type: "image/webp" },
    ],
    meta: [
      { title: "Connexion · Administration Indian Coffee" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
  loader: async ({ request, redirect }) => {
    const { data } = await getApi().api.admin.session.get({
      headers: request.headers,
    });
    if (data) {
      throw redirect("/admin", 302);
    }
    return {};
  },
});
