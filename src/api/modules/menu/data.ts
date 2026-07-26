import { legacyMenuEntries } from "./legacy.generated";
import type { MenuCategoryView, MenuItemView } from "./model";

const categoryMetadata = [
  {
    slug: "starters",
    name: "Entrées",
    description: "Beignets, samossas, grillades et salades préparés minute.",
  },
  {
    slug: "vegetarian-dishes",
    name: "Plats végétariens",
    description: "Légumineuses, légumes et épices travaillés avec gourmandise.",
  },
  {
    slug: "main-courses",
    name: "Plats",
    description: "Currys mijotés, riz parfumés et recettes familiales.",
  },
  {
    slug: "specialties",
    name: "Spécialités",
    description: "Les signatures indiennes et sri-lankaises de la maison.",
  },
  {
    slug: "desserts",
    name: "Desserts",
    description: "Douceurs indiennes, glaces et desserts de brasserie.",
  },
  {
    slug: "drinks",
    name: "Boissons",
    description: "Lassis, cocktails, boissons fraîches et boissons chaudes.",
  },
  {
    slug: "wines",
    name: "Vins",
    description: "Une sélection pensée pour les épices et les grillades.",
  },
] as const;

const menuCategory: MenuCategoryView = {
  id: "legacy-category-menus",
  name: "Menus",
  slug: "menus",
  description: "Des parcours complets pour découvrir notre cuisine.",
  sections: [
    {
      id: "legacy-section-menus",
      name: "Nos formules",
      description: "Entrée, plat et dessert selon la formule.",
      items: [
        {
          id: "legacy-menu-vegetarien",
          name: "Menu végétarien",
          description: "Une sélection généreuse sans viande.",
          status: "AVAILABLE",
          dietaryFlags: ["Végétarien"],
          spiceLevel: null,
          featured: false,
          version: 1,
          variants: [
            {
              id: "legacy-menu-vegetarien-price",
              label: null,
              detail: null,
              priceCents: 2400,
            },
          ],
        },
        {
          id: "legacy-menu-indian-coffee",
          name: "Menu Indian Coffee",
          description: "Les signatures de la maison.",
          status: "AVAILABLE",
          dietaryFlags: [],
          spiceLevel: null,
          featured: true,
          version: 1,
          variants: [
            {
              id: "legacy-menu-indian-coffee-price",
              label: null,
              detail: null,
              priceCents: 2900,
            },
          ],
        },
        {
          id: "legacy-menu-enfant",
          name: "Menu enfant",
          description: "Une formule adaptée aux plus jeunes.",
          status: "AVAILABLE",
          dietaryFlags: [],
          spiceLevel: null,
          featured: false,
          version: 1,
          variants: [
            {
              id: "legacy-menu-enfant-price",
              label: null,
              detail: null,
              priceCents: 1200,
            },
          ],
        },
      ],
    },
  ],
};

function inferDietaryFlags(category: string, name: string) {
  const normalized = name.toLocaleLowerCase("fr-FR");
  if (category === "vegetarian-dishes") return ["Végétarien"];
  if (/légume|paneer|dal|dhal|badji|vadai|idli|dosai/.test(normalized)) {
    return ["Végétarien"];
  }
  return [];
}

function buildCategory(
  metadata: (typeof categoryMetadata)[number],
): MenuCategoryView {
  const items: MenuItemView[] = [];
  let current: MenuItemView | undefined;

  for (const entry of legacyMenuEntries) {
    if (entry.category !== metadata.slug) continue;
    const entryId = `legacy-${metadata.slug}-${entry.sourceOrder}`;
    if (entry.kind === "item") {
      current = {
        id: entryId,
        name: entry.name,
        description: entry.description,
        status: "AVAILABLE",
        dietaryFlags: inferDietaryFlags(metadata.slug, entry.name),
        spiceLevel: null,
        featured: /butter chicken|kottu|mixed? tandoori/i.test(entry.name),
        version: 1,
        variants:
          entry.priceCents === null
            ? []
            : [
                {
                  id: `${entryId}-price`,
                  label: null,
                  detail: null,
                  priceCents: entry.priceCents,
                },
              ],
      };
      items.push(current);
      continue;
    }

    if (!current) {
      throw new Error(`Orphan variant in category ${metadata.slug}.`);
    }
    current.variants.push({
      id: entryId,
      label: entry.name,
      detail: entry.description || null,
      priceCents: entry.priceCents,
    });
  }

  return {
    id: `legacy-category-${metadata.slug}`,
    name: metadata.name,
    slug: metadata.slug,
    description: metadata.description,
    sections: [
      {
        id: `legacy-section-${metadata.slug}`,
        name: "Toute la carte",
        description: "Tarifs repris de la carte historique.",
        items,
      },
    ],
  };
}

export const legacyMenuSeed: MenuCategoryView[] = [
  menuCategory,
  ...categoryMetadata.map(buildCategory),
];

export const legacyMenuMigrationCount = legacyMenuEntries.length;
