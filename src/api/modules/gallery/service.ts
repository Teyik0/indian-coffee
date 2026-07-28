import { and, asc, count, db, eq, sql } from "@/api/lib/db";
import { galleryCollections, galleryEntries } from "@/db/schema/gallery";
import { mediaAssets } from "@/db/schema/media";
import { mediaService } from "../media/service";
import { DomainError } from "../shared";
import type {
  GalleryAdminEntry,
  GalleryCollectionInput,
  GalleryEntryCreate,
  GalleryEntryUpdate,
  GalleryImage,
} from "./model";

const PAGE_SIZE = 12;

/**
 * Les trois variantes WebP sont produites à l'upload puis stockées ; jusqu'ici
 * une seule URL était servie. Le `srcSet` les expose enfin au navigateur.
 */
function buildSrcSet(row: {
  thumbUrl: string;
  thumbWidth: number;
  mediumUrl: string;
  mediumWidth: number;
  largeUrl: string;
  largeWidth: number;
}) {
  return [
    `${row.thumbUrl} ${row.thumbWidth}w`,
    `${row.mediumUrl} ${row.mediumWidth}w`,
    `${row.largeUrl} ${row.largeWidth}w`,
  ].join(", ");
}

const publicColumns = {
  alt: mediaAssets.alt,
  caption: galleryEntries.caption,
  collectionId: galleryEntries.collectionId,
  collectionSlug: galleryCollections.slug,
  createdAt: mediaAssets.createdAt,
  height: mediaAssets.mediumHeight,
  id: galleryEntries.id,
  isVisible: galleryEntries.isVisible,
  largeUrl: mediaAssets.largeUrl,
  largeWidth: mediaAssets.largeWidth,
  mediaId: mediaAssets.id,
  mediumUrl: mediaAssets.mediumUrl,
  mediumWidth: mediaAssets.mediumWidth,
  placeholder: mediaAssets.placeholder,
  sortOrder: galleryEntries.sortOrder,
  src: mediaAssets.mediumUrl,
  thumbUrl: mediaAssets.thumbUrl,
  thumbWidth: mediaAssets.thumbWidth,
  width: mediaAssets.mediumWidth,
} as const;

