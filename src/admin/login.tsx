// biome-ignore-all lint/performance/noJsxPropsBind: Furin composite slots are component factories
import {
  CompositeComponent,
  createCompositeComponent,
} from "@teyik0/furin/rsc";
import type { ComponentType } from "react";
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
  loader: async ({ request, redirect }) => {
    const { data } = await getApi().api.admin.session.get({
      headers: request.headers,
    });
    if (data) throw redirect("/admin", 302);
    return {
      shell: await createCompositeComponent<{ Form: ComponentType }>(
        ({ Form }) => (
          <main className="grid min-h-screen lg:grid-cols-2">
            <section className="hidden bg-tamarind p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
              <p className="font-display text-2xl">Indian Coffee</p>
              <div className="max-w-xl">
                <p className="mb-4 uppercase tracking-[0.22em] text-saffron text-xs">
                  Back-office privé
                </p>
                <h1 className="font-display text-6xl leading-[0.98]">
                  La carte et les réservations, au même endroit.
                </h1>
              </div>
            </section>
            <section className="flex items-center justify-center p-5">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-3xl">Bienvenue</CardTitle>
                  <CardDescription>
                    Connectez-vous avec le compte créé par un administrateur.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form />
                </CardContent>
              </Card>
            </section>
          </main>
        ),
      ),
    };
  },
  head: () => ({
    links: [
      { rel: "icon", href: "/admin/public/favicon.webp", type: "image/webp" },
    ],
    meta: [
      { title: "Connexion · Administration Indian Coffee" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ({ shell }) => (
    <CompositeComponent src={shell} Form={() => <LoginForm />} />
  ),
});
