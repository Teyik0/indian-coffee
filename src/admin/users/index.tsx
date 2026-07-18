import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    const current = await requireBackOfficeSession(request, redirect, "users:read");
    return { name: current.user.name, email: current.user.email, role: current.user.role };
  },
  component: (user) => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-muted-foreground">Accès privé au back-office</p>
        <h1 className="font-display text-4xl">Utilisateurs</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge>{user.role}</Badge>
        </CardContent>
      </Card>
    </div>
  ),
});
