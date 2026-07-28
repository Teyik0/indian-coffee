import { useSync } from "@teyik0/furin/client";
import {
  CheckIcon,
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type {
  ReservationAdminView,
  ReservationStatus,
} from "@/api/modules/reservations/model";
import { AdminLink } from "@/components/admin/admin-link";
import {
  type Column,
  DataTable,
  TablePagination,
} from "@/components/admin/data-table";
import { adminRoutes } from "@/components/admin/routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api, apiErrorMessage } from "@/lib/api-client";
import { formatDateTime, RESERVATION_STATUS_LABELS } from "@/lib/format";

interface ListResult {
  counts: Record<string, number>;
  items: ReservationAdminView[];
  page: number;
  pageCount: number;
  total: number;
}

/** Onglets métier : ce que l'équipe fait réellement dans la journée. */
const VIEWS = [
  { key: "pending", label: "À confirmer", statuses: ["PENDING"] as const },
  { key: "confirmed", label: "Confirmées", statuses: ["CONFIRMED"] as const },
  {
    key: "archive",
    label: "Historique",
    statuses: ["DECLINED", "CANCELLED"] as const,
  },
  { key: "all", label: "Toutes", statuses: [] as const },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

function statusVariant(status: ReservationStatus) {
  if (status === "PENDING") {
    return "outline" as const;
  }
  if (status === "CONFIRMED") {
    return "secondary" as const;
  }
  return "destructive" as const;
}

function statusToast(status: "CANCELLED" | "CONFIRMED" | "DECLINED") {
  if (status === "CONFIRMED") {
    return "Réservation confirmée · le client reçoit un courriel";
  }
  if (status === "DECLINED") {
    return "Demande refusée · le client est informé";
  }
  return "Réservation annulée";
}

/**
 * L'écran affichait un tableau non paginé trié du plus ancien au plus récent, si
 * bien que le service du jour se retrouvait sous des mois de réservations
 * passées. Ni filtre, ni recherche, ni accès au message laissé par le client.
 */
export function ReservationManager({
  initialResult,
}: {
  initialResult: ListResult;
}) {
  const [result, setResult] = useState(initialResult);
  const [view, setView] = useState<ViewKey>("pending");
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const mutateStatus = useSync(
    (
      input: {
        reservation: ReservationAdminView;
        status: "CONFIRMED" | "DECLINED" | "CANCELLED";
      },
      options
    ) =>
      api.api.admin
        .reservations({ id: input.reservation.id })
        .status.patch(
          { status: input.status, version: input.reservation.version },
          options
        ),
    {
      optimistic: ({ input }) => {
        setResult((current) => ({
          ...current,
          items: current.items.map((item) =>
            item.id === input.reservation.id
              ? { ...item, status: input.status }
              : item
          ),
        }));
        return () =>
          setResult((current) => ({
            ...current,
            items: current.items.map((item) =>
              item.id === input.reservation.id ? input.reservation : item
            ),
          }));
      },
    }
  );

  async function fetchPage(nextView: ViewKey, page: number, term: string) {
    const statuses = VIEWS.find((entry) => entry.key === nextView)?.statuses;
    setLoading(true);
    const { data, error } = await api.api.admin.reservations.get({
      query: {
        status: statuses && statuses.length > 0 ? [...statuses] : undefined,
        search: term.trim() || undefined,
        page,
        pageSize: 25,
        order: nextView === "pending" ? "asc" : "desc",
      },
    });
    setLoading(false);
    if (error || !data) {
      toast.error("Chargement impossible", {
        description: apiErrorMessage(error, "Réessayez dans un instant."),
      });
      return;
    }
    setResult(data as ListResult);
  }

  async function changeView(next: string) {
    const key = next as ViewKey;
    setView(key);
    await fetchPage(key, 1, search);
  }

  function changeStatus(
    reservation: ReservationAdminView,
    status: "CONFIRMED" | "DECLINED" | "CANCELLED"
  ) {
    startTransition(async () => {
      const { data, error } = await mutateStatus({ reservation, status });
      if (error || !data || !("id" in data)) {
        toast.error("Mise à jour impossible", {
          description: apiErrorMessage(
            error,
            "Rechargez les réservations puis réessayez."
          ),
        });
        return;
      }
      setResult((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === data.id ? (data as ReservationAdminView) : item
        ),
      }));
      toast.success(statusToast(status));
    });
  }

  async function submitSearch() {
    await fetchPage(view, 1, search);
  }

  async function changePage(page: number) {
    await fetchPage(view, page, search);
  }

  const columns: Column<ReservationAdminView>[] = [
    {
      key: "when",
      header: "Date demandée",
      cell: (reservation) => (
        <AdminLink
          className="font-medium hover:underline"
          to={adminRoutes.reservation(reservation.id)}
        >
          {formatDateTime(reservation.requestedAt)}
        </AdminLink>
      ),
      sortable: false,
    },
    {
      key: "guest",
      header: "Client",
      cell: (reservation) => (
        <span className="min-w-0">
          <span className="block truncate font-medium">
            {reservation.fullName}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground text-xs">
            <a
              className="hover:underline"
              href={`tel:${reservation.phone.replace(/\s/g, "")}`}
            >
              <PhoneIcon className="mr-1 inline size-3" />
              {reservation.phone}
            </a>
            <a className="hover:underline" href={`mailto:${reservation.email}`}>
              <MailIcon className="mr-1 inline size-3" />
              Écrire
            </a>
          </span>
        </span>
      ),
    },
    {
      key: "party",
      header: "Pers.",
      align: "end",
      cell: (reservation) => reservation.partySize,
    },
    {
      key: "notes",
      header: "Demande",
      hideBelowMd: true,
      cell: (reservation) =>
        reservation.message || reservation.occasion ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                  <MessageSquareIcon className="size-3.5" />
                  {reservation.occasion || "Message"}
                </span>
              }
            />
            <TooltipContent className="max-w-xs">
              {reservation.message || reservation.occasion}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      key: "reference",
      header: "Référence",
      hideBelowMd: true,
      cell: (reservation) => (
        <span className="font-mono text-xs">{reservation.reference}</span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (reservation) => (
        <Badge variant={statusVariant(reservation.status)}>
          {RESERVATION_STATUS_LABELS[reservation.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "end",
      cell: (reservation) => {
        if (reservation.status === "PENDING") {
          return (
            <div className="flex justify-end gap-2">
              <Button
                disabled={pending}
                onClick={() => changeStatus(reservation, "CONFIRMED")}
                size="sm"
              >
                <CheckIcon data-icon="inline-start" /> Confirmer
              </Button>
              <Button
                disabled={pending}
                onClick={() => changeStatus(reservation, "DECLINED")}
                size="sm"
                variant="outline"
              >
                <XIcon data-icon="inline-start" /> Refuser
              </Button>
            </div>
          );
        }
        if (reservation.status === "CONFIRMED") {
          return (
            <Button
              disabled={pending}
              onClick={() => changeStatus(reservation, "CANCELLED")}
              size="sm"
              variant="ghost"
            >
              Annuler
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Tabs onValueChange={changeView} value={view}>
        <TabsList className="flex-wrap">
          {VIEWS.map((entry) => {
            const count = entry.statuses.reduce(
              (sum, status) => sum + (result.counts[status] ?? 0),
              0
            );
            return (
              <TabsTrigger key={entry.key} value={entry.key}>
                {entry.label}
                {entry.statuses.length > 0 && count > 0 ? (
                  <Badge className="ml-2" variant="secondary">
                    {count}
                  </Badge>
                ) : null}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await submitSearch();
        }}
      >
        <InputGroup className="w-full sm:max-w-sm">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Rechercher par nom, téléphone, email ou référence"
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Nom, téléphone, email, référence…"
            value={search}
          />
        </InputGroup>
        <Button size="sm" type="submit" variant="outline">
          Rechercher
        </Button>
      </form>

      <DataTable
        columns={columns}
        density="compact"
        emptyDescription={
          view === "pending"
            ? "Toutes les demandes ont été traitées."
            : "Aucune réservation ne correspond à ces critères."
        }
        emptyTitle="Aucune réservation"
        getRowId={(reservation) => reservation.id}
        loading={loading}
        rows={result.items}
      />

      <TablePagination
        label="réservations"
        onPageChange={changePage}
        page={result.page}
        pageCount={result.pageCount}
        total={result.total}
      />
    </div>
  );
}
