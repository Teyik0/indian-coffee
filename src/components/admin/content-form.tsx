import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  setInput,
  useForm,
} from "@formisch/react";
import { useSync } from "@teyik0/furin/client";
import { SaveIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { InferOutput } from "valibot";
import {
  type SiteContent,
  SiteSettingsSchema,
} from "@/api/modules/content/model";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { api, apiErrorMessage } from "@/lib/api-client";

type SiteSettingsInput = InferOutput<typeof SiteSettingsSchema>;

export function ContentForm({
  initialContent,
}: {
  initialContent: SiteContent;
}) {
  const [pending, setPending] = useState(false);
  const saveContent = useSync((input: SiteSettingsInput, options) =>
    api.api.admin.content.settings.patch(input, {
      headers: { ...options.headers },
    }),
  );
  const form = useForm({
    schema: SiteSettingsSchema,
    initialInput: {
      restaurantName: initialContent.restaurantName,
      tagline: initialContent.tagline,
      phone: initialContent.phone,
      email: initialContent.email,
      addressLine: initialContent.addressLine,
      postalCode: initialContent.postalCode,
      city: initialContent.city,
      mapUrl: initialContent.mapUrl,
      instagramUrl: initialContent.instagramUrl,
      facebookUrl: initialContent.facebookUrl,
      reservationNotice: initialContent.reservationNotice,
      version: initialContent.version,
    },
  });

  const submit: SubmitHandler<typeof SiteSettingsSchema> = async (output) => {
    setPending(true);
    const { data, error } = await saveContent(output);
    setPending(false);
    if (error) {
      toast.error("Enregistrement impossible", {
        description: apiErrorMessage(
          error,
          "Réessayez après avoir rechargé le contenu.",
        ),
      });
      return;
    }
    if (data && "version" in data) {
      setInput(form, { path: ["version"], input: data.version });
    }
    toast.success("Contenu enregistré");
  };

  return (
    <Form of={form} onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>Informations du restaurant</CardTitle>
          <CardDescription>
            Ces informations apparaissent sur le site et la page de réservation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 md:grid-cols-2">
              <FormischField of={form} path={["restaurantName"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="content-name">Nom</FieldLabel>
                    <Input
                      {...field.props}
                      aria-invalid={field.errors !== null}
                      id="content-name"
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
                    <FieldLabel htmlFor="content-phone">Téléphone</FieldLabel>
                    <Input
                      {...field.props}
                      aria-invalid={field.errors !== null}
                      id="content-phone"
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
            <FormischField of={form} path={["tagline"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="content-tagline">
                    Phrase de présentation
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field.props}
                      aria-invalid={field.errors !== null}
                      id="content-tagline"
                      rows={3}
                      value={field.input ?? ""}
                    />
                  </InputGroup>
                  {field.errors ? (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  ) : null}
                </Field>
              )}
            </FormischField>
            <div className="grid gap-5 md:grid-cols-2">
              <FormischField of={form} path={["email"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="content-email">Email</FieldLabel>
                    <Input
                      {...field.props}
                      aria-invalid={field.errors !== null}
                      id="content-email"
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
              <FormischField of={form} path={["addressLine"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="content-address">Adresse</FieldLabel>
                    <Input
                      {...field.props}
                      aria-invalid={field.errors !== null}
                      id="content-address"
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
            <FormischField of={form} path={["reservationNotice"]}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="content-notice">
                    Message de réservation
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field.props}
                      aria-invalid={field.errors !== null}
                      id="content-notice"
                      rows={3}
                      value={field.input ?? ""}
                    />
                  </InputGroup>
                  {field.errors ? (
                    <FieldError
                      errors={field.errors.map((message) => ({ message }))}
                    />
                  ) : null}
                </Field>
              )}
            </FormischField>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button disabled={pending} type="submit">
            {pending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SaveIcon data-icon="inline-start" />
            )}
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
}
