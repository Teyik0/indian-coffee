import { useSync } from "@teyik0/furin/client";
import {
  CheckIcon,
  MailIcon,
  PhoneIcon,
  SaveIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useReducer } from "react";
import { toast } from "sonner";
import type {
  ReservationAdminView,
  ReservationEventView,
  ReservationStatus,
} from "@/api/modules/reservations/model";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { api, apiErrorCode, apiErrorMessage } from "@/lib/api-client";
import {
  formatDateTime,
  formatLongDay,
  formatRelative,
  formatTime,
  RESERVATION_STATUS_LABELS,
} from "@/lib/format";

function statusToast(status: ReservationStatus) {
  if (status === "CONFIRMED") {
    return "Réservation confirmée";
  }
  if (status === "DECLINED") {
    return "Demande refusée";
  }
  return "Réservation annulée";
}

function statusBadgeVariant(
  status: ReservationStatus
): "destructive" | "outline" | "secondary" {
  if (status === "PENDING") {
    return "outline";
  }
  return status === "CONFIRMED" ? "secondary" : "destructive";
}

type Decision = "CONFIRMED" | "DECLINED" | "CANCELLED";

interface ReservationDetailState {
  conflict: string | null;
  events: ReservationEventView[];
  note: string;
  pending: Decision | "NOTE" | null;
  reservation: ReservationAdminView;
}

type ReservationDetailAction =
  | { type: "requestStarted"; pending: Decision | "NOTE" }
  | { type: "requestFinished" }
  | { type: "conflictDetected"; message: string }
  | { type: "noteChanged"; note: string }
  | {
      type: "reservationUpdated";
      reservation: ReservationAdminView;
      status: Decision;
      eventNote: string | null;
      fromStatus: ReservationStatus;
    };

function reservationDetailReducer(
  state: ReservationDetailState,
  action: ReservationDetailAction
): ReservationDetailState {
  switch (action.type) {
    case "requestStarted":
      return { ...state, conflict: null, pending: action.pending };
    case "requestFinished":
      return { ...state, pending: null };
    case "conflictDetected":
      return { ...state, conflict: action.message };
    case "noteChanged":
      return { ...state, note: action.note };
    case "reservationUpdated":
      return {
        ...state,
        events: [
          ...state.events,
          {
            actorId: null,
            actorName: "Vous",
            createdAt: new Date(),
            fromStatus: action.fromStatus,
            id: `local-${state.events.length}`,
            note: action.eventNote,
            reservationId: action.reservation.id,
            toStatus: action.status,
          },
        ],
        note: action.reservation.adminNote ?? "",
        reservation: action.reservation,
      };
    default:
      return state;
  }
}

/**
 * Le message et l'occasion saisis par le client étaient enregistrés puis jamais
 * affichés : l'équipe ne pouvait pas préparer une table pour un anniversaire ni
 * tenir compte d'une allergie. La note interne était aussi systématiquement
 * écrasée par une chaîne vide à chaque décision.
 */
function useReservationDetail({
  reservation: initialReservation,
  events: initialEvents,
}: {
  reservation: ReservationAdminView;
  events: ReservationEventView[];
}) {
  const [state, dispatch] = useReducer(reservationDetailReducer, {
    conflict: null,
    events: initialEvents,
    note: initialReservation.adminNote ?? "",
    pending: null,
    reservation: initialReservation,
  });
  const { conflict, events, note, pending, reservation } = state;

  const mutate = useSync(
    (
      input: { status: Decision; adminNote?: string; version: number },
      options
    ) =>
      api.api.admin
        .reservations({ id: reservation.id })
        .status.patch(input, options)
  );

  async function decide(status: Decision, withNote = false) {
    dispatch({
      pending: withNote ? "NOTE" : status,
      type: "requestStarted",
    });
    const { data, error } = await mutate({
      adminNote: withNote ? note : undefined,
      status,
      version: reservation.version,
    });
    dispatch({ type: "requestFinished" });

    if (error || !data || !("id" in data)) {
      const message = apiErrorMessage(
        error,
        "La réservation n’a pas pu être mise à jour."
      );
      if (apiErrorCode(error) === "VERSION_CONFLICT") {
        dispatch({ message, type: "conflictDetected" });
      } else {
        toast.error("Mise à jour impossible", { description: message });
      }
      return;
    }

    const updated = data as ReservationAdminView;
    dispatch({
      eventNote: withNote ? note || null : null,
      fromStatus: reservation.status,
      reservation: updated,
      status,
      type: "reservationUpdated",
    });
    toast.success(statusToast(status));
  }

  const isPending = reservation.status === "PENDING";

  return {
    conflict,
    decide,
    events,
    isPending,
    note,
    pending,
    reservation,
    setNote: (value: string) => dispatch({ note: value, type: "noteChanged" }),
  };
}

export function ReservationDetail(props: {
  reservation: ReservationAdminView;
  events: ReservationEventView[];
}) {
  return <ReservationDetailView {...useReservationDetail(props)} />;
}

