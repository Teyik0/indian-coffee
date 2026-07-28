import type { OpenState } from "@/api/modules/content/model";
import { cn } from "@/lib/utils";

function getOpenStatusLabel(state: OpenState) {
  if (state.isOpen) {
    return state.closesAt ? `Ouvert · ferme à ${state.closesAt}` : "Ouvert";
  }
  if (state.exception?.label) {
    return `Fermé · ${state.exception.label}`;
  }
  if (state.nextOpensAt) {
    return `Fermé · ouvre ${state.nextOpensDay} à ${state.nextOpensAt}`;
  }
  return "Fermé aujourd’hui";
}

/**
 * Le site ne disait jamais s'il était ouvert. Pour un restaurant, c'est
 * l'information la plus consultée : le badge est calculé à partir des horaires
 * réels et des fermetures exceptionnelles enregistrées au back-office.
 */
export function OpenStatus({
  state,
  className,
  size = "default",
}: {
  state: OpenState;
  className?: string;
  size?: "default" | "sm";
}) {
  const label = getOpenStatusLabel(state);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium",
        size === "sm" ? "text-xs" : "text-sm",
        state.isOpen
          ? "border-leaf/40 bg-leaf/10 text-leaf"
          : "border-border bg-muted/60 text-muted-foreground",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-2 rounded-full",
          state.isOpen ? "bg-leaf" : "bg-muted-foreground/60"
        )}
      />
      {label}
    </span>
  );
}
