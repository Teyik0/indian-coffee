import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { useSync } from "@teyik0/furin/client";
import { CheckIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { InferOutput } from "valibot";
import { ReservationCreateSchema } from "@/api/modules/reservations/model";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { api, apiErrorMessage } from "@/lib/api-client";

type ReservationInput = InferOutput<typeof ReservationCreateSchema>;

export function ReservationForm() {
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const createReservation = useSync((input: ReservationInput, options) =>
    api.api.reservations.post(input, {
      headers: { ...options.headers },
    }),
  );
  const form = useForm({
    schema: ReservationCreateSchema,
    initialInput: {
      fullName: "",
      email: "",
      phone: "",
      partySize: "2",
      requestedDate: "",
      requestedTime: "19:30",
      occasion: "",
      message: "",
      consent: false,
      website: "",
    },
    validate: "blur",
    revalidate: "input",
  });

  const handleSubmit: SubmitHandler<typeof ReservationCreateSchema> = async (
    output,
  ) => {
    setPending(true);
    try {
      const { data, error } = await createReservation(output);
      if (error || !data || !("reservation" in data)) {
        throw new Error(
          apiErrorMessage(error, "La demande n’a pas pu être envoyée."),
        );
      }
      setReference(data.reservation.reference);
      toast.success("Demande envoyée", { description: data.message });
    } catch (error) {
      toast.error("Envoi impossible", {
        description:
          error instanceof Error
            ? error.message
            : "Réessayez dans quelques instants.",
      });
    } finally {
      setPending(false);
    }
  };

  if (reference) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-xl bg-secondary/60 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-leaf text-primary-foreground">
          <CheckIcon />
        </span>
        <div>
          <h2 className="font-display text-3xl">Demande bien reçue</h2>
          <p className="mt-2 text-muted-foreground">
            Référence : <strong>{reference}</strong>
          </p>
        </div>
        <p className="max-w-md">
          Votre table sera réservée après confirmation personnelle de notre
          équipe.
        </p>
      </div>
    );
  }

  return (
    <Form className="flex flex-col gap-7" of={form} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormischField of={form} path={["fullName"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="reservation-name">Nom complet</FieldLabel>
                <Input
                  {...field.props}
                  aria-invalid={field.errors !== null}
                  autoComplete="name"
                  id="reservation-name"
                  value={field.input ?? ""}
                />
                {field.errors ? (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                  />
                ) : null}
              </Field>
            )}
          </FormischField>
          <FormischField of={form} path={["phone"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="reservation-phone">Téléphone</FieldLabel>
                <Input
                  {...field.props}
                  aria-invalid={field.errors !== null}
                  autoComplete="tel"
                  id="reservation-phone"
                  type="tel"
                  value={field.input ?? ""}
                />
                {field.errors ? (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                  />
                ) : null}
              </Field>
            )}
          </FormischField>
        </div>

        <FormischField of={form} path={["email"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="reservation-email">Email</FieldLabel>
              <Input
                {...field.props}
                aria-invalid={field.errors !== null}
                autoComplete="email"
                id="reservation-email"
                type="email"
                value={field.input ?? ""}
              />
              {field.errors ? (
                <FieldError
                  errors={field.errors.map((message) => ({ message }))}
                />
              ) : null}
            </Field>
          )}
        </FormischField>

        <div className="grid gap-5 sm:grid-cols-3">
          <FormischField of={form} path={["partySize"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="reservation-size">Personnes</FieldLabel>
                <Input
                  {...field.props}
                  aria-invalid={field.errors !== null}
                  id="reservation-size"
                  max="20"
                  min="1"
                  type="number"
                  value={String(field.input ?? "2")}
                />
                {field.errors ? (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                  />
                ) : null}
              </Field>
            )}
          </FormischField>
          <FormischField of={form} path={["requestedDate"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="reservation-date">Date</FieldLabel>
                <Input
                  {...field.props}
                  aria-invalid={field.errors !== null}
                  id="reservation-date"
                  type="date"
                  value={field.input ?? ""}
                />
                {field.errors ? (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                  />
                ) : null}
              </Field>
            )}
          </FormischField>
          <FormischField of={form} path={["requestedTime"]}>
            {(field) => (
              <Field data-invalid={field.errors !== null}>
                <FieldLabel htmlFor="reservation-time">Horaire</FieldLabel>
                <Input
                  {...field.props}
                  aria-invalid={field.errors !== null}
                  id="reservation-time"
                  step="900"
                  type="time"
                  value={field.input ?? ""}
                />
                {field.errors ? (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                  />
                ) : null}
              </Field>
            )}
          </FormischField>
        </div>

        <FormischField of={form} path={["occasion"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="reservation-occasion">
                Occasion{" "}
                <span className="font-normal text-muted-foreground">
                  (facultatif)
                </span>
              </FieldLabel>
              <Input
                {...field.props}
                aria-invalid={field.errors !== null}
                id="reservation-occasion"
                placeholder="Anniversaire, dîner en famille…"
                value={field.input ?? ""}
              />
            </Field>
          )}
        </FormischField>

        <FormischField of={form} path={["message"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="reservation-message">
                Votre message{" "}
                <span className="font-normal text-muted-foreground">
                  (facultatif)
                </span>
              </FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  {...field.props}
                  aria-invalid={field.errors !== null}
                  id="reservation-message"
                  rows={4}
                  value={field.input ?? ""}
                />
              </InputGroup>
            </Field>
          )}
        </FormischField>

        <FormischField of={form} path={["consent"]}>
          {(field) => (
            <Field
              data-invalid={field.errors !== null}
              orientation="horizontal"
            >
              <Checkbox
                aria-invalid={field.errors !== null}
                checked={field.input ?? false}
                id="reservation-consent"
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              />
              <div>
                <FieldLabel htmlFor="reservation-consent">
                  J’accepte que mes informations soient utilisées pour traiter
                  cette réservation.
                </FieldLabel>
                <FieldDescription>
                  Vos données ne sont ni revendues ni utilisées à des fins
                  publicitaires.
                </FieldDescription>
                {field.errors ? (
                  <FieldError
                    errors={field.errors.map((message) => ({ message }))}
                  />
                ) : null}
              </div>
            </Field>
          )}
        </FormischField>

        <FormischField of={form} path={["website"]}>
          {(field) => (
            <Input
              {...field.props}
              aria-hidden="true"
              className="hidden"
              tabIndex={-1}
              value={field.input ?? ""}
            />
          )}
        </FormischField>
      </FieldGroup>

      <Button disabled={pending} size="lg" type="submit">
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <SendIcon data-icon="inline-start" />
        )}
        {pending ? "Envoi en cours…" : "Envoyer ma demande"}
      </Button>
    </Form>
  );
}
