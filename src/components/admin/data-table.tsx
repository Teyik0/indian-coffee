import { ArrowDownIcon, ArrowUpIcon, InboxIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  /** Les prix et compteurs s'alignent à droite en chiffres tabulaires. */
  align?: "start" | "end";
  cell: (row: T) => ReactNode;
  className?: string;
  header: ReactNode;
  /** Masqué en dessous de `md` : garde les listes lisibles sur mobile. */
  hideBelowMd?: boolean;
  key: string;
  sortable?: boolean;
}

function getAriaSort(
  sort: { key: string; direction: "asc" | "desc" } | undefined,
  key: string
): "ascending" | "descending" | undefined {
  if (sort?.key !== key) {
    return;
  }
  return sort.direction === "asc" ? "ascending" : "descending";
}

function getSortIcon(
  sort: { key: string; direction: "asc" | "desc" } | undefined,
  key: string
) {
  if (sort?.key !== key) {
    return null;
  }
  return sort.direction === "asc" ? (
    <ArrowUpIcon className="size-3" />
  ) : (
    <ArrowDownIcon className="size-3" />
  );
}

/**
 * Tableau partagé par la carte, les réservations, la galerie et les comptes. Les
 * écrans précédents empilaient des `<Table>` nues : pas d'en-tête collant, pas
 * d'alternance de lignes, pas de tri, aucun état vide ni de chargement.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  emptyTitle = "Rien à afficher",
  emptyDescription,
  emptyAction,
  loading = false,
  loadingRows = 5,
  density = "comfortable",
  sort,
  onSortChange,
  rowClassName,
  caption,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  loading?: boolean;
  loadingRows?: number;
  density?: "comfortable" | "compact";
  sort?: { key: string; direction: "asc" | "desc" };
  onSortChange?: (key: string) => void;
  rowClassName?: (row: T) => string | undefined;
  caption?: ReactNode;
}) {
  // Clés stables pour les lignes de chargement : elles n'ont pas d'identité
  // métier, mais l'index nu comme clé est un piège de réconciliation.
  const skeletonKeys = Array.from(
    { length: loadingRows },
    (_, index) => `skeleton-${index}`
  );

  if (!loading && rows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          {emptyDescription ? (
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          ) : null}
        </EmptyHeader>
        {emptyAction}
      </Empty>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-xl border bg-card shadow-card"
      data-density={density}
    >
      <Table className="table-sticky table-zebra">
        {caption}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                aria-sort={getAriaSort(sort, column.key)}
                className={cn(
                  column.align === "end" && "text-right",
                  column.hideBelowMd && "hidden md:table-cell",
                  column.className
                )}
                key={column.key}
              >
                {column.sortable && onSortChange ? (
                  <Button
                    className="-mx-2 h-7 gap-1 px-2 font-medium"
                    onClick={() => onSortChange(column.key)}
                    size="sm"
                    variant="ghost"
                  >
                    {column.header}
                    {getSortIcon(sort, column.key)}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? skeletonKeys.map((skeletonKey) => (
                <TableRow key={skeletonKey}>
                  {columns.map((column) => (
                    <TableCell
                      className={cn(
                        column.hideBelowMd && "hidden md:table-cell"
                      )}
                      key={column.key}
                    >
                      <Skeleton className="h-4 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : rows.map((row) => (
                <TableRow className={rowClassName?.(row)} key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell
                      className={cn(
                        column.align === "end" && "numeric text-right",
                        column.hideBelowMd && "hidden md:table-cell"
                      )}
                      key={column.key}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Pagination compacte, avec le décompte réel plutôt qu'une liste de numéros. */
export function TablePagination({
  page,
  pageCount,
  total,
  onPageChange,
  label = "éléments",
}: {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => Promise<void> | void;
  label?: string;
}) {
  if (pageCount <= 1) {
    return (
      <p className="text-muted-foreground text-sm">
        {total} {label}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-muted-foreground text-sm">
        Page {page} sur {pageCount} · {total} {label}
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          size="sm"
          variant="outline"
        >
          Précédent
        </Button>
        <Button
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          size="sm"
          variant="outline"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
