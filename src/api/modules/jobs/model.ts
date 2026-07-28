import * as v from "valibot";

export const EmailJobSchema = v.object({
  reference: v.string(),
  reservationId: v.pipe(v.string(), v.uuid()),
  template: v.string(),
  to: v.pipe(v.string(), v.email()),
});

export const MediaDeleteJobSchema = v.object({
  keys: v.pipe(v.array(v.string()), v.minLength(1)),
});
