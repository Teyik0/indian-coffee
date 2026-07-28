import { and, db, eq } from "@/api/lib/db";
import { isoWeekday, parisDayKey } from "@/api/lib/paris-time";
import { homeContent, siteSettings } from "@/db/schema/content";
import { DomainError } from "../shared";
import type {
  HomeContentInput,
  ReservationSettingsInput,
  SiteContent,
  SiteSettingsInput,
} from "./model";
import {
  groupWeekForDisplay,
  openingHoursService,
} from "./opening-hours.service";

/**
 * Valeurs de départ du seed. Les horaires vivent désormais dans
 * `initialWeeklyHours` (opening-hours.service) puisqu'ils se dérivent de la
 * grille des sept jours au lieu d'être une liste figée.
 */
export const initialContent = {
  addressLine: "8 Impasse de l’Orée du Bois",
  city: "Savigny-le-Temple",
  email: "indiancoffee77@gmail.com",
  facebookUrl: "",
  hero: {
    eyebrow: "Savigny-le-Temple · Depuis 2012",
    intro:
      "Currys mijotés, tandoor brûlant et recettes de famille : une table vivante où les épices racontent une histoire.",
    title: "Le goût du Sud, servi avec le cœur.",
  },
  id: "default",
  instagramUrl: "",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Indian+Coffee+Savigny-le-Temple",
  phone: "+33 (0)1 60 63 54 97",
  postalCode: "77176",
  reservationNotice:
    "Votre réservation sera confirmée personnellement par notre équipe.",
  restaurantName: "Indian Coffee",
  story: {
    body: "Indian Coffee est une maison familiale. Nous cuisinons les gestes appris au fil des générations, avec des produits frais, des épices torréfiées et le temps nécessaire pour laisser chaque sauce trouver son équilibre.",
    title: "Une cuisine de transmission",
  },
  tagline:
    "Une cuisine du Sud de l’Inde et du Sri Lanka, sincère, généreuse et préparée maison.",
  version: 1,
} satisfies Pick<
  SiteContent,
  | "id"
  | "restaurantName"
  | "tagline"
  | "phone"
  | "email"
  | "addressLine"
  | "postalCode"
  | "city"
  | "mapUrl"
  | "instagramUrl"
  | "facebookUrl"
  | "reservationNotice"
  | "version"
  | "hero"
  | "story"
>;

export const contentService = {
  async get(): Promise<SiteContent> {
    const now = new Date();
    const [[settings], [home], week, openState] = await Promise.all([
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
      openingHoursService.getWeek(),
      openingHoursService.getOpenState(now),
    ]);
    if (!(settings && home)) {
      throw new Error(
        "La base est initialisée mais son contenu obligatoire est absent. Exécutez le seed."
      );
    }

    return {
      ...settings,
      facebookUrl: settings.facebookUrl ?? "",
      hero: {
        eyebrow: home.eyebrow,
        intro: home.heroIntro,
        title: home.heroTitle,
      },
      homeVersion: home.version,
      // Le regroupement est calculé ici, plus stocké dans le libellé : les
      // horaires redeviennent éditables jour par jour.
      hours: groupWeekForDisplay(week),
      instagramUrl: settings.instagramUrl ?? "",
      openState,
      story: { body: home.storyBody, title: home.storyTitle },
      todayIsoDay: isoWeekday(parisDayKey(now)),
      week,
    };
  },

  async updateHome(input: HomeContentInput) {
    const rows = await db
      .update(homeContent)
      .set({
        eyebrow: input.eyebrow,
        heroIntro: input.heroIntro,
        heroMediaId: input.heroMediaId || null,
        heroTitle: input.heroTitle,
        storyBody: input.storyBody,
        storyMediaId: input.storyMediaId || null,
        storyTitle: input.storyTitle,
        updatedAt: new Date(),
        version: input.version + 1,
      })
      .where(
        and(
          eq(homeContent.id, "default"),
          eq(homeContent.version, input.version)
        )
      )
      .returning();
    if (!rows[0]) {
      throw new DomainError(
        "VERSION_CONFLICT",
        "La page d’accueil a été modifiée ailleurs. Rechargez le contenu.",
        409
      );
    }
    return rows[0];
  },

  /** Réglages de réservation : ils gouvernent créneaux, capacité et horizon. */
  async updateReservationSettings(input: ReservationSettingsInput) {
    const [row] = await db
      .update(siteSettings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(siteSettings.id, "default"))
      .returning();
    if (!row) {
      throw new DomainError(
        "SETTINGS_NOT_FOUND",
        "Les réglages du site sont absents. Exécutez le seed.",
        404
      );
    }
    return row;
  },

  async updateSettings(input: SiteSettingsInput) {
    const rows = await db
      .update(siteSettings)
      .set({
        ...input,
        facebookUrl: input.facebookUrl || null,
        instagramUrl: input.instagramUrl || null,
        updatedAt: new Date(),
        version: input.version + 1,
      })
      .where(
        and(
          eq(siteSettings.id, "default"),
          eq(siteSettings.version, input.version)
        )
      )
      .returning();
    if (!rows[0]) {
      throw new DomainError(
        "VERSION_CONFLICT",
        "Le contenu a été modifié ailleurs.",
        409
      );
    }
    return rows[0];
  },
};
