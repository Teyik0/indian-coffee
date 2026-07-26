import * as v from "valibot";
import { VersionSchema } from "../shared";

export const SiteSettingsSchema = v.object({
  restaurantName: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
  tagline: v.pipe(v.string(), v.minLength(10), v.maxLength(180)),
  phone: v.pipe(v.string(), v.minLength(10), v.maxLength(30)),
  email: v.pipe(v.string(), v.email()),
  addressLine: v.pipe(v.string(), v.minLength(5), v.maxLength(160)),
  postalCode: v.pipe(v.string(), v.regex(/^\d{5}$/)),
  city: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
  mapUrl: v.pipe(v.string(), v.url()),
  instagramUrl: v.optional(
    v.union([v.pipe(v.string(), v.url()), v.literal("")]),
  ),
  facebookUrl: v.optional(
    v.union([v.pipe(v.string(), v.url()), v.literal("")]),
  ),
  reservationNotice: v.pipe(v.string(), v.minLength(10), v.maxLength(300)),
  version: VersionSchema,
});

export type SiteSettingsInput = v.InferOutput<typeof SiteSettingsSchema>;

export type SiteContent = SiteSettingsInput & {
  id: string;
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  story: {
    title: string;
    body: string;
  };
  hours: Array<{ day: string; value: string }>;
};
