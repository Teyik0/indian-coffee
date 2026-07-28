interface AuthError {
  status: number;
}

interface AuthResult<T> {
  data: T | null;
  error: AuthError | null;
}

async function postAuth<T>(
  path: string,
  body?: object
): Promise<AuthResult<T>> {
  const response = await fetch(`/api/auth/${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
    headers:
      body === undefined ? undefined : { "content-type": "application/json" },
    method: "POST",
  });
  if (!response.ok) {
    return { data: null, error: { status: response.status } };
  }
  return {
    data: (await response.json()) as T,
    error: null,
  };
}

export const authClient = {
  signIn: {
    email(input: { email: string; password: string }) {
      return postAuth("sign-in/email", input);
    },
    async social(input: { provider: "google" }) {
      const result = await postAuth<{ url?: string }>("sign-in/social", {
        callbackURL: "/admin",
        provider: input.provider,
      });
      if (result.data?.url) {
        window.location.assign(result.data.url);
      }
      return result;
    },
  },
  signOut() {
    return postAuth("sign-out");
  },
};
