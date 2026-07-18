import { CheckCircle2Icon, CircleOffIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { MenuCategoryView, MenuItemView, MenuStatus } from "@/api/modules/menu/model";
import { formatPrice } from "@/api/modules/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, apiErrorMessage } from "@/lib/api-client";

function nextStatus(status: MenuStatus): MenuStatus {
  return status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
}

export function MenuManager({ initialCategories }: { initialCategories: MenuCategoryView[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [pending, startTransition] = useTransition();

  function replaceItem(updated: MenuItemView) {
    setCategories((current) =>
      current.map((category) => ({
        ...category,
        sections: category.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => (item.id === updated.id ? updated : item)),
        })),
      })),
    );
  }

  function updateStatus(item: MenuItemView) {
    const status = nextStatus(item.status);
    startTransition(async () => {
      const { data, error } = await api.api.admin.menu
        .items({ id: item.id })
        .status.patch(
          { status, version: item.version },
          { headers: { "idempotency-key": crypto.randomUUID() } },
        );
      if (error || !data) {
        toast.error("Modification impossible", {
          description: apiErrorMessage(error, "Réessayez après avoir rechargé la carte."),
        });
        return;
      }
      replaceItem({
        ...item,
        status,
        version: "version" in data ? data.version : item.version + 1,
      });
      toast.success(
        status === "AVAILABLE" ? "Plat de nouveau disponible" : "Plat marqué indisponible",
      );
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle className="text-2xl">{category.name}</CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plat</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.sections
                  .flatMap((section) => section.items)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <strong>{item.name}</strong>
                        <span className="block max-w-lg truncate text-muted-foreground text-xs">
                          {item.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.variants[0] ? formatPrice(item.variants[0].priceCents) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === "AVAILABLE" ? "secondary" : "outline"}>
                          {item.status === "AVAILABLE" ? "Disponible" : "Indisponible"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          disabled={pending}
                          onClick={() => updateStatus(item)}
                          size="sm"
                          variant="outline"
                        >
                          {item.status === "AVAILABLE" ? (
                            <CircleOffIcon data-icon="inline-start" />
                          ) : (
                            <CheckCircle2Icon data-icon="inline-start" />
                          )}
                          {item.status === "AVAILABLE" ? "Indisponible" : "Réactiver"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
