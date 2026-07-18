import { getSession, isBackOfficeUser } from "@/api/plugins/better-auth.plugin";
import { LoginForm } from "@/components/admin/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { route } from "./root";

export default route.page({
  loader: async ({ request, redirect }) => {
    const current = await getSession(request);
    if (current && isBackOfficeUser(current)) throw redirect("/admin", 302);
    return {};
  },
  head: () => ({
    links: [{ rel: "icon", href: "/admin/public/favicon.webp", type: "image/webp" }],
    meta: [
      { title: "Connexion · Administration Indian Coffee" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-tamarind p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <p className="font-display text-2xl">Indian Coffee</p>
        <div className="max-w-xl">
          <p className="mb-4 uppercase tracking-[0.22em] text-saffron text-xs">Back-office privé</p>
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
            <LoginForm />
          </CardContent>
        </Card>
      </section>
    </main>
  ),
});
