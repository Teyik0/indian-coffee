/**
 * `HeadOptions.links` attend des entrées portant une signature d'index
 * `string`. Un tableau littéral mêlant des objets de formes différentes — l'un
 * avec `type`, l'autre sans — est inféré comme une union où TypeScript ajoute
 * `type?: undefined`, ce qui viole cette signature et fait échouer en silence la
 * surcharge de `route.page`, jusqu'à faire perdre le typage du loader.
 *
 * Ces helpers vérifient chaque entrée séparément et renvoient un tableau
 * homogène.
 */

export const appUrl =
  typeof window === "undefined"
    ? (process.env.APP_URL ?? "http://localhost:3000")
    : window.location.origin;

export interface HeadLink {
  href: string;
  rel: string;
  [key: string]: string;
}

export function headLinks(...entries: HeadLink[]): HeadLink[] {
  return entries;
}

export interface HeadScript {
  children?: string;
  src?: string;
  type?: string;
  [key: string]: string | undefined;
}

export function headScripts(...entries: HeadScript[]): HeadScript[] {
  return entries;
}

/** Balises de partage : un oubli casse l'aperçu des liens envoyés en message. */
export function socialMeta({
  title,
  description,
  url,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  type?: string;
}) {
  return [
    { title },
    { content: description, name: "description" },
    { content: type, property: "og:type" },
    { content: title, property: "og:title" },
    { content: description, property: "og:description" },
    { content: image, property: "og:image" },
    { content: url, property: "og:url" },
    { content: "fr_FR", property: "og:locale" },
    { content: "Indian Coffee", property: "og:site_name" },
    { content: "summary_large_image", name: "twitter:card" },
    { content: title, name: "twitter:title" },
    { content: description, name: "twitter:description" },
    { content: image, name: "twitter:image" },
  ];
}
