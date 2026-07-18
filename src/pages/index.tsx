import { Link } from "@teyik0/furin/link";
import { ArrowRightIcon, Clock3Icon, MapPinIcon, UtensilsIcon } from "lucide-react";
import { galleryService } from "@/api/modules/gallery/service";
import { menuService } from "@/api/modules/menu/service";
import { ResponsiveImage } from "@/components/public/responsive-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { route } from "./root";

export default route.page({
  head: () => ({
    links: [{ rel: "icon", href: "/public/favicon.webp", type: "image/webp" }],
    meta: [
      { title: "Indian Coffee · Restaurant indien à Savigny-le-Temple" },
      {
        name: "description",
        content: "Cuisine indienne et sri-lankaise faite maison à Savigny-le-Temple.",
      },
    ],
  }),
  loader: async () => {
    const [featured, gallery] = await Promise.all([
      menuService.getFeatured(),
      galleryService.getPage(1),
    ]);
    return { featured, gallery: gallery.images.slice(0, 6) };
  },
  component: ({ featured, gallery, hero, story, hours, addressLine, postalCode, city, mapUrl }) => (
    <>
      <section className="hero-grain relative overflow-hidden bg-tamarind text-primary-foreground">
        <div className="mx-auto grid min-h-[76svh] max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal flex flex-col justify-center gap-8 px-5 py-20 lg:px-8 lg:py-28">
            <p className="font-semibold uppercase tracking-[0.24em] text-saffron text-xs">
              {hero.eyebrow}
            </p>
            <h1 className="max-w-3xl text-balance font-display text-5xl leading-[0.96] sm:text-6xl lg:text-8xl">
              {hero.title}
            </h1>
            <p className="max-w-xl text-lg text-primary-foreground/78 leading-relaxed">
              {hero.intro}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button nativeButton={false} render={<Link to="/menu" />} size="lg">
                Découvrir la carte <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button
                nativeButton={false}
                render={<Link to="/contact" />}
                size="lg"
                variant="outline"
              >
                Réserver une table
              </Button>
            </div>
          </div>
          <div className="reveal reveal-late relative min-h-96 lg:min-h-full">
            <ResponsiveImage
              alt="Table généreuse de spécialités indiennes chez Indian Coffee"
              className="absolute inset-0 size-full"
              height={1000}
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              src="/public/cover.webp"
              width={1000}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tamarind/60 via-transparent to-transparent lg:bg-gradient-to-r" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="mb-4 font-semibold uppercase tracking-[0.22em] text-primary text-xs">
            Notre histoire
          </p>
          <h2 className="text-balance font-display text-4xl leading-tight sm:text-5xl">
            {story.title}
          </h2>
        </div>
        <div className="flex flex-col gap-8">
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{story.body}</p>
          <div className="editorial-rule" />
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <UtensilsIcon className="text-primary" />
              <span>Préparé maison</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock3Icon className="text-primary" />
              <span>Service 7 jours sur 7</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPinIcon className="text-primary" />
              <span>Savigny-le-Temple</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/55 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 font-semibold uppercase tracking-[0.22em] text-primary text-xs">
                À goûter
              </p>
              <h2 className="font-display text-4xl sm:text-5xl">Les signatures de la maison</h2>
            </div>
            <Button nativeButton={false} render={<Link to="/menu" />} variant="outline">
              Voir toute la carte
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((dish, index) => (
              <Card className="bg-card/85" key={dish.id}>
                <ResponsiveImage
                  alt={dish.name}
                  className="aspect-[4/3] w-full"
                  height={400}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={
                    [
                      "/public/butter-chicken.webp",
                      "/public/kottu-roti.webp",
                      "/public/mixed-tandoori.webp",
                    ][index] ?? "/public/main-course-asset.webp"
                  }
                  width={400}
                />
                <CardHeader>
                  <CardTitle className="text-2xl">{dish.name}</CardTitle>
                  <CardDescription>{dish.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mb-10 grid gap-6 md:grid-cols-2 md:items-end">
          <h2 className="font-display text-4xl sm:text-5xl">Un aperçu de notre table</h2>
          <p className="max-w-xl text-muted-foreground md:justify-self-end">
            Des assiettes colorées, un tandoor brûlant et une salle pensée pour prendre le temps.
          </p>
        </div>
        <div className="grid auto-rows-[12rem] grid-cols-2 gap-3 md:grid-cols-4">
          {gallery.map((image, index) => (
            <ResponsiveImage
              alt={image.alt}
              className={`size-full rounded-xl ${index === 0 || index === 5 ? "col-span-2 row-span-2" : ""}`}
              height={image.height}
              key={image.id}
              sizes="(max-width: 768px) 50vw, 25vw"
              src={image.src}
              width={image.width}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8">
        <Card className="bg-tamarind text-primary-foreground ring-0">
          <CardHeader className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 font-semibold uppercase tracking-[0.22em] text-saffron text-xs">
                Venir chez nous
              </p>
              <CardTitle className="text-4xl">À quelques minutes de Carré Sénart</CardTitle>
            </div>
            <CardDescription className="text-primary-foreground/70 md:text-lg">
              {addressLine}, {postalCode} {city}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              {hours.map((slot) => (
                <div className="flex justify-between gap-4" key={slot.day}>
                  <span>{slot.day}</span>
                  <span>{slot.value}</span>
                </div>
              ))}
            </div>
            <Button
              className="md:justify-self-end"
              nativeButton={false}
              render={
                <a
                  aria-label="Ouvrir l’itinéraire vers Indian Coffee"
                  href={mapUrl}
                  rel="noreferrer"
                  target="_blank"
                />
              }
              variant="secondary"
            >
              Ouvrir l’itinéraire <MapPinIcon data-icon="inline-end" />
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  ),
});
