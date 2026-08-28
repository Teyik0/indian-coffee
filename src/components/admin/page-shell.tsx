import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Remplace l'ancien `createAdminPageShell`, qui imposait le même couple
 * surtitre / grand titre à chaque écran : toutes les pages se ressemblaient et
 * aucune n'avait de place pour ses actions ou ses filtres.
 */
export function AdminPage({
  title,
  description,
  actions,
  toolbar,
  breadcrumbs,
  eyebrow,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  breadcrumbs?: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("admin-page flex flex-col gap-6", className)}>
      <header className="admin-page-heading flex flex-col gap-4">
        {breadcrumbs}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? <p className="admin-page-eyebrow">{eyebrow}</p> : null}
            <h1 className="admin-page-title font-display text-heading">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 max-w-2xl text-muted-foreground text-sm">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
        {toolbar ? (
          <div className="flex flex-wrap items-center gap-2 border-border border-b pb-4">
            {toolbar}
          </div>
        ) : null}
      </header>
      {children}
    </div>
  );
}

/** Tuile de statistique : une valeur, sa tendance, et un accès à l'action. */
export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = "default",
  action,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "attention" | "positive";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "admin-stat-tile flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-card",
        tone === "attention" && "border-saffron/50 bg-saffron/8",
        tone === "positive" && "border-leaf/40"
      )}
      data-tone={tone}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-sm">{label}</p>
        {icon ? (
          <span
            className={cn(
              "text-muted-foreground",
              tone === "attention" && "text-saffron",
              tone === "positive" && "text-leaf"
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="numeric font-display text-4xl leading-none">{value}</p>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      {action}
    </div>
  );
}
