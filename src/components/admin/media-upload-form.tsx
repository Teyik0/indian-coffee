import {
  Form,
  Field as FormischField,
  type SubmitHandler,
  useForm,
} from "@formisch/react";
import * as Effect from "effect4/Effect";
import { ImageUpIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as v from "valibot";
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

const MediaUploadFormSchema = v.object({
  alt: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(3, "La description contient au moins 3 caractères."),
    v.maxLength(180, "La description contient au maximum 180 caractères.")
  ),
  file: v.pipe(
    v.file("Sélectionnez une image valide."),
    v.mimeType(
      ["image/jpeg", "image/png", "image/webp", "image/avif"],
      "Format d’image non pris en charge."
    ),
    v.maxSize(15 * 1024 * 1024, "L’image ne doit pas dépasser 15 Mo.")
  ),
});

export function MediaUploadForm() {
  const [pending, setPending] = useState(false);
  const form = useForm({
    initialInput: { alt: "" },
    schema: MediaUploadFormSchema,
  });

  const submit: SubmitHandler<typeof MediaUploadFormSchema> = (output) => {
    setPending(true);

    const program = Effect.gen(function* () {
      const { data, error } = yield* Effect.tryPromise(() =>
        api.api.admin.media.post(output)
      );
      if (error || !data) {
        return {
          _tag: "UploadFailed" as const,
          error,
        };
      }

      // L'upload ne créait que le média : l'image n'entrait jamais dans la
      // galerie et restait donc invisible partout.
      const entry = yield* Effect.tryPromise(() =>
        api.api.admin.gallery.post({
          caption: "",
          collectionSlug: "restaurant",
          mediaId: data.id,
        })
      );
      return entry.error
        ? { _tag: "PublishFailed" as const, error: entry.error }
        : { _tag: "Success" as const };
    }).pipe(
      Effect.match({
        onFailure: () => ({ _tag: "UploadFailed" as const, error: null }),
        onSuccess: (result) => result,
      }),
      Effect.tap((result) =>
        Effect.sync(() => {
          setPending(false);
          if (result._tag === "UploadFailed") {
            toast.error("Upload impossible", {
              description: apiErrorMessage(
                result.error,
                "L’image n’a pas pu être envoyée."
              ),
            });
          } else if (result._tag === "PublishFailed") {
            toast.warning("Image envoyée, mais non publiée", {
              description: apiErrorMessage(
                result.error,
                "Ajoutez-la à la galerie depuis la liste."
              ),
            });
          } else {
            toast.success("Image ajoutée à la galerie", {
              description:
                "Rechargez la page pour la voir apparaître dans la grille.",
            });
          }
        })
      )
    );
    Effect.runPromise(program);
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
                Lue par les lecteurs d’écran et indexée par les moteurs.
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
                15 Mo maximum. Trois WebP et un aperçu flouté seront générés.
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
