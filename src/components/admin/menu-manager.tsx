import { useSync } from "@teyik0/furin/client";
import {
  CheckCircle2Icon,
  CircleOffIcon,
  EyeOffIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import type {
  MenuCategoryView,
  MenuItemView,
  MenuStatus,
} from "@/api/modules/menu/model";
import { AdminLink } from "@/components/admin/admin-link";
import { type Column, DataTable } from "@/components/admin/data-table";
import { adminRoutes } from "@/components/admin/routes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, apiErrorMessage } from "@/lib/api-client";
import { formatPriceRange, MENU_STATUS_LABELS } from "@/lib/format";

const STATUS_ORDER: MenuStatus[] = ["AVAILABLE", "UNAVAILABLE", "HIDDEN"];

function nextStatus(status: MenuStatus): MenuStatus {
  return status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
}

type FlatItem = MenuItemView & {
  categoryId: string;
  categoryName: string;
  sectionId: string;
  sectionName: string;
};

function getStatusToast(status: MenuStatus) {
  if (status === "AVAILABLE") {
    return "Plat de nouveau disponible";
  }
  if (status === "HIDDEN") {
    return "Plat masqué de la carte";
  }
  return "Plat marqué indisponible";
}

function getStatusVariant(
  status: MenuStatus
): "destructive" | "outline" | "secondary" {
  if (status === "AVAILABLE") {
    return "secondary";
  }
  return status === "HIDDEN" ? "outline" : "destructive";
}

/**
 * Le gestionnaire ne savait que basculer la disponibilité d'un plat : ni prix,
 * ni suppression, ni recherche, dans un tableau non paginé de plus de deux
 * cents lignes. Il devient un plan de travail sur la carte.
 */
function useMenuManager(initialCategories: MenuCategoryView[]) {
  const [categories, setCategories] = useState(initialCategories);
  const [firstCategory] = initialCategories;
  const [activeCategory, setActiveCategory] = useState<string>(
    firstCategory ? firstCategory.id : ""
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MenuStatus | "ALL">("ALL");
  const [pendingDelete, setPendingDelete] = useState<FlatItem | null>(null);
  const [pending, startTransition] = useTransition();

  function replaceItem(updated: MenuItemView) {
    setCategories((existingCategories) =>
      existingCategories.map((category) => ({
        ...category,
        sections: category.sections.map((section) => ({
          ...section,
          items: section.items.map((item) =>
            item.id === updated.id ? updated : item
          ),
        })),
      }))
    );
  }

  function removeItem(id: string) {
    setCategories((existingCategories) =>
      existingCategories.map((category) => ({
        ...category,
        sections: category.sections.map((section) => ({
          ...section,
          items: section.items.filter((item) => item.id !== id),
        })),
      }))
    );
  }

  const mutateStatus = useSync(
    (input: { item: MenuItemView; status: MenuStatus }, options) =>
      api.api.admin.menu
        .items({ id: input.item.id })
        .status.patch(
          { status: input.status, version: input.item.version },
          options
        ),
    {
      optimistic: ({ input }) => {
        replaceItem({ ...input.item, status: input.status });
        return () => replaceItem(input.item);
      },
    }
  );

  const deleteItem = useSync((input: { id: string }, options) =>
    api.api.admin.menu.items({ id: input.id }).delete(undefined, options)
  );

  function updateStatus(item: MenuItemView, status = nextStatus(item.status)) {
    startTransition(async () => {
      const { data, error } = await mutateStatus({ item, status });
      if (error || !data) {
        toast.error("Modification impossible", {
          description: apiErrorMessage(
            error,
            "Rechargez la carte puis réessayez."
          ),
        });
        return;
      }
      replaceItem({
        ...item,
        status,
        version: "version" in data ? data.version : item.version + 1,
      });
      toast.success(getStatusToast(status));
    });
  }

  function confirmDelete() {
    const target = pendingDelete;
    if (!target) {
      return;
    }
    setPendingDelete(null);
    startTransition(async () => {
      const { error } = await deleteItem({ id: target.id });
      if (error) {
        toast.error("Suppression impossible", {
          description: apiErrorMessage(error, "Le plat n’a pas été supprimé."),
        });
        return;
      }
      removeItem(target.id);
      toast.success(`« ${target.name} » supprimé de la carte`);
    });
  }

  const current = categories.find((category) => category.id === activeCategory);

  const rows = useMemo<FlatItem[]>(() => {
    if (!current) {
      return [];
    }
    const term = search.trim().toLocaleLowerCase("fr-FR");
    return current.sections.flatMap((section) =>
      section.items.flatMap((item) => {
        if (statusFilter !== "ALL" && item.status !== statusFilter) {
          return [];
        }
        if (
          term &&
          !`${item.name} ${item.description}`
            .toLocaleLowerCase("fr-FR")
            .includes(term)
        ) {
          return [];
        }
        return [
          {
            ...item,
            categoryId: current.id,
            categoryName: current.name,
            sectionId: section.id,
            sectionName: section.name,
          },
        ];
      })
    );
  }, [current, search, statusFilter]);

  const columns: Column<FlatItem>[] = [
    {
      key: "name",
      header: "Plat",
      cell: (item) => (
        <div className="flex items-center gap-3">
          {item.media ? (
            <img
              alt=""
              className="size-10 shrink-0 rounded-md object-cover"
              height={40}
              src={item.media.thumbUrl}
              width={40}
            />
          ) : (
            <span className="size-10 shrink-0 rounded-md bg-muted" />
          )}
          <span className="min-w-0">
            <AdminLink
              className="block truncate font-medium hover:underline"
              to={adminRoutes.menuItem(item.id)}
            >
              {item.name}
            </AdminLink>
            <span className="block max-w-md truncate text-muted-foreground text-xs">
              {item.description || "Sans description"}
            </span>
          </span>
        </div>
      ),
    },
    {
      key: "section",
      header: "Section",
      hideBelowMd: true,
      cell: (item) => (
        <span className="text-muted-foreground text-sm">
          {item.sectionName}
        </span>
      ),
    },
    {
      key: "price",
      header: "Prix",
      align: "end",
      cell: (item) => (
        <span className="font-medium">
          {formatPriceRange(item.variants.map((variant) => variant.priceCents))}
        </span>
      ),
    },
    {
      key: "flags",
      header: "Mise en avant",
      hideBelowMd: true,
      cell: (item) =>
        item.featured ? (
          <Badge variant="secondary">Signature</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (item) => (
        <Badge variant={getStatusVariant(item.status)}>
          {MENU_STATUS_LABELS[item.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "end",
      cell: (item) => (
        <div className="flex justify-end gap-1">
          <Button
            aria-label={`Modifier ${item.name}`}
            nativeButton={false}
            render={<AdminLink to={adminRoutes.menuItem(item.id)} />}
            size="icon-sm"
            variant="ghost"
          >
            <PencilIcon />
          </Button>
          <Button
            aria-label={
              item.status === "AVAILABLE"
                ? `Marquer ${item.name} indisponible`
                : `Remettre ${item.name} à la carte`
            }
            disabled={pending}
            onClick={() => updateStatus(item)}
            size="icon-sm"
            variant="ghost"
          >
            {item.status === "AVAILABLE" ? (
              <CircleOffIcon />
            ) : (
              <CheckCircle2Icon />
            )}
          </Button>
          <Button
            aria-label={`Masquer ${item.name}`}
            disabled={pending || item.status === "HIDDEN"}
            onClick={() => updateStatus(item, "HIDDEN")}
            size="icon-sm"
            variant="ghost"
          >
            <EyeOffIcon />
          </Button>
          <Button
            aria-label={`Supprimer ${item.name}`}
            disabled={pending}
            onClick={() => setPendingDelete(item)}
            size="icon-sm"
            variant="ghost"
          >
            <TrashIcon className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return {
    activeCategory,
    categories,
    columns,
    confirmDelete,
    pendingDelete,
    rows,
    search,
    setActiveCategory,
    setPendingDelete,
    setSearch,
    setStatusFilter,
    statusFilter,
  };
}

export function MenuManager({
  initialCategories,
}: {
  initialCategories: MenuCategoryView[];
}) {
  return <MenuManagerView {...useMenuManager(initialCategories)} />;
}

function MenuManagerView({
  activeCategory,
  categories,
  columns,
  confirmDelete,
  pendingDelete,
  rows,
  search,
  setActiveCategory,
  setPendingDelete,
  setSearch,
  setStatusFilter,
  statusFilter,
}: ReturnType<typeof useMenuManager>) {
  return (
    <div className="flex flex-col gap-5">
      <Tabs onValueChange={setActiveCategory} value={activeCategory}>
        <TabsList className="flex-wrap">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
              {category.isVisible ? null : (
                <EyeOffIcon className="ml-1 size-3 opacity-60" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Rechercher un plat dans cette catégorie"
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Rechercher un plat…"
            value={search}
          />
        </InputGroup>

        <Select
          onValueChange={(value) =>
            setStatusFilter(value as MenuStatus | "ALL")
          }
          value={statusFilter}
        >
          <SelectTrigger aria-label="Filtrer par statut" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              {STATUS_ORDER.map((status) => (
                <SelectItem key={status} value={status}>
                  {MENU_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <p className="ml-auto text-muted-foreground text-sm">
          {rows.length} plat{rows.length > 1 ? "s" : ""}
        </p>
      </div>

      <DataTable
        columns={columns}
        density="compact"
        emptyDescription={
          search || statusFilter !== "ALL"
            ? "Aucun plat ne correspond à ces critères."
            : "Cette catégorie ne contient encore aucun plat."
        }
        emptyTitle="Aucun plat"
        getRowId={(item) => item.id}
        rowClassName={(item) =>
          item.status === "HIDDEN" ? "opacity-60" : undefined
        }
        rows={rows}
      />

      <AlertDialog
        onOpenChange={(open) => (open ? undefined : setPendingDelete(null))}
        open={pendingDelete !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer « {pendingDelete?.name} » ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Le plat et ses prix seront définitivement retirés de la carte.
              Pour le retirer temporairement du service, préférez « Masquer ».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
