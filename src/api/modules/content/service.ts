import { and, db, eq } from "@/api/lib/db";
import { homeContent, openingHours, siteSettings } from "@/db/schema/content";
import { DomainError } from "../shared";
import type { SiteContent, SiteSettingsInput } from "./model";

export const initialContent: SiteContent = {
  id: "default",
  restaurantName: "Indian Coffee",
  tagline:
    "Une cuisine du Sud de l’Inde et du Sri Lanka, sincère, généreuse et préparée maison.",
  phone: "+33 (0)1 60 63 54 97",
  email: "indiancoffee77@gmail.com",
  addressLine: "8 Impasse de l’Orée du Bois",
  postalCode: "77176",
  city: "Savigny-le-Temple",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Indian+Coffee+Savigny-le-Temple",
  instagramUrl: "",
  facebookUrl: "",
  reservationNotice:
    "Votre réservation sera confirmée personnellement par notre équipe.",
  version: 1,
  hero: {
    eyebrow: "Savigny-le-Temple · Depuis 2012",
    title: "Le goût du Sud, servi avec le cœur.",
    intro:
      "Currys mijotés, tandoor brûlant et recettes de famille : une table vivante où les épices racontent une histoire.",
  },
  story: {
    title: "Une cuisine de transmission",
    body: "Indian Coffee est une maison familiale. Nous cuisinons les gestes appris au fil des générations, avec des produits frais, des épices torréfiées et le temps nécessaire pour laisser chaque sauce trouver son équilibre.",
  },
  hours: [
    { day: "Lundi — Jeudi", value: "11h00 — 22h30" },
    { day: "Vendredi — Samedi", value: "11h00 — 23h00" },
    { day: "Dimanche", value: "12h00 — 22h30" },
  ],
};

export const contentService = {
  async get(): Promise<SiteContent> {
    const [settingsRows, homeRows, hoursRows] = await Promise.all([
      db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.id, "default"))
        .limit(1),
      db
        .select()
        .from(homeContent)
        .where(eq(homeContent.id, "default"))
        .limit(1),
      db
        .select()
        .from(openingHours)
        .orderBy(openingHours.dayOfWeek, openingHours.sortOrder),
    ]);
    const settings = settingsRows[0];
    const home = homeRows[0];
    if (!settings || !home) {
      throw new Error(
        "La base est initialisée mais son contenu obligatoire est absent. Exécutez le seed.",
      );
    }

    return {
      ...settings,
      instagramUrl: settings.instagramUrl ?? "",
      facebookUrl: settings.facebookUrl ?? "",
      hero: {
        eyebrow: home.eyebrow,
        title: home.heroTitle,
        intro: home.heroIntro,
      },
      story: { title: home.storyTitle, body: home.storyBody },
      hours: hoursRows.map((slot) => ({
        day: slot.label ?? String(slot.dayOfWeek),
        value: `${slot.opensAt.slice(0, 5)} — ${slot.closesAt.slice(0, 5)}`,
      })),
    };
  },

  async updateSettings(input: SiteSettingsInput) {
    const rows = await db
      .update(siteSettings)
      .set({
        ...input,
        instagramUrl: input.instagramUrl || null,
        facebookUrl: input.facebookUrl || null,
        version: input.version + 1,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(siteSettings.id, "default"),
          eq(siteSettings.version, input.version),
        ),
      )
      .returning();
    if (!rows[0]) {
      throw new DomainError(
        "VERSION_CONFLICT",
        "Le contenu a été modifié ailleurs.",
        409,
      );
    }
    return rows[0];
  },
};