export const galleryService = {
  async createCollection(input: GalleryCollectionInput) {
    const [orderRow] = await db
      .select({
        next: sql<number>`coalesce(max(${galleryCollections.sortOrder}), -1) + 1`,
      })
      .from(galleryCollections);
    const [row] = await db
      .insert(galleryCollections)
      .values({
        description: input.description ?? "",
        isVisible: input.isVisible ?? true,
        name: input.name,
        slug: input.slug,
        sortOrder: Number(orderRow?.next ?? 0),
      })
      .onConflictDoUpdate({
        set: {
          description: input.description ?? "",
          isVisible: input.isVisible ?? true,
          name: input.name,
        },
        target: galleryCollections.slug,
      })
      .returning();
    return row;
  },

  async createEntry(input: GalleryEntryCreate) {
    const [collection] = await db
      .select()
      .from(galleryCollections)
      .where(eq(galleryCollections.slug, input.collectionSlug))
      .limit(1);
    if (!collection) {
      throw new DomainError(
        "COLLECTION_NOT_FOUND",
        "Cette collection n’existe pas.",
        404
      );
    }
    const [orderRow] = await db
      .select({
        next: sql<number>`coalesce(max(${galleryEntries.sortOrder}), -1) + 1`,
      })
      .from(galleryEntries)
      .where(eq(galleryEntries.collectionId, collection.id));

    const [row] = await db
      .insert(galleryEntries)
      .values({
        caption: input.caption ?? "",
        collectionId: collection.id,
        mediaId: input.mediaId,
        sortOrder: Number(orderRow?.next ?? 0),
      })
      .returning();
    return row;
  },

  /**
   * Retire l'entrée et le média, puis délègue la suppression des fichiers à
   * l'outbox : le stockage distant ne doit pas faire échouer la transaction.
   */
  async deleteEntry(id: string) {
    const [row] = await db
      .select({
        checksum: mediaAssets.checksum,
        largeKey: mediaAssets.largeKey,
        mediaId: mediaAssets.id,
        mediumKey: mediaAssets.mediumKey,
        thumbKey: mediaAssets.thumbKey,
      })
      .from(galleryEntries)
      .innerJoin(mediaAssets, eq(galleryEntries.mediaId, mediaAssets.id))
      .where(eq(galleryEntries.id, id))
      .limit(1);
    if (!row) {
      throw new DomainError(
        "ENTRY_NOT_FOUND",
        "Cette image n’est plus dans la galerie.",
        404
      );
    }

    await db.transaction(async (tx) => {
      await tx.delete(galleryEntries).where(eq(galleryEntries.id, id));
      const [remaining] = await tx
        .select({ total: count() })
        .from(galleryEntries)
        .where(eq(galleryEntries.mediaId, row.mediaId));
      // Le média n'est supprimé que s'il n'est plus référencé nulle part.
      if (Number(remaining?.total ?? 0) === 0) {
        await tx.delete(mediaAssets).where(eq(mediaAssets.id, row.mediaId));
      }
    });

    await mediaService.enqueueDelete(
      [row.thumbKey, row.mediumKey, row.largeKey].filter(Boolean),
      `gallery-delete:${row.checksum}`
    );
    return { id };
  },

  /** Médiathèque du back-office : paginée, entrées masquées comprises. */
  async getAdminPage(page = 1, pageSize = 24, collection?: string) {
    const where = collection
      ? eq(galleryCollections.slug, collection)
      : undefined;
    const [rows, totalRows, collections] = await Promise.all([
      db
        .select(publicColumns)
        .from(galleryEntries)
        .innerJoin(
          galleryCollections,
          eq(galleryEntries.collectionId, galleryCollections.id)
        )
        .innerJoin(mediaAssets, eq(galleryEntries.mediaId, mediaAssets.id))
        .where(where)
        .orderBy(
          asc(galleryCollections.sortOrder),
          asc(galleryEntries.sortOrder)
        )
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db
        .select({ total: count() })
        .from(galleryEntries)
        .innerJoin(
          galleryCollections,
          eq(galleryEntries.collectionId, galleryCollections.id)
        )
        .where(where),
      db
        .select()
        .from(galleryCollections)
        .orderBy(asc(galleryCollections.sortOrder)),
    ]);

    const total = Number(totalRows[0]?.total ?? 0);
    return {
      collections,
      entries: rows.map(
        (row): GalleryAdminEntry => ({
          alt: row.alt,
          caption: row.caption,
          collectionId: row.collectionId,
          collectionSlug: row.collectionSlug,
          createdAt: row.createdAt,
          height: row.height,
          id: row.id,
          isVisible: row.isVisible,
          mediaId: row.mediaId,
          placeholder: row.placeholder,
          sortOrder: row.sortOrder,
          src: row.src,
          srcSet: buildSrcSet(row),
          thumbUrl: row.thumbUrl,
          width: row.width,
        })
      ),
      page,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      pageSize,
      total,
    };
  },
  async getPage(page = 1, collection = "restaurant") {
    const where = and(
      eq(galleryCollections.slug, collection),
      eq(galleryCollections.isVisible, true),
      eq(galleryEntries.isVisible, true)
    );
    const [rows, totalRows] = await Promise.all([
      db
        .select(publicColumns)
        .from(galleryEntries)
        .innerJoin(
          galleryCollections,
          eq(galleryEntries.collectionId, galleryCollections.id)
        )
        .innerJoin(mediaAssets, eq(galleryEntries.mediaId, mediaAssets.id))
        .where(where)
        .orderBy(asc(galleryEntries.sortOrder))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      db
        .select({ total: count() })
        .from(galleryEntries)
        .innerJoin(
          galleryCollections,
          eq(galleryEntries.collectionId, galleryCollections.id)
        )
        .where(where),
    ]);

    const total = Number(totalRows[0]?.total ?? 0);
    return {
      collection,
      hasMore: page * PAGE_SIZE < total,
      images: rows.map(
        (row): GalleryImage => ({
          alt: row.alt,
          caption: row.caption,
          height: row.height,
          id: row.id,
          placeholder: row.placeholder,
          src: row.src,
          srcSet: buildSrcSet(row),
          width: row.width,
        })
      ),
      page,
      pageSize: PAGE_SIZE,
      total,
    };
  },

  /** Médias non encore rattachés à une entrée : sélecteur de visuels. */
  listAvailableMedia(limit = 60) {
    return db
      .select({
        alt: mediaAssets.alt,
        id: mediaAssets.id,
        mediumHeight: mediaAssets.mediumHeight,
        mediumUrl: mediaAssets.mediumUrl,
        mediumWidth: mediaAssets.mediumWidth,
        placeholder: mediaAssets.placeholder,
        thumbUrl: mediaAssets.thumbUrl,
      })
      .from(mediaAssets)
      .orderBy(asc(mediaAssets.createdAt))
      .limit(limit);
  },

  listCollections() {
    return db
      .select()
      .from(galleryCollections)
      .orderBy(asc(galleryCollections.sortOrder));
  },

  async reorder(ids: string[]) {
    await db.transaction(async (tx) => {
      await Promise.all(
        ids.map((id, index) =>
          tx
            .update(galleryEntries)
            .set({ sortOrder: index })
            .where(eq(galleryEntries.id, id))
        )
      );
    });
    return { reordered: ids.length };
  },

  /** Légende et visibilité vivent sur l'entrée, le texte alternatif sur le média. */
  updateEntry(id: string, input: GalleryEntryUpdate) {
    return db.transaction(async (tx) => {
      const [entry] = await tx
        .select({ mediaId: galleryEntries.mediaId })
        .from(galleryEntries)
        .where(eq(galleryEntries.id, id))
        .limit(1);
      if (!entry) {
        throw new DomainError(
          "ENTRY_NOT_FOUND",
          "Cette image n’est plus dans la galerie.",
          404
        );
      }
      const [row] = await tx
        .update(galleryEntries)
        .set({
          caption: input.caption ?? "",
          isVisible: input.isVisible,
          ...(input.collectionId ? { collectionId: input.collectionId } : {}),
        })
        .where(eq(galleryEntries.id, id))
        .returning();
      await tx
        .update(mediaAssets)
        .set({ alt: input.alt })
        .where(eq(mediaAssets.id, entry.mediaId));
      return row;
    });
  },
};
