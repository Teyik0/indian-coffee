import { db, eq } from "@/api/lib/db";
import { initialContent } from "@/api/modules/content/service";
import { gallerySeed } from "@/api/modules/gallery/data";
import {
  legacyMenuMigrationCount,
  legacyMenuSeed,
} from "@/api/modules/menu/data";
import { sha256 } from "@/api/modules/shared";
import { homeContent, openingHours, siteSettings } from "@/db/schema/content";
import { galleryCollections, galleryEntries } from "@/db/schema/gallery";
import { mediaAssets } from "@/db/schema/media";
import {
  menuCategories,
  menuItems,
  menuItemVariants,
  menuSections,
} from "@/db/schema/menu";

const dryRun = process.argv.includes("--dry-run");

const summary = {
  legacyEntries: legacyMenuMigrationCount,
  categories: legacyMenuSeed.length,
  items: legacyMenuSeed.flatMap((category) =>
    category.sections.flatMap((section) => section.items),
  ).length,
  variants: legacyMenuSeed.flatMap((category) =>
    category.sections.flatMap((section) =>
      section.items.flatMap((item) => item.variants),
    ),
  ).length,
  galleryImages: gallerySeed.length,
};

if (dryRun) {
  console.info("Seed dry-run", summary);
  process.exit(0);
}

await db.transaction(async (tx) => {
  await tx
    .insert(siteSettings)
    .values({
      id: "default",
      restaurantName: initialContent.restaurantName,
      tagline: initialContent.tagline,
      phone: initialContent.phone,
      email: initialContent.email,
      addressLine: initialContent.addressLine,
      postalCode: initialContent.postalCode,
      city: initialContent.city,
      mapUrl: initialContent.mapUrl,
      instagramUrl: initialContent.instagramUrl || null,
      facebookUrl: initialContent.facebookUrl || null,
      reservationNotice: initialContent.reservationNotice,
    })
    .onConflictDoNothing();

  await tx
    .insert(homeContent)
    .values({
      id: "default",
      eyebrow: initialContent.hero.eyebrow,
      heroTitle: initialContent.hero.title,
      heroIntro: initialContent.hero.intro,
      storyTitle: initialContent.story.title,
      storyBody: initialContent.story.body,
    })
    .onConflictDoNothing();

  const existingHours = await tx
    .select({ id: openingHours.id })
    .from(openingHours)
    .limit(1);
  if (existingHours.length === 0) {
    await tx.insert(openingHours).values([
      {
        dayOfWeek: 1,
        opensAt: "11:00",
        closesAt: "22:30",
        label: "Lundi — Jeudi",
      },
      {
        dayOfWeek: 5,
        opensAt: "11:00",
        closesAt: "23:00",
        label: "Vendredi — Samedi",
      },
      { dayOfWeek: 7, opensAt: "12:00", closesAt: "22:30", label: "Dimanche" },
    ]);
  }

  for (const [categoryOrder, category] of legacyMenuSeed.entries()) {
    const [categoryRow] = await tx
      .insert(menuCategories)
      .values({
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: categoryOrder,
      })
      .onConflictDoUpdate({
        target: menuCategories.slug,
        set: {
          name: category.name,
          description: category.description,
          sortOrder: categoryOrder,
          updatedAt: new Date(),
        },
      })
      .returning({ id: menuCategories.id });
    if (!categoryRow)
      throw new Error(`Category was not created: ${category.slug}`);

    await tx
      .delete(menuSections)
      .where(eq(menuSections.categoryId, categoryRow.id));
    for (const [sectionOrder, section] of category.sections.entries()) {
      const [sectionRow] = await tx
        .insert(menuSections)
        .values({
          categoryId: categoryRow.id,
          name: section.name,
          description: section.description,
          sortOrder: sectionOrder,
        })
        .returning({ id: menuSections.id });
      if (!sectionRow)
        throw new Error(`Section was not created: ${section.name}`);

      for (const [itemOrder, item] of section.items.entries()) {
        const [itemRow] = await tx
          .insert(menuItems)
          .values({
            sectionId: sectionRow.id,
            name: item.name,
            description: item.description,
            status: item.status,
            dietaryFlags: item.dietaryFlags,
            spiceLevel: item.spiceLevel,
            featured: item.featured,
            sortOrder: itemOrder,
          })
          .returning({ id: menuItems.id });
        if (!itemRow)
          throw new Error(`Menu item was not created: ${item.name}`);
        if (item.variants.length > 0) {
          await tx.insert(menuItemVariants).values(
            item.variants.map((variant, variantOrder) => ({
              itemId: itemRow.id,
              label: variant.label,
              detail: variant.detail,
              priceCents: variant.priceCents,
              sortOrder: variantOrder,
            })),
          );
        }
      }
    }
  }

  const [collection] = await tx
    .insert(galleryCollections)
    .values({
      name: "Restaurant",
      slug: "restaurant",
      description: "Carte et ambiance",
    })
    .onConflictDoUpdate({
      target: galleryCollections.slug,
      set: { name: "Restaurant", description: "Carte et ambiance" },
    })
    .returning({ id: galleryCollections.id });
  if (!collection) throw new Error("Gallery collection was not created.");
  await tx
    .delete(galleryEntries)
    .where(eq(galleryEntries.collectionId, collection.id));

  for (const [sortOrder, image] of gallerySeed.entries()) {
    const source = Bun.file(`public/${image.src.replace("/public/", "")}`);
    const bytes = await source.arrayBuffer();
    const checksum = await sha256(bytes);
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
            sourceName: image.src.replace("/public/", ""),
            thumbKey: `legacy-thumb-${checksum}`,
            thumbUrl: image.src,
            thumbWidth: image.width,
            thumbHeight: image.height,
            thumbBytes: source.size,
            mediumKey: `legacy-medium-${checksum}`,
            mediumUrl: image.src,
            mediumWidth: image.width,
            mediumHeight: image.height,
            mediumBytes: source.size,
            largeKey: `legacy-large-${checksum}`,
            largeUrl: image.src,
            largeWidth: image.width,
            largeHeight: image.height,
            largeBytes: source.size,
          })
          .returning({ id: mediaAssets.id });
    if (!created) throw new Error(`Image was not created: ${image.src}`);
    await tx.insert(galleryEntries).values({
      collectionId: collection.id,
      mediaId: created.id,
      caption: image.caption,
      sortOrder,
    });
  }
});

console.info("Seed completed", summary);
