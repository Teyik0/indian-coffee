import { renderServerComponent } from "@teyik0/furin/rsc";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    const current = await requireBackOfficeSession(
      request,
      redirect,
      "users:read",
    );
    return {
      content: await renderServerComponent(
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-muted-foreground">Accès privé au back-office</p>
            <h1 className="font-display text-4xl">Utilisateurs</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{current.user.name}</CardTitle>
              <CardDescription>{current.user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>{current.user.role}</Badge>
            </CardContent>
          </Card>
        </div>,
      ),
    };
  },
  component: ({ content }) => content,
});
