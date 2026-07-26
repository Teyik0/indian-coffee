import { and, asc, db, eq } from "@/api/lib/db";
import { galleryCollections, galleryEntries } from "@/db/schema/gallery";
import { mediaAssets } from "@/db/schema/media";

export const galleryService = {
  async getPage(page = 1, collection = "restaurant") {
    const size = 12;
    const rows = await db
      .select({
        id: galleryEntries.id,
        caption: galleryEntries.caption,
        alt: mediaAssets.alt,
        src: mediaAssets.mediumUrl,
        width: mediaAssets.mediumWidth,
        height: mediaAssets.mediumHeight,
      })
      .from(galleryEntries)
      .innerJoin(
        galleryCollections,
        eq(galleryEntries.collectionId, galleryCollections.id),
      )
      .innerJoin(mediaAssets, eq(galleryEntries.mediaId, mediaAssets.id))
      .where(
        and(
          eq(galleryCollections.slug, collection),
          eq(galleryCollections.isVisible, true),
          eq(galleryEntries.isVisible, true),
        ),
      )
      .orderBy(asc(galleryEntries.sortOrder));

    return {
      collection,
      images: rows.slice((page - 1) * size, page * size),
      total: rows.length,
      page,
      hasMore: page * size < rows.length,
    };
  },
};
