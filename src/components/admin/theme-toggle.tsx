import { MoonIcon, SunIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export type AdminTheme = "light" | "dark";

export const THEME_COOKIE = "ic-admin-theme";

/**
 * Le thème est écrit dans un cookie *et* dans `localStorage` : le cookie permet
 * au rendu serveur de poser la bonne classe dès la première réponse, ce qui
 * évite le flash clair au chargement.
 */
async function persist(theme: AdminTheme) {
  const year = 60 * 60 * 24 * 365;
  // `cookieStore` quand il existe : l'affectation directe de `document.cookie`
  // écrase silencieusement en cas d'écritures concurrentes.
  const store = (
    window as typeof window & {
      cookieStore?: {
        set: (options: Record<string, unknown>) => Promise<void>;
      };
    }
  ).cookieStore;
  if (store) {
    await store.set({
      expires: Date.now() + year * 1000,
      name: THEME_COOKIE,
      path: "/admin",
      sameSite: "lax",
      value: theme,
    });
  } else {
    // biome-ignore lint/suspicious/noDocumentCookie: repli pour les navigateurs sans CookieStore
    document.cookie = `${THEME_COOKIE}=${theme}; path=/admin; max-age=${year}; samesite=lax`;
  }
  window.localStorage.setItem(THEME_COOKIE, theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
  document
    .querySelector(".admin-shell")
    ?.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle({ initialTheme }: { initialTheme: AdminTheme }) {
  const [theme, setTheme] = useState<AdminTheme>(initialTheme);

  async function toggle() {
    const next: AdminTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    await persist(next);
  }

  return (
    <Button
      aria-label={
        theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"
      }
      onClick={toggle}
      size="icon"
      title={theme === "dark" ? "Thème clair" : "Thème sombre"}
      variant="ghost"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}

/** Lecture du cookie côté serveur, pour rendre la bonne classe d'emblée. */
export function readThemeCookie(header: string | null): AdminTheme {
  if (!header) {
    return "light";
  }
  for (const part of header.split(";")) {
    const [name, value] = part.trim().split("=");
    if (name === THEME_COOKIE && value === "dark") {
      return "dark";
    }
  }
  return "light";
}
