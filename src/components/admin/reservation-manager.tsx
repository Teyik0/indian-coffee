import { CheckIcon, XIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ReservationAdminView } from "@/api/modules/reservations/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, apiErrorMessage } from "@/lib/api-client";

const reservationDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Europe/Paris",
});

function formatReservationDate(value: Date | string) {
  const parts = Object.fromEntries(
    reservationDateFormatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]),
  );
  return `${parts.day}/${parts.month}/${parts.year} · ${parts.hour}:${parts.minute}`;
}

export function ReservationManager({
  initialReservations,
}: {
  initialReservations: ReservationAdminView[];
}) {
  const [reservationsList, setReservationsList] = useState(initialReservations);
  const [pending, startTransition] = useTransition();

  function changeStatus(reservation: ReservationAdminView, status: "CONFIRMED" | "DECLINED") {
    startTransition(async () => {
      const { data, error } = await api.api.admin
        .reservations({ id: reservation.id })
        .status.patch({
          status,
          adminNote: "",
          version: reservation.version,
        });
      if (error || !data || !("id" in data)) {
        toast.error("Mise à jour impossible", {
          description: apiErrorMessage(error, "Rechargez les réservations puis réessayez."),
        });
        return;
      }
      setReservationsList((current) => current.map((item) => (item.id === data.id ? data : item)));
      toast.success(status === "CONFIRMED" ? "Réservation confirmée" : "Demande refusée");
    });
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Pers.</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservationsList.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-mono text-xs">{reservation.reference}</TableCell>
                <TableCell>
                  <strong>{reservation.fullName}</strong>
                  <span className="block text-muted-foreground text-xs">{reservation.phone}</span>
                </TableCell>
                <TableCell>{formatReservationDate(reservation.requestedAt)}</TableCell>
                <TableCell>{reservation.partySize}</TableCell>
                <TableCell>
                  <Badge variant={reservation.status === "PENDING" ? "outline" : "secondary"}>
                    {reservation.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {reservation.status === "PENDING" ? (
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
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reservationsList.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">
            Aucune réservation pour le moment.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
