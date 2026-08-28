import * as Schema from "effect4/Schema";
import { Email, mutableArray, standard, Uuid } from "@/api/effect/schema";

export const EmailJobEffectSchema = Schema.Struct({
  reference: Schema.String,
  reservationId: Uuid,
  template: Schema.String,
  to: Email,
});
export const EmailJobSchema = standard(EmailJobEffectSchema);

export const MediaDeleteJobEffectSchema = Schema.Struct({
  keys: mutableArray(Schema.String).check(Schema.isMinLength(1)),
});
export const MediaDeleteJobSchema = standard(MediaDeleteJobEffectSchema);
