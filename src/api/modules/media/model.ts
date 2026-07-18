import * as v from "valibot";

export const MediaUploadSchema = v.object({
  alt: v.pipe(v.string(), v.trim(), v.minLength(3), v.maxLength(180)),
  file: v.file("Sélectionnez une image valide."),
});

export type MediaVariant = {
  key: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
};
