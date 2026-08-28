import * as Data from "effect4/Data";
import * as Effect from "effect4/Effect";
import * as v from "valibot";

export const AuthClientErrorSchema = v.object({
  cause: v.optional(v.unknown()),
  status: v.number(),
});

type AuthClientErrorFields = v.InferOutput<typeof AuthClientErrorSchema>;

export class AuthClientError extends Data.TaggedError(
  "AuthClientError"
)<AuthClientErrorFields> {
  constructor(input: AuthClientErrorFields) {
    super(v.parse(AuthClientErrorSchema, input));
  }
}

function postAuth<T>(path: string, body?: object) {
  return Effect.tryPromise((signal) =>
    fetch(`/api/auth/${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include",
      headers:
        body === undefined ? undefined : { "content-type": "application/json" },
      method: "POST",
      signal,
    })
  )
    .pipe(
      Effect.mapError((cause) => new AuthClientError({ cause, status: 0 })),
      Effect.flatMap((response) =>
        response.ok
          ? Effect.tryPromise(() => response.json() as Promise<T>).pipe(
              Effect.mapError(
                (cause) =>
                  new AuthClientError({ cause, status: response.status })
              )
            )
          : Effect.fail(new AuthClientError({ status: response.status }))
      )
    )
    .pipe(Effect.withSpan("AuthClient.post"));
}

export const authClient = {
  signIn: {
    email: Effect.fn("AuthClient.signIn.email")(
      (input: { email: string; password: string }) =>
        postAuth<unknown>("sign-in/email", input)
    ),
    social: Effect.fn("AuthClient.signIn.social")(
      (input: { provider: "google" }) =>
        postAuth<{ url?: string }>("sign-in/social", {
          callbackURL: "/admin",
          provider: input.provider,
        }).pipe(
          Effect.tap((result) =>
            result.url
              ? Effect.sync(() => window.location.assign(result.url as string))
              : Effect.void
          )
        )
    ),
  },
  signOut: Effect.fn("AuthClient.signOut")(() => postAuth("sign-out")),
};
