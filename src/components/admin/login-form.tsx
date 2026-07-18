import { Form, Field as FormischField, type SubmitHandler, useForm } from "@formisch/react";
import { LogInIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as v from "valibot";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email("Adresse email invalide.")),
  password: v.pipe(v.string(), v.minLength(12, "Le mot de passe contient au moins 12 caractères.")),
});

export function LoginForm() {
  const [pending, setPending] = useState(false);
  const form = useForm({ schema: LoginSchema, initialInput: { email: "", password: "" } });
  const submit: SubmitHandler<typeof LoginSchema> = async (output) => {
    setPending(true);
    const result = await authClient.signIn.email(output);
    setPending(false);
    if (result.error) {
      toast.error("Connexion refusée", {
        description: "Vérifiez votre email et votre mot de passe.",
      });
      return;
    }
    window.location.href = "/admin";
  };

  return (
    <Form className="flex flex-col gap-6" of={form} onSubmit={submit}>
      <FieldGroup>
        <FormischField of={form} path={["email"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                {...field.props}
                aria-invalid={field.errors !== null}
                autoComplete="email"
                id="login-email"
                type="email"
                value={field.input ?? ""}
              />
              {field.errors ? (
                <FieldError errors={field.errors.map((message) => ({ message }))} />
              ) : null}
            </Field>
          )}
        </FormischField>
        <FormischField of={form} path={["password"]}>
          {(field) => (
            <Field data-invalid={field.errors !== null}>
              <FieldLabel htmlFor="login-password">Mot de passe</FieldLabel>
              <Input
                {...field.props}
                aria-invalid={field.errors !== null}
                autoComplete="current-password"
                id="login-password"
                type="password"
                value={field.input ?? ""}
              />
              {field.errors ? (
                <FieldError errors={field.errors.map((message) => ({ message }))} />
              ) : null}
            </Field>
          )}
        </FormischField>
      </FieldGroup>
      <Button disabled={pending} size="lg" type="submit">
        {pending ? <Spinner data-icon="inline-start" /> : <LogInIcon data-icon="inline-start" />}
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </Form>
  );
}
