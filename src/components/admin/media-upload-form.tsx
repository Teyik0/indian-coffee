import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import { ImageUpIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MediaUploadSchema } from "@/api/modules/media/model";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, apiErrorMessage } from "@/lib/api-client";

export function MediaUploadForm() {
  const [pending, setPending] = useState(false);
  const form = useForm({
    schema: MediaUploadSchema,
    initialInput: { alt: "" },
  });
  const submit: SubmitHandler<typeof MediaUploadSchema> = async (output) => {
    setPending(true);
    const { error } = await api.api.admin.media.post(output);
    setPending(false);
    if (error) {
      toast.error("Upload impossible", {
        description: apiErrorMessage(error, "L’image n’a pas pu être envoyée."),
      });
      return;
    }
    toast.success("Image optimisée et enregistrée");
  };

  return (
    <Form className="flex flex-col gap-6" of={form} onSubmit={submit}>
      <FieldGroup>
        <FormischField of={form} path={["alt"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="media-alt">
                Description accessible
              </FieldLabel>
              <Input
                {...field.props}
                aria-invalid={field.errors !== null}
                id="media-alt"
                placeholder="Butter chicken servi dans un bol en cuivre"
                value={field.input ?? ""}
              />
              <FieldDescription>
                Décrivez ce que montre la photo.
              </FieldDescription>
              {field.errors ? (
                <FieldError
                  errors={field.errors.map((message) => ({ message }))}
                />
              ) : null}
            </Field>
          )}
        </FormischField>
        <FormischField of={form} path={["file"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="media-file">Fichier image</FieldLabel>
              <Input
                accept="image/*"
                aria-invalid={field.errors !== null}
                id="media-file"
                onChange={(event) =>
                  field.onChange(event.currentTarget.files?.[0])
                }
                type="file"
              />
              <FieldDescription>
                15 Mo maximum. Trois WebP et un placeholder seront générés.
              </FieldDescription>
              {field.errors ? (
                <FieldError
                  errors={field.errors.map((message) => ({ message }))}
                />
              ) : null}
            </Field>
          )}
        </FormischField>
      </FieldGroup>
      <Button disabled={pending} type="submit">
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <ImageUpIcon data-icon="inline-start" />
        )}
        {pending ? "Optimisation…" : "Envoyer l’image"}
      </Button>
    </Form>
  );
}
