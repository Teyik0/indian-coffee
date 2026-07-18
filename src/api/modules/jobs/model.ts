import * as v from "valibot";

export const EmailJobSchema = v.object({
  template: v.string(),
  to: v.pipe(v.string(), v.email()),
  reservationId: v.pipe(v.string(), v.uuid()),
  reference: v.string(),
});

export const MediaDeleteJobSchema = v.object({
  keys: v.pipe(v.array(v.string()), v.minLength(1)),
});
