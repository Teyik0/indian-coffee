import * as Effect from "effect4/Effect";
import { PersistenceError } from "@/api/effect/errors";
import { Crypto, Database } from "@/api/effect/services";
import { eq } from "@/api/lib/db";
import { initialWeeklyHours } from "@/api/modules/content/opening-hours.service";
import { initialContent } from "@/api/modules/content/service";
import { gallerySeed } from "@/api/modules/gallery/data";
import {
  legacyMenuMigrationCount,
  legacyMenuSeed,
} from "@/api/modules/menu/data";
import { homeContent, openingHours, siteSettings } from "@/db/schema/content";
import { galleryCollections, galleryEntries } from "@/db/schema/gallery";
import { mediaAssets } from "@/db/schema/media";
import {
  menuCategories,
  menuItems,
  menuItemVariants,
  menuSections,
} from "@/db/schema/menu";
import { runManagedScript } from "./effect-main";

const dryRun = process.argv.includes("--dry-run");

const summary = {
  categories: legacyMenuSeed.length,
  galleryImages: gallerySeed.length,
  items: legacyMenuSeed.flatMap((category) =>
    category.sections.flatMap((section) => section.items)
  ).length,
  legacyEntries: legacyMenuMigrationCount,
  variants: legacyMenuSeed.flatMap((category) =>
    category.sections.flatMap((section) =>
      section.items.flatMap((item) => item.variants)
    )
  ).length,
};

