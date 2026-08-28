import { useSync } from "@teyik0/furin/client";
import { CheckIcon, SendIcon } from "lucide-react";
import type { SubmitEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  ReservationAvailability,
  ReservationServiceRange,
  ReservationSlot,
} from "@/api/modules/reservations/model";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { api, apiErrorMessage } from "@/lib/api-client";
import { formatIsoDay, toIsoDay } from "@/lib/format";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const NON_DIGIT_PATTERN = /\D/g;

interface CalendarDay {
  day: string;
  exceptionLabel: string | null;
  isClosed: boolean;
  opensAt: string | null;
}

function isoDayToLocalDate(isoDay: string) {
  const [year, month, day] = isoDay.split("-").map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

function localDateToIsoDay(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function formatTime(time: string) {
  return time.replace(":", "h");
}

function formatServiceLabel(service: ReservationServiceRange) {
  const hours = `${formatTime(service.opensAt)} — ${formatTime(service.closesAt)}`;
  return service.label ? `${service.label} · ${hours}` : hours;
}

function RequiredLabel({ children }: { children: string }) {
  return (
    <span>
      {children}
      {" "}
      <span aria-hidden="true" className="text-primary">
        *
      </span>
    </span>
  );
}

function isSlotInService(
  slot: ReservationSlot,
  service: ReservationServiceRange
) {
  const minute = timeToMinutes(slot.time);
  return (
    minute >= timeToMinutes(service.opensAt) &&
    minute < timeToMinutes(service.closesAt)
  );
}

export interface ReservationCalendar {
  days: CalendarDay[];
  from: string;
  horizonDays: number;
  maxPartySize: number;
  slotMinutes: number;
}

type FieldName =
  | "fullName"
  | "email"
  | "phone"
  | "partySize"
  | "requestedDate"
  | "requestedTime"
  | "consent";

type FieldErrors = Partial<Record<FieldName, string>>;

function useReservationForm(calendar: ReservationCalendar) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [availability, setAvailability] =
    useState<ReservationAvailability | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Normalisation à la frontière : les bornes de l'input `date` et la détection
  // des jours fermés comparent des chaînes, qui doivent avoir la même forme.
  const days = calendar.days.map((day) => ({ ...day, day: toIsoDay(day.day) }));
  const openDays = days.filter((day) => !day.isClosed);
  const minDay = days[0]?.day ?? "";
  const maxDay = days.at(-1)?.day ?? "";
  const selectedDay = days.find((day) => day.day === requestedDate);
  const requestedDateValue = requestedDate
    ? isoDayToLocalDate(requestedDate)
    : undefined;
  const minDate = minDay ? isoDayToLocalDate(minDay) : undefined;
  const maxDate = maxDay ? isoDayToLocalDate(maxDay) : undefined;
  const closedDates = days.flatMap((day) =>
    day.isClosed ? [isoDayToLocalDate(day.day)] : []
  );
  const handleDateChange = useCallback((date: Date | undefined) => {
    setRequestedDate(date ? localDateToIsoDay(date) : "");
  }, []);
  const handleTimeChange = useCallback((value: string | null) => {
    setRequestedTime(value ?? "");
  }, []);

  const createReservation = useSync(
    (
      input: {
        fullName: string;
        email: string;
        phone: string;
        partySize: number;
        requestedDate: string;
        requestedTime: string;
        occasion: string;
        message: string;
        consent: boolean;
        website: string;
      },
      options
    ) => api.api.reservations.post(input, { headers: { ...options.headers } })
  );

  // Les créneaux dépendent de la date : rechargés à chaque changement.
  useEffect(() => {
    if (!requestedDate) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setRequestedTime("");
    api.api.reservations.availability
      .get({ query: { date: requestedDate } })
      .then(({ data }) => {
        if (cancelled) {
          return;
        }
        setAvailability((data as ReservationAvailability | null) ?? null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [requestedDate]);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (fullName.trim().length < 2) {
      next.fullName = "Indiquez votre nom.";
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Indiquez une adresse email valide.";
    }
    if (phone.replace(NON_DIGIT_PATTERN, "").length < 9) {
      next.phone = "Indiquez un numéro de téléphone joignable.";
    }
    const size = Number(partySize);
    if (!Number.isInteger(size) || size < 1) {
      next.partySize = "Indiquez le nombre de convives.";
    } else if (size > calendar.maxPartySize) {
      next.partySize = `Au-delà de ${calendar.maxPartySize} personnes, appelez-nous.`;
    }
    if (!requestedDate) {
      next.requestedDate = "Choisissez une date.";
    } else if (selectedDay?.isClosed) {
      next.requestedDate =
        selectedDay.exceptionLabel ?? "Nous sommes fermés ce jour-là.";
    }
    if (!requestedTime) {
      next.requestedTime = "Choisissez un créneau.";
    }
    if (!consent) {
      next.consent = "Votre accord est nécessaire.";
    }
    return next;
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    setPending(true);
    const { data, error } = await createReservation({
      consent,
      email: email.trim(),
      fullName: fullName.trim(),
      message: message.trim(),
      occasion: occasion.trim(),
      partySize: Number(partySize),
      phone: phone.trim(),
      requestedDate,
      requestedTime,
      website: honeypot,
    });
    setPending(false);

    if (error || !data || !("reservation" in data)) {
      toast.error("Envoi impossible", {
        description: apiErrorMessage(
          error,
          "La demande n’a pas pu être envoyée. Appelez-nous si cela persiste."
        ),
      });
      return;
    }
    setReference(data.reservation.reference);
    toast.success("Demande envoyée", { description: data.message });
  }

  const slots = availability?.slots ?? [];
  const availableSlots = slots.filter((slot) => slot.isAvailable);
  const slotGroups = (availability?.services ?? []).flatMap((service) => {
    const serviceSlots = slots.filter((slot) => isSlotInService(slot, service));
    return serviceSlots.length > 0 ? [{ service, slots: serviceSlots }] : [];
  });
  const slotItems = slots.map((slot) => ({
    label: formatTime(slot.time),
    value: slot.time,
  }));
  let slotPlaceholder = "Choisissez une date";
  if (requestedDate) {
    if (loadingSlots) {
      slotPlaceholder = "Chargement…";
    } else if (availableSlots.length === 0) {
      slotPlaceholder = "Aucun créneau";
    } else {
      slotPlaceholder = "Choisir";
    }
  }

  return {
    availability,
    availableSlots,
    calendar,
    closedDates,
    consent,
    email,
    errors,
    fullName,
    handleDateChange,
    handleTimeChange,
    honeypot,
    loadingSlots,
    maxDate,
    message,
    minDate,
    occasion,
    openDays,
    partySize,
    pending,
    phone,
    reference,
    requestedDate,
    requestedDateValue,
    requestedTime,
    setConsent,
    setEmail,
    setFullName,
    setHoneypot,
    setMessage,
    setOccasion,
    setPartySize,
    setPhone,
    slotGroups,
    slotItems,
    slotPlaceholder,
    submit,
  };
}

export function ReservationForm({
  calendar,
}: {
  calendar: ReservationCalendar;
}) {
  const form = useReservationForm(calendar);
  return form.reference ? (
    <ReservationSuccess reference={form.reference} />
  ) : (
    renderReservationForm(form)
  );
}

function ReservationSuccess({ reference }: { reference: string }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-xl bg-secondary/60 p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-leaf text-primary-foreground">
        <CheckIcon />
      </span>
      <div>
        <h2 className="font-display text-3xl">Demande bien reçue</h2>
        <p className="mt-2 text-muted-foreground">
          Référence : <strong className="font-mono">{reference}</strong>
        </p>
      </div>
      <p className="max-w-md">
        Votre table n’est pas encore réservée : notre équipe confirme la demande
        par courriel, en général dans la journée.
      </p>
    </div>
  );
}

function renderReservationForm({
  availability,
  availableSlots,
  calendar,
  closedDates,
  consent,
  email,
  errors,
  fullName,
  handleDateChange,
  handleTimeChange,
  honeypot,
  loadingSlots,
  maxDate,
  message,
  minDate,
  occasion,
  openDays,
  partySize,
  pending,
  phone,
  requestedDate,
  requestedDateValue,
  requestedTime,
  setConsent,
  setEmail,
  setFullName,
  setHoneypot,
  setMessage,
  setOccasion,
  setPartySize,
  setPhone,
  slotGroups,
  slotItems,
  slotPlaceholder,
  submit,
}: ReturnType<typeof useReservationForm>) {
  return (
    <form className="flex flex-col gap-7" onSubmit={submit}>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.fullName)}>
            <FieldLabel htmlFor="reservation-name">
              <RequiredLabel>Nom complet</RequiredLabel>
            </FieldLabel>
            <Input
              aria-invalid={Boolean(errors.fullName)}
              autoComplete="name"
              id="reservation-name"
              onChange={(event) => setFullName(event.currentTarget.value)}
              required
              value={fullName}
            />
            {errors.fullName ? (
              <FieldError errors={[{ message: errors.fullName }]} />
            ) : null}
          </Field>

          <Field data-invalid={Boolean(errors.phone)}>
            <FieldLabel htmlFor="reservation-phone">
              <RequiredLabel>Téléphone</RequiredLabel>
            </FieldLabel>
            <Input
              aria-invalid={Boolean(errors.phone)}
              autoComplete="tel"
              id="reservation-phone"
              onChange={(event) => setPhone(event.currentTarget.value)}
              required
              type="tel"
              value={phone}
            />
            {errors.phone ? (
              <FieldError errors={[{ message: errors.phone }]} />
            ) : null}
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="reservation-email">
            <RequiredLabel>Email</RequiredLabel>
          </FieldLabel>
          <Input
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            id="reservation-email"
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
            type="email"
            value={email}
          />
          <FieldDescription>
            La confirmation vous sera envoyée à cette adresse.
          </FieldDescription>
          {errors.email ? (
            <FieldError errors={[{ message: errors.email }]} />
          ) : null}
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field data-invalid={Boolean(errors.partySize)}>
            <FieldLabel htmlFor="reservation-size">
              <RequiredLabel>Personnes</RequiredLabel>
            </FieldLabel>
            <Input
              aria-invalid={Boolean(errors.partySize)}
              id="reservation-size"
              max={calendar.maxPartySize}
              min="1"
              onChange={(event) => setPartySize(event.currentTarget.value)}
              required
              type="number"
              value={partySize}
            />
            {errors.partySize ? (
              <FieldError errors={[{ message: errors.partySize }]} />
            ) : null}
          </Field>

          <Field data-invalid={Boolean(errors.requestedDate)}>
            <FieldLabel htmlFor="reservation-date">
              <RequiredLabel>Date</RequiredLabel>
            </FieldLabel>
            <DatePicker
              aria-invalid={Boolean(errors.requestedDate)}
              date={requestedDateValue}
              disabledDates={closedDates}
              id="reservation-date"
              maxDate={maxDate}
              minDate={minDate}
              onDateChange={handleDateChange}
              placeholder="Choisir une date"
            />
            <FieldDescription>
              Les jours fermés ne peuvent pas être sélectionnés.
            </FieldDescription>
            {errors.requestedDate ? (
              <FieldError errors={[{ message: errors.requestedDate }]} />
            ) : null}
          </Field>

          <Field data-invalid={Boolean(errors.requestedTime)}>
            <FieldLabel htmlFor="reservation-time">
              <RequiredLabel>Créneau</RequiredLabel>
            </FieldLabel>
            <Select
              disabled={
                !requestedDate || loadingSlots || availableSlots.length === 0
              }
              items={slotItems}
              onValueChange={handleTimeChange}
              value={requestedTime || null}
            >
              <SelectTrigger
                aria-invalid={Boolean(errors.requestedTime)}
                className="w-full"
                id="reservation-time"
              >
                <SelectValue placeholder={slotPlaceholder} />
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className="maison-madras-overlay max-h-72"
              >
                {slotGroups.map(({ service, slots: serviceSlots }) => (
                  <SelectGroup key={`${service.opensAt}-${service.closesAt}`}>
                    <SelectLabel>{formatServiceLabel(service)}</SelectLabel>
                    {serviceSlots.map((slot) => (
                      <SelectItem
                        disabled={!slot.isAvailable}
                        key={slot.time}
                        value={slot.time}
                      >
                        {formatTime(slot.time)}
                        {slot.isAvailable && slot.remaining <= 8 ? (
                          <span className="ml-2 text-muted-foreground text-xs">
                            {slot.remaining} places
                          </span>
                        ) : null}
                        {slot.isAvailable ? null : (
                          <span className="ml-2 text-muted-foreground text-xs">
                            complet
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {errors.requestedTime ? (
              <FieldError errors={[{ message: errors.requestedTime }]} />
            ) : null}
          </Field>
        </div>

        {/* Message explicite quand la date choisie est fermée, au lieu d'un
            refus découvert après envoi. */}
        {requestedDate && availability?.isClosed ? (
          <Alert>
            <AlertTitle>Fermé le {formatIsoDay(requestedDate)}</AlertTitle>
            <AlertDescription>
              {availability.exception?.label ??
                "Nous n’assurons pas de service ce jour-là."}
              {openDays[0]
                ? ` Prochaine date disponible : ${formatIsoDay(openDays[0].day)}.`
                : null}
            </AlertDescription>
          </Alert>
        ) : null}

        <Field>
          <FieldLabel htmlFor="reservation-occasion">
            Occasion{" "}
            <span className="font-normal text-muted-foreground">
              (facultatif)
            </span>
          </FieldLabel>
          <Input
            id="reservation-occasion"
            onChange={(event) => setOccasion(event.currentTarget.value)}
            placeholder="Anniversaire, dîner en famille…"
            value={occasion}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="reservation-message">
            Votre message{" "}
            <span className="font-normal text-muted-foreground">
              (facultatif)
            </span>
          </FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id="reservation-message"
              onChange={(event) => setMessage(event.currentTarget.value)}
              placeholder="Allergies, poussette, table calme…"
              rows={4}
              value={message}
            />
          </InputGroup>
          <FieldDescription>
            Allergies et contraintes : l’équipe en tient compte en salle.
          </FieldDescription>
        </Field>

        <Field data-invalid={Boolean(errors.consent)} orientation="horizontal">
          <Checkbox
            aria-invalid={Boolean(errors.consent)}
            checked={consent}
            id="reservation-consent"
            onCheckedChange={(checked) => setConsent(Boolean(checked))}
          />
          <div>
            <FieldLabel htmlFor="reservation-consent">
              <RequiredLabel>
                J’accepte que mes informations soient utilisées pour traiter
                cette réservation.
              </RequiredLabel>
            </FieldLabel>
            <FieldDescription>
              Conservation douze mois, aucune revente. Voir la{" "}
              <a className="underline underline-offset-2" href="/privacy">
                politique de confidentialité
              </a>
              .
            </FieldDescription>
            {errors.consent ? (
              <FieldError errors={[{ message: errors.consent }]} />
            ) : null}
          </div>
        </Field>

        {/* Piège à robots : invisible et hors de l'ordre de tabulation. */}
        <input
          aria-hidden="true"
          className="hidden"
          onChange={(event) => setHoneypot(event.currentTarget.value)}
          tabIndex={-1}
          value={honeypot}
        />
      </FieldGroup>

      {/* Récapitulatif : le client relit sa demande avant de l'envoyer. */}
      {requestedDate && requestedTime ? (
        <div className="rounded-lg border bg-secondary/40 p-4 text-sm">
          <strong>Votre demande :</strong> {formatIsoDay(requestedDate)} à{" "}
          {requestedTime.replace(":", "h")} pour {partySize} personne
          {Number(partySize) > 1 ? "s" : ""}.
        </div>
      ) : null}

      <Button disabled={pending} size="lg" type="submit">
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <SendIcon data-icon="inline-start" />
        )}
        {pending ? "Envoi en cours…" : "Envoyer ma demande"}
      </Button>
    </form>
  );
}
