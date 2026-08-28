import { Link } from "@teyik0/furin/link";
import * as Effect from "effect4/Effect";
import {
  ArrowRightIcon,
  Clock3Icon,
  MapPinIcon,
  PhoneIcon,
  UtensilsIcon,
} from "lucide-react";
import type { MenuCategoryView } from "@/api/modules/menu/model";
import { MediaImage } from "@/components/public/responsive-image";
import { Section, SectionHeader } from "@/components/public/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { apiEffect, getApi, runLoaderEffect } from "@/lib/api-client";
import { formatPriceRange, SPICE_LABELS } from "@/lib/format";
import { appUrl, headLinks, headScripts, socialMeta } from "@/lib/head";
import { cn } from "@/lib/utils";
import { route } from "./root";

function splitHeroTitle(title: string): [string, string] {
  const titleBreak = title.indexOf(",");
  if (titleBreak === -1) {
    return [title, ""];
  }
  return [title.slice(0, titleBreak), title.slice(titleBreak + 1).trim()];
}

function collectSignatures(categories: MenuCategoryView[]) {
  const signatures: MenuCategoryView["sections"][number]["items"] = [];
  for (const category of categories) {
    for (const section of category.sections) {
      for (const item of section.items) {
        if (item.featured) {
          signatures.push(item);
        }
        if (signatures.length === 3) {
          return signatures;
        }
      }
    }
  }
  return signatures;
}

function HomeHero({
  hero,
}: {
  hero: { eyebrow: string; intro: string; title: string };
}) {
  const [heroLead, heroAccent] = splitHeroTitle(hero.title);

  return (
    <section className="madras-hero grain relative overflow-hidden bg-tamarind text-paper">
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-[90rem] items-center lg:grid-cols-[0.82fr_1.18fr]">
        <div className="reveal relative z-10 flex flex-col justify-center px-5 py-20 lg:px-8 lg:py-28">
          <p className="madras-hero-location">
            {hero.eyebrow}
            <span aria-hidden />
            Maison depuis 2012
          </p>
          <h1 className="madras-hero-title">
            {heroLead}
            {heroAccent ? (
              <>
                <br />
                <em>{heroAccent}</em>
              </>
            ) : null}
          </h1>
          <p className="mt-9 max-w-xl text-lead text-paper/72">{hero.intro}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a className="madras-hero-primary-action" href="/menu">
              Découvrir la carte <span aria-hidden>→</span>
            </a>
            <a className="madras-hero-secondary-action" href="/contact">
              Réserver une table
            </a>
          </div>
        </div>
        <div className="madras-hero-image reveal reveal-late relative min-h-96 lg:min-h-[calc(100svh-8rem)]">
          <img
            alt="Table de spécialités indiennes servie chez Indian Coffee"
            className="absolute inset-0 size-full object-cover"
            decoding="async"
            fetchPriority="high"
            height={432}
            src="/public/cover1.webp"
            width={1000}
          />
          <div className="madras-hero-image-shade" />
          <div className="madras-hero-service">
            <span>Ce soir</span>
            <strong>Service jusqu’à 22h30</strong>
          </div>
        </div>
      </div>
      <p aria-hidden className="madras-hero-mark">
        IC
      </p>
    </section>
  );
}

async function homeLoader() {
  return await runLoaderEffect(
    Effect.gen(function* () {
      const { categories, gallery } = yield* Effect.all(
        {
          categories: apiEffect((signal) =>
            getApi().api.menu.get({ fetch: { signal } })
          ),
          gallery: apiEffect((signal) =>
            getApi().api.gallery.get({ fetch: { signal }, query: { page: 1 } })
          ),
        },
        { concurrency: "unbounded" }
      );
      const signatures = collectSignatures(categories);

      return {
        gallery: gallery.images.slice(0, 5),
        signatures,
      };
    })
  );
}

