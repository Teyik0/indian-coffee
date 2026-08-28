import { db } from "@/api/lib/db";
import { getUploadThing } from "@/api/lib/uploadthing";
import { mediaAssets } from "@/db/schema/media";
import { outboxJobs } from "@/db/schema/system";
import { DomainError, sha256 } from "../shared";
import type { MediaVariant } from "./model";

const variants = [
  { name: "thumb", quality: 74, width: 320 },
  { name: "medium", quality: 80, width: 768 },
  { name: "large", quality: 84, width: 1440 },
] as const;

const FILE_EXTENSION_PATTERN = /\.[^.]+$/;

function safeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLocaleLowerCase();
}

export const mediaService = {
  async enqueueDelete(keys: string[], dedupeKey: string) {
    if (keys.length === 0) {
      return;
    }
    await db
      .insert(outboxJobs)
      .values({ dedupeKey, kind: "MEDIA_DELETE", payload: { keys } })
      .onConflictDoNothing({ target: outboxJobs.dedupeKey });
  },
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: le pipeline conserve ensemble validation, variantes, upload et compensation.
  async upload(file: File, alt: string) {
    if (file.size > 15 * 1024 * 1024) {
      throw new DomainError(
        "IMAGE_TOO_LARGE",
        "L’image ne doit pas dépasser 15 Mo.",
        422
      );
    }
    const client = await getUploadThing();
    if (!client) {
      throw new DomainError(
        "MEDIA_NOT_CONFIGURED",
        "UploadThing doit être configuré pour envoyer une image.",
        409
      );
    }

    const source = await file.arrayBuffer();
    const probe = new Bun.Image(source, {
      autoOrient: true,
      maxPixels: 40_000_000,
    });
    const [metadata, placeholder, checksum] = await Promise.all([
      probe.metadata(),
      probe.placeholder(),
      sha256(source),
    ]);
    if (!metadata.format) {
      throw new DomainError(
        "INVALID_IMAGE",
        "Le fichier ne contient pas une image reconnue.",
        422
      );
    }

    const prepared = await Promise.all(
      variants.map(async (variant) => {
        const pipeline = new Bun.Image(source, {
          autoOrient: true,
          maxPixels: 40_000_000,
        })
          .resize(variant.width, undefined, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: variant.quality });
        const [bytes, outputMetadata] = await Promise.all([
          pipeline.bytes(),
          pipeline.metadata(),
        ]);
        return {
          definition: variant,
          file: new File(
            [new Uint8Array(bytes).buffer],
            `${safeName(file.name.replace(FILE_EXTENSION_PATTERN, ""))}-${variant.name}.webp`,
            { type: "image/webp" }
          ),
          metadata: outputMetadata,
        };
      })
    );

    const results = await client.uploadFiles(
      prepared.map((entry) => entry.file)
    );
    // UploadThing 7 builds this class with Effect Schema 3. Its generated
    // declaration loses the class fields when the application uses Effect 4,
    // although the runtime payload still follows this documented shape.
    const uploadData = (result: (typeof results)[number]) =>
      result.data as
        | undefined
        | {
            readonly key: string;
            readonly ufsUrl: string;
          };
    const successfulKeys = results.flatMap((result) => {
      const data = uploadData(result);
      return data ? [data.key] : [];
    });
    if (results.some((result) => result.error || !result.data)) {
      if (successfulKeys.length > 0) {
        await client.deleteFiles(successfulKeys);
      }
      throw new DomainError(
        "UPLOAD_FAILED",
        "Une variante de l’image n’a pas pu être envoyée.",
        502
      );
    }

    const uploaded = prepared.map((entry, index) => {
      const result = results[index];
      const data = result ? uploadData(result) : undefined;
      if (!data) {
        throw new DomainError(
          "UPLOAD_FAILED",
          "Réponse UploadThing incomplète.",
          502
        );
      }
      return {
        bytes: entry.file.size,
        height: entry.metadata.height,
        key: data.key,
        url: data.ufsUrl,
        width: entry.metadata.width,
      } satisfies MediaVariant;
    });

    try {
      const rows = await db
        .insert(mediaAssets)
        .values({
          alt,
          checksum,
          largeBytes: uploaded[2]?.bytes ?? 0,
          largeHeight: uploaded[2]?.height ?? 0,
          largeKey: uploaded[2]?.key ?? "",
          largeUrl: uploaded[2]?.url ?? "",
          largeWidth: uploaded[2]?.width ?? 0,
          mediumBytes: uploaded[1]?.bytes ?? 0,
          mediumHeight: uploaded[1]?.height ?? 0,
          mediumKey: uploaded[1]?.key ?? "",
          mediumUrl: uploaded[1]?.url ?? "",
          mediumWidth: uploaded[1]?.width ?? 0,
          placeholder,
          sourceName: file.name,
          thumbBytes: uploaded[0]?.bytes ?? 0,
          thumbHeight: uploaded[0]?.height ?? 0,
          thumbKey: uploaded[0]?.key ?? "",
          thumbUrl: uploaded[0]?.url ?? "",
          thumbWidth: uploaded[0]?.width ?? 0,
        })
        .onConflictDoNothing({ target: mediaAssets.checksum })
        .returning();
      if (!rows[0]) {
        await client.deleteFiles(successfulKeys);
        throw new DomainError(
          "DUPLICATE_MEDIA",
          "Cette image existe déjà dans la médiathèque.",
          409
        );
      }
      return rows[0];
    } catch (error) {
      const cleanup = await client.deleteFiles(successfulKeys);
      if (!cleanup.success) {
        await db.insert(outboxJobs).values({
          dedupeKey: `compensate:${checksum}`,
          kind: "MEDIA_DELETE",
          payload: { keys: successfulKeys },
        });
      }
      throw error;
    }
  },
};
