import { renderServerComponent } from "@teyik0/furin/rsc";
import { requireBackOfficeSession } from "@/api/lib/protected-admin-page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

export default route.page({
  loader: async ({ request, redirect }) => {
    await requireBackOfficeSession(request, redirect, "hours:write");
    const { hours } = unwrapApiResult(
      await getApi().api.admin.content.get({ headers: request.headers }),
    );
    return {
      content: await renderServerComponent(
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-muted-foreground">
              Créneaux et fermetures exceptionnelles
            </p>
            <h1 className="font-display text-4xl">Horaires</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Horaires publiés</CardTitle>
              <CardDescription>Fuseau Europe/Paris</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {hours.map((slot) => (
                <div
                  className="flex justify-between border-b pb-4 last:border-0"
                  key={slot.day}
                >
                  <span>{slot.day}</span>
                  <strong>{slot.value}</strong>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>,
      ),
    };
  },
  component: ({ content }) => content,
});
