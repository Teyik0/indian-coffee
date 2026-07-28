import { legacyMenuEntries } from "./legacy.generated";
import type { MenuStatus, SpiceLevel } from "./model";

/**
 * Formes de départ du seed. Elles restent volontairement distinctes des types
 * de vue (`MenuCategoryView`…) : ces derniers portent l'ordre, la visibilité et
 * les visuels, qui n'existent qu'une fois les lignes créées en base.
 */
interface SeedVariant {
  detail: string | null;
  id: string;
  label: string | null;
  priceCents: number;
}

interface SeedItem {
  description: string;
  dietaryFlags: string[];
  featured: boolean;
  id: string;
  name: string;
  spiceLevel: SpiceLevel | null;
  status: MenuStatus;
  variants: SeedVariant[];
  version: number;
}

interface SeedSection {
  description: string;
  id: string;
  items: SeedItem[];
  name: string;
}

export interface LegacyMenuCategory {
  description: string;
  id: string;
  name: string;
  sections: SeedSection[];
  slug: string;
}

const categoryMetadata = [
  {
    description: "Beignets, samossas, grillades et salades préparés minute.",
    name: "Entrées",
    slug: "starters",
  },
  {
    description: "Légumineuses, légumes et épices travaillés avec gourmandise.",
    name: "Plats végétariens",
    slug: "vegetarian-dishes",
  },
  {
    description: "Currys mijotés, riz parfumés et recettes familiales.",
    name: "Plats",
    slug: "main-courses",
  },
  {
    description: "Les signatures indiennes et sri-lankaises de la maison.",
    name: "Spécialités",
    slug: "specialties",
  },
  {
    description: "Douceurs indiennes, glaces et desserts de brasserie.",
    name: "Desserts",
    slug: "desserts",
  },
  {
    description: "Lassis, cocktails, boissons fraîches et boissons chaudes.",
    name: "Boissons",
    slug: "drinks",
  },
  {
    description: "Une sélection pensée pour les épices et les grillades.",
    name: "Vins",
    slug: "wines",
  },
] as const;

const menuCategory: LegacyMenuCategory = {
  description: "Des parcours complets pour découvrir notre cuisine.",
  id: "legacy-category-menus",
  name: "Menus",
  sections: [
    {
      description: "Entrée, plat et dessert selon la formule.",
      id: "legacy-section-menus",
      items: [
        {
          description: "Une sélection généreuse sans viande.",
          dietaryFlags: ["Végétarien"],
          featured: false,
          id: "legacy-menu-vegetarien",
          name: "Menu végétarien",
          spiceLevel: null,
          status: "AVAILABLE",
          variants: [
            {
              detail: null,
              id: "legacy-menu-vegetarien-price",
              label: null,
              priceCents: 2400,
            },
          ],
          version: 1,
        },
        {
          description: "Les signatures de la maison.",
          dietaryFlags: [],
          featured: true,
          id: "legacy-menu-indian-coffee",
          name: "Menu Indian Coffee",
          spiceLevel: null,
          status: "AVAILABLE",
          variants: [
            {
              detail: null,
              id: "legacy-menu-indian-coffee-price",
              label: null,
              priceCents: 2900,
            },
          ],
          version: 1,
        },
        {
          description: "Une formule adaptée aux plus jeunes.",
          dietaryFlags: [],
          featured: false,
          id: "legacy-menu-enfant",
          name: "Menu enfant",
          spiceLevel: null,
          status: "AVAILABLE",
          variants: [
            {
              detail: null,
              id: "legacy-menu-enfant-price",
              label: null,
              priceCents: 1200,
            },
          ],
          version: 1,
        },
      ],
      name: "Nos formules",
    },
  ],
  slug: "menus",
};

const VEGETARIAN_NAME_PATTERN = /légume|paneer|dal|dhal|badji|vadai|idli|dosai/;
const FEATURED_NAME_PATTERN = /butter chicken|kottu|mixed? tandoori/i;

function inferDietaryFlags(category: string, name: string) {
  const normalized = name.toLocaleLowerCase("fr-FR");
  if (category === "vegetarian-dishes") {
    return ["Végétarien"];
  }
  if (VEGETARIAN_NAME_PATTERN.test(normalized)) {
    return ["Végétarien"];
  }
  return [];
}

function buildCategory(
  metadata: (typeof categoryMetadata)[number]
): LegacyMenuCategory {
  const items: SeedItem[] = [];
  let current: SeedItem | undefined;

  for (const entry of legacyMenuEntries) {
    if (entry.category !== metadata.slug) {
      continue;
    }
    const entryId = `legacy-${metadata.slug}-${entry.sourceOrder}`;
    if (entry.kind === "item") {
      current = {
        description: entry.description,
        dietaryFlags: inferDietaryFlags(metadata.slug, entry.name),
        featured: FEATURED_NAME_PATTERN.test(entry.name),
        id: entryId,
        name: entry.name,
        spiceLevel: null,
        status: "AVAILABLE",
        variants:
          entry.priceCents === null
            ? []
            : [
                {
                  detail: null,
                  id: `${entryId}-price`,
                  label: null,
                  priceCents: entry.priceCents,
                },
              ],
        version: 1,
      };
      items.push(current);
      continue;
    }

    if (!current) {
      throw new Error(`Orphan variant in category ${metadata.slug}.`);
    }
    current.variants.push({
      detail: entry.description || null,
      id: entryId,
      label: entry.name,
      priceCents: entry.priceCents,
    });
  }

  return {
    description: metadata.description,
    id: `legacy-category-${metadata.slug}`,
    name: metadata.name,
    sections: [
      {
        description: "Tarifs repris de la carte historique.",
        id: `legacy-section-${metadata.slug}`,
        items,
        name: "Toute la carte",
      },
    ],
    slug: metadata.slug,
  };
}

export const legacyMenuSeed: LegacyMenuCategory[] = [
  menuCategory,
  ...categoryMetadata.map(buildCategory),
];

export const legacyMenuMigrationCount = legacyMenuEntries.length;
