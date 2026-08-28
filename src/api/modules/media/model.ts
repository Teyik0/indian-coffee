import * as Schema from "effect4/Schema";
import { boundedString, standard } from "@/api/effect/schema";

export const MediaUploadEffectSchema = Schema.Struct({
  alt: boundedString(3, 180, { trim: true }),
  file: Schema.instanceOf(File, {
    message: "Sélectionnez une image valide.",
  }),
});
export const MediaUploadSchema = standard(MediaUploadEffectSchema);

export interface MediaVariant {
  bytes: number;
  height: number;
  key: string;
  url: string;
  width: number;
}