export default route.page({
  component: ({
    signatures,
    gallery,
    hero,
    story,
    hours,
    todayIsoDay,
    addressLine,
    postalCode,
    city,
    mapUrl,
    phone,
  }) => (
    <>
      <HomeHero hero={hero} />

      {/* Bandeau de repères : trois faits concrets, sans surtitre ni gros titre
          supplémentaires — le rythme change au lieu de répéter le même bloc. */}
      <Section className="border-b" rhythm="tight">
        <ul className="grid gap-6 sm:grid-cols-3">
          <li className="flex items-center gap-3">
            <UtensilsIcon className="shrink-0 text-primary" />
            <span>
              <strong className="block">Préparé maison</strong>
              <span className="text-muted-foreground text-sm">
                Épices torréfiées, sauces mijotées
              </span>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Clock3Icon className="shrink-0 text-primary" />
            <span>
              <strong className="block">Service continu</strong>
              <span className="text-muted-foreground text-sm">
                Midi et soir, sept jours sur sept
              </span>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <MapPinIcon className="shrink-0 text-primary" />
            <span>
              <strong className="block">{city}</strong>
              <span className="text-muted-foreground text-sm">
                À quelques minutes de Carré Sénart
              </span>
            </span>
          </li>
        </ul>
      </Section>

      {/* Histoire : photo en chevauchement, pour rompre l'alignement
          systématique des sections. */}
      <Section rhythm="loose">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="madras-story-photo reveal relative">
            <img
              alt="Assortiment de spécialités Indian Coffee"
              className="madras-story-collage w-full object-contain"
              height={800}
              loading="lazy"
              src="/public/story.webp"
              width={1000}
            />
            <div className="madras-story-year hidden bg-primary px-6 py-5 text-primary-foreground shadow-panel lg:block">
              <p className="font-display text-4xl leading-none">2012</p>
              <p className="mt-1 text-primary-foreground/70 text-xs">
                Ouverture de la maison
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <p className="eyebrow text-primary">Notre histoire</p>
            <h2 className="font-display text-title">{story.title}</h2>
            <div className="editorial-rule" />
            <p className="text-lead text-muted-foreground">{story.body}</p>
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "self-start"
              )}
              to="/gallery"
            >
              Voir la galerie
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </div>
        </div>
      </Section>

      {signatures.length > 0 ? (
        <Section rhythm="loose" tone="warm">
          <SectionHeader
            aside={
              <Link
                className={buttonVariants({ variant: "outline" })}
                to="/menu"
              >
                Voir toute la carte
              </Link>
            }
            eyebrow="À goûter"
            title="Les signatures de la maison"
          />
          <div className="reveal-stagger grid gap-6 md:grid-cols-3">
            {signatures.map((dish) => (
              <article
                className="madras-dish-card group flex flex-col overflow-hidden bg-card shadow-card transition duration-500 hover:shadow-lift"
                key={dish.id}
              >
                <div className="aspect-4/3 overflow-hidden">
                  {dish.media ? (
                    <MediaImage
                      className="size-full transition duration-700 group-hover:scale-105"
                      media={{
                        alt: dish.media.alt || dish.name,
                        height: dish.media.mediumHeight,
                        placeholder: dish.media.placeholder,
                        src: dish.media.mediumUrl,
                        srcSet: `${dish.media.thumbUrl} ${dish.media.thumbWidth}w, ${dish.media.mediumUrl} ${dish.media.mediumWidth}w, ${dish.media.largeUrl} ${dish.media.largeWidth}w`,
                        width: dish.media.mediumWidth,
                      }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-muted text-muted-foreground text-sm">
                      Photo à venir
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl leading-tight">
                      {dish.name}
                    </h3>
                    <span className="numeric shrink-0 font-display text-lg text-primary">
                      {formatPriceRange(
                        dish.variants.map((variant) => variant.priceCents)
                      )}
                    </span>
                  </div>
                  {dish.description ? (
                    <p className="text-muted-foreground">{dish.description}</p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {dish.spiceLevel ? (
                      <Badge variant="secondary">
                        {SPICE_LABELS[dish.spiceLevel]}
                      </Badge>
                    ) : null}
                    {dish.dietaryFlags.map((flag) => (
                      <Badge key={flag} variant="outline">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {gallery.length > 0 ? (
        <Section rhythm="loose">
          <SectionHeader
            description="Des assiettes colorées, un tandoor brûlant et une salle pensée pour prendre le temps."
            eyebrow="En images"
            title="Un aperçu de notre table"
          />
          {/* Ratios volontairement inégaux : la grille régulière précédente
              donnait une planche-contact. */}
          <div className="madras-gallery-grid grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
            {gallery.map((image, index) => (
              <MediaImage
                className={`size-full rounded-xl ${
                  index === 0 ? "md:col-span-2 md:row-span-2" : "aspect-square"
                }`}
                key={image.id}
                media={image}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ))}
          </div>
        </Section>
      ) : null}

      {/* Panneau pratique : la ligne du jour est mise en évidence, ce qui rend
          le bloc utile plutôt que décoratif. */}
      <Section rhythm="normal">
        <div className="grain grid gap-10 overflow-hidden bg-tamarind p-8 text-paper shadow-panel md:grid-cols-2 md:p-12">
          <div className="flex flex-col gap-5">
            <p className="eyebrow text-saffron">Venir chez nous</p>
            <h2 className="font-display text-title">
              À quelques minutes de Carré Sénart
            </h2>
            <address className="text-lead text-paper/78 not-italic">
              {addressLine}
              <br />
              {postalCode} {city}
            </address>
            <div className="mt-2 flex flex-wrap gap-3">
              <a
                aria-label="Ouvrir l’itinéraire vers Indian Coffee"
                className={buttonVariants({ variant: "secondary" })}
                href={mapUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MapPinIcon data-icon="inline-start" />
                Ouvrir l’itinéraire
              </a>
              <a
                aria-label={`Appeler Indian Coffee au ${phone}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-paper/30 bg-transparent text-paper hover:bg-paper/10 hover:text-paper"
                )}
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              >
                <PhoneIcon data-icon="inline-start" />
                {phone}
              </a>
            </div>
          </div>

          <dl className="flex flex-col gap-2 md:border-paper/15 md:border-l md:pl-10">
            <p className="eyebrow mb-2 text-saffron">Horaires</p>
            {hours.map((slot) => {
              const isToday = slot.isoDays.includes(todayIsoDay);
              return (
                <div
                  className={
                    isToday
                      ? "flex items-baseline justify-between gap-4 bg-paper/10 px-3 py-1.5 font-semibold"
                      : "flex items-baseline justify-between gap-4 px-3 py-1.5 text-paper/78"
                  }
                  key={slot.day}
                >
                  <dt>
                    {slot.day}
                    {isToday ? (
                      <span className="ml-2 text-saffron text-xs">
                        aujourd’hui
                      </span>
                    ) : null}
                  </dt>
                  <dd className="numeric">{slot.value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </Section>
    </>
  ),
  head: ({ jsonLd }) => ({
    links: headLinks(
      { href: "/public/favicon.webp", rel: "icon", type: "image/webp" },
      { href: appUrl, rel: "canonical" }
    ),
    meta: socialMeta({
      description:
        "Cuisine indienne et sri-lankaise faite maison à Savigny-le-Temple. Carte, horaires et demande de réservation en ligne.",
      image: `${appUrl}/public/cover.webp`,
      title: "Indian Coffee · Restaurant indien à Savigny-le-Temple",
      type: "restaurant",
      url: appUrl,
    }),
    scripts: headScripts({
      children: jsonLd,
      type: "application/ld+json",
    }),
  }),
  loader: homeLoader,
  tags: ["content", "menu", "gallery"],
});