function ReservationDetailView({
  conflict,
  decide,
  events,
  isPending,
  note,
  pending,
  reservation,
  setNote,
}: ReturnType<typeof useReservationDetail>) {
  return (
    <div className="flex flex-col gap-6">
      {conflict ? (
        <Alert variant="destructive">
          <AlertTitle>Modification concurrente</AlertTitle>
          <AlertDescription>
            {conflict} Un autre membre de l’équipe a peut-être déjà répondu.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl">
                    {formatLongDay(reservation.requestedAt)}
                  </CardTitle>
                  <CardDescription>
                    Service de {formatTime(reservation.requestedAt)} ·{" "}
                    {reservation.partySize} personne
                    {reservation.partySize > 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Badge variant={statusBadgeVariant(reservation.status)}>
                  {RESERVATION_STATUS_LABELS[reservation.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs">Client</p>
                  <p className="font-medium">{reservation.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Référence</p>
                  <p className="font-mono text-sm">{reservation.reference}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  nativeButton={false}
                  render={
                    <a
                      aria-label={`Appeler ${reservation.phone}`}
                      href={`tel:${reservation.phone.replace(/\s/g, "")}`}
                    />
                  }
                  size="sm"
                  variant="outline"
                >
                  <PhoneIcon data-icon="inline-start" />
                  {reservation.phone}
                </Button>
                <Button
                  nativeButton={false}
                  render={
                    <a
                      aria-label={`Écrire à ${reservation.email}`}
                      href={`mailto:${reservation.email}`}
                    />
                  }
                  size="sm"
                  variant="outline"
                >
                  <MailIcon data-icon="inline-start" />
                  {reservation.email}
                </Button>
              </div>

              {reservation.occasion ? (
                <div>
                  <p className="text-muted-foreground text-xs">Occasion</p>
                  <p>{reservation.occasion}</p>
                </div>
              ) : null}

              {reservation.message ? (
                <div className="rounded-lg border-l-2 border-l-saffron bg-secondary/40 p-4">
                  <p className="mb-1 text-muted-foreground text-xs">
                    Message du client
                  </p>
                  <p className="whitespace-pre-line">{reservation.message}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Le client n’a laissé aucun message.
                </p>
              )}
            </CardContent>
          </Card>

          {isPending ? (
            <Card>
              <CardHeader>
                <CardTitle>Répondre à la demande</CardTitle>
                <CardDescription>
                  Le client reçoit un courriel automatique. La note reste
                  interne.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="admin-note">Note interne</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      id="admin-note"
                      onChange={(event) => setNote(event.currentTarget.value)}
                      placeholder="Table près de la fenêtre, gâteau prévu…"
                      rows={3}
                      value={note}
                    />
                  </InputGroup>
                  <FieldDescription>
                    Conservée dans le journal de la réservation.
                  </FieldDescription>
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={pending !== null}
                    onClick={() => decide("CONFIRMED", true)}
                  >
                    {pending === "CONFIRMED" || pending === "NOTE" ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <CheckIcon data-icon="inline-start" />
                    )}
                    Confirmer la table
                  </Button>
                  <Button
                    disabled={pending !== null}
                    onClick={() => decide("DECLINED", true)}
                    variant="outline"
                  >
                    <XIcon data-icon="inline-start" />
                    Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Note interne</CardTitle>
                <CardDescription>
                  Visible uniquement par l’équipe.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <InputGroup>
                  <InputGroupTextarea
                    aria-label="Note interne"
                    onChange={(event) => setNote(event.currentTarget.value)}
                    rows={3}
                    value={note}
                  />
                </InputGroup>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={
                      pending !== null || note === (reservation.adminNote ?? "")
                    }
                    onClick={() => decide(reservation.status as Decision, true)}
                    size="sm"
                    variant="outline"
                  >
                    {pending === "NOTE" ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <SaveIcon data-icon="inline-start" />
                    )}
                    Enregistrer la note
                  </Button>
                  {reservation.status === "CONFIRMED" ? (
                    <Button
                      disabled={pending !== null}
                      onClick={() => decide("CANCELLED")}
                      size="sm"
                      variant="ghost"
                    >
                      Annuler la réservation
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Journal</CardTitle>
            <CardDescription>
              Qui a décidé quoi, et à quel moment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-4">
              {events.map((event) => (
                <li className="flex gap-3" key={event.id}>
                  <span
                    aria-hidden
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                  />
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">
                        {event.actorName ?? "Site public"}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {event.toStatus === "PENDING"
                          ? "a reçu la demande"
                          : `→ ${RESERVATION_STATUS_LABELS[event.toStatus].toLocaleLowerCase("fr-FR")}`}
                      </span>
                    </p>
                    {event.note ? (
                      <p className="mt-0.5 text-muted-foreground text-xs">
                        « {event.note} »
                      </p>
                    ) : null}
                    <p className="text-muted-foreground text-xs">
                      {formatRelative(event.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Separator className="my-4" />
            <dl className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Demande reçue</dt>
                <dd>{formatDateTime(reservation.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Consentement RGPD</dt>
                <dd>{formatDateTime(reservation.consentAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Couverts</dt>
                <dd className="flex items-center gap-1">
                  <UsersIcon className="size-3" />
                  {reservation.partySize}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
