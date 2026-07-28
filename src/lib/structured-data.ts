import type { SiteContent } from "@/api/modules/content/model";
import type { MenuCategoryView } from "@/api/modules/menu/model";

/**
 * Sous-ensemble réellement consommé par les générateurs. Le `head()` d'une page
 * de route racine ne reçoit que le loader de la racine : accepter cette forme
 * évite d'avoir à reconstruire un `SiteContent` complet côté page.
 */
export type StructuredDataContent = Pick<
  SiteContent,
  | "restaurantName"
  | "tagline"
  | "phone"
  | "email"
  | "addressLine"
  | "postalCode"
  | "city"
  | "mapUrl"
  | "instagramUrl"
  | "facebookUrl"
  | "week"
>;

const WEEKDAY_SCHEMA = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function pad(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Sans données structurées, un restaurant n'apparaît ni dans le panneau local de
 * Google ni dans les résultats enrichis. Les horaires proviennent de la base :
 * ils restent exacts après chaque modification au back-office.
 */
export function restaurantJsonLd(
  content: StructuredDataContent,
  origin: string
) {
  return {
    "@context": "https://schema.org",
    "@id": `${origin}/#restaurant`,
    "@type": "Restaurant",
    acceptsReservations: `${origin}/contact`,
    address: {
      "@type": "PostalAddress",
      addressCountry: "FR",
      addressLocality: content.city,
      postalCode: content.postalCode,
      streetAddress: content.addressLine,
    },
    currenciesAccepted: "EUR",
    description: content.tagline,
    email: content.email,
    hasMap: content.mapUrl,
    image: [`${origin}/public/cover.webp`],
    logo: `${origin}/public/indian-coffee-logo.webp`,
    name: content.restaurantName,
    openingHoursSpecification: content.week.flatMap((day) =>
      day.ranges.map((range) => ({
        "@type": "OpeningHoursSpecification",
        closes: pad(range.closesAt),
        dayOfWeek: `https://schema.org/${WEEKDAY_SCHEMA[day.isoDay - 1]}`,
        opens: pad(range.opensAt),
      }))
    ),
    priceRange: "€€",
    sameAs: [content.instagramUrl, content.facebookUrl].filter(
      (value): value is string => Boolean(value)
    ),
    servesCuisine: ["Indienne", "Sri-lankaise"],
    telephone: content.phone,
    url: origin,
  };
}

/** Carte complète : chaque plat devient un `MenuItem` avec son offre. */
export function menuJsonLd(
  categories: MenuCategoryView[],
  content: Pick<StructuredDataContent, "restaurantName">,
  origin: string
) {
  return {
    "@context": "https://schema.org",
    "@id": `${origin}/menu#menu`,
    "@type": "Menu",
    hasMenuSection: categories.map((category) => ({
      "@type": "MenuSection",
      description: category.description || undefined,
      hasMenuItem: category.sections.flatMap((section) =>
        section.items.map((item) => ({
          "@type": "MenuItem",
          description: item.description || undefined,
          name: item.name,
          offers: item.variants.map((variant) => ({
            "@type": "Offer",
            availability:
              item.status === "AVAILABLE"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            name: variant.label || undefined,
            price: (variant.priceCents / 100).toFixed(2),
            priceCurrency: "EUR",
          })),
          suggestedAge: undefined,
        }))
      ),
      name: category.name,
    })),
    inLanguage: "fr-FR",
    name: `Carte ${content.restaurantName}`,
  };
}

export function breadcrumbJsonLd(
  trail: Array<{ name: string; path: string }>,
  origin: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      item: `${origin}${entry.path}`,
      name: entry.name,
      position: index + 1,
    })),
  };
}

/**
 * Furin sérialise les balises `head` ; le JSON-LD passe donc par un script dont
 * le contenu est échappé pour ne pas pouvoir fermer la balise prématurément.
 */
export function jsonLdScript(payload: unknown) {
  return JSON.stringify(payload).replaceAll("<", "\\u003c");
}