const main = Effect.fn("seed.main")(function* () {
  if (dryRun) {
    yield* Effect.logInfo("seed_dry_run").pipe(Effect.annotateLogs(summary));
    return;
  }
  const database = yield* Database;
  const cryptoService = yield* Crypto;

  yield* Effect.tryPromise({
    catch: (cause) =>
      new PersistenceError({ cause, operation: "seed.transaction" }),
    try: () =>
      database.db.transaction(
        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: le seed orchestre volontairement toutes les tables dans une transaction atomique.
        async (tx) => {
          await tx
            .insert(siteSettings)
            .values({
              addressLine: initialContent.addressLine,
              city: initialContent.city,
              email: initialContent.email,
              facebookUrl: initialContent.facebookUrl || null,
              id: "default",
              instagramUrl: initialContent.instagramUrl || null,
              mapUrl: initialContent.mapUrl,
              phone: initialContent.phone,
              postalCode: initialContent.postalCode,
              reservationNotice: initialContent.reservationNotice,
              restaurantName: initialContent.restaurantName,
              tagline: initialContent.tagline,
            })
            .onConflictDoNothing();

          await tx
            .insert(homeContent)
            .values({
              eyebrow: initialContent.hero.eyebrow,
              heroIntro: initialContent.hero.intro,
              heroTitle: initialContent.hero.title,
              id: "default",
              storyBody: initialContent.story.body,
              storyTitle: initialContent.story.title,
            })
            .onConflictDoNothing();

          // Grille complète des sept jours : le regroupement d'affichage
          // (« Lundi — Jeudi ») est dérivé à la lecture, il n'est plus stocké dans le
          // libellé. Sans les sept jours, la validation des réservations et le badge
          // « ouvert maintenant » n'ont rien sur quoi s'appuyer. L'upsert comble les
          // jours absents sans écraser les horaires ajustés depuis le back-office.
          await tx
            .insert(openingHours)
            .values(
              initialWeeklyHours.map((slot) => ({
                closesAt: slot.closesAt,
                dayOfWeek: slot.dayOfWeek,
                isClosed: slot.isClosed,
                opensAt: slot.opensAt,
                sortOrder: 0,
              }))
            )
            .onConflictDoNothing({
              target: [openingHours.dayOfWeek, openingHours.sortOrder],
            });

          for (const [categoryOrder, category] of legacyMenuSeed.entries()) {
            // biome-ignore lint/performance/noAwaitInLoops: chaque catégorie remplace séquentiellement ses descendants dans la même transaction.
            const [categoryRow] = await tx
              .insert(menuCategories)
              .values({
                description: category.description,
                name: category.name,
                slug: category.slug,
                sortOrder: categoryOrder,
              })
              .onConflictDoUpdate({
                set: {
                  description: category.description,
                  name: category.name,
                  sortOrder: categoryOrder,
                  updatedAt: new Date(),
                },
                target: menuCategories.slug,
              })
              .returning({ id: menuCategories.id });
            if (!categoryRow) {
              throw new Error(`Category was not created: ${category.slug}`);
            }

            await tx
              .delete(menuSections)
              .where(eq(menuSections.categoryId, categoryRow.id));
            for (const [sectionOrder, section] of category.sections.entries()) {
              // biome-ignore lint/performance/noAwaitInLoops: l'identifiant de section est requis avant d'insérer ses plats.
              const [sectionRow] = await tx
                .insert(menuSections)
                .values({
                  categoryId: categoryRow.id,
                  description: section.description,
                  name: section.name,
                  sortOrder: sectionOrder,
                })
                .returning({ id: menuSections.id });
              if (!sectionRow) {
                throw new Error(`Section was not created: ${section.name}`);
              }

              for (const [itemOrder, item] of section.items.entries()) {
                // biome-ignore lint/performance/noAwaitInLoops: l'identifiant du plat est requis pour ses variantes.
                const [itemRow] = await tx
                  .insert(menuItems)
                  .values({
                    description: item.description,
                    dietaryFlags: item.dietaryFlags,
                    featured: item.featured,
                    name: item.name,
                    sectionId: sectionRow.id,
                    sortOrder: itemOrder,
                    spiceLevel: item.spiceLevel,
                    status: item.status,
                  })
                  .returning({ id: menuItems.id });
                if (!itemRow) {
                  throw new Error(`Menu item was not created: ${item.name}`);
                }
                if (item.variants.length > 0) {
                  await tx.insert(menuItemVariants).values(
                    item.variants.map((variant, variantOrder) => ({
                      detail: variant.detail,
                      itemId: itemRow.id,
                      label: variant.label,
                      priceCents: variant.priceCents,
                      sortOrder: variantOrder,
                    }))
                  );
                }
              }
            }
          }

          const [collection] = await tx
            .insert(galleryCollections)
            .values({
              description: "Carte et ambiance",
              name: "Restaurant",
              slug: "restaurant",
            })
            .onConflictDoUpdate({
              set: { description: "Carte et ambiance", name: "Restaurant" },
              target: galleryCollections.slug,
            })
            .returning({ id: galleryCollections.id });
          if (!collection) {
            throw new Error("Gallery collection was not created.");
          }
          await tx
            .delete(galleryEntries)
            .where(eq(galleryEntries.collectionId, collection.id));

          for (const [sortOrder, image] of gallerySeed.entries()) {
            const source = Bun.file(
              `public/${image.src.replace("/public/", "")}`
            );
            // biome-ignore lint/performance/noAwaitInLoops: la transaction déduplique chaque média avant de créer son entrée.
            const bytes = await source.arrayBuffer();
            const checksum = await Effect.runPromise(
              cryptoService.sha256(bytes)
            );
            const existing = await tx
              .select({ id: mediaAssets.id })
              .from(mediaAssets)
              .where(eq(mediaAssets.checksum, checksum))
              .limit(1);
            const [created] = existing.length
              ? existing
              : await tx
                  .insert(mediaAssets)
                  .values({
                    alt: image.alt,
                    checksum,
                    largeBytes: source.size,
                    largeHeight: image.height,
                    largeKey: `legacy-large-${checksum}`,
                    largeUrl: image.src,
                    largeWidth: image.width,
                    mediumBytes: source.size,
                    mediumHeight: image.height,
                    mediumKey: `legacy-medium-${checksum}`,
                    mediumUrl: image.src,
                    mediumWidth: image.width,
                    sourceName: image.src.replace("/public/", ""),
                    thumbBytes: source.size,
                    thumbHeight: image.height,
                    thumbKey: `legacy-thumb-${checksum}`,
                    thumbUrl: image.src,
                    thumbWidth: image.width,
                  })
                  .returning({ id: mediaAssets.id });
            if (!created) {
              throw new Error(`Image was not created: ${image.src}`);
            }
            await tx.insert(galleryEntries).values({
              caption: image.caption,
              collectionId: collection.id,
              mediaId: created.id,
              sortOrder,
            });
          }
        }
      ),
  });

  yield* Effect.logInfo("seed_completed").pipe(Effect.annotateLogs(summary));
});

await runManagedScript("seed", main());
