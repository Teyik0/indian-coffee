import * as Effect from "effect4/Effect";
import { GalleryView } from "@/components/public/gallery-view";
import { Section, SectionHeader } from "@/components/public/section";
import { apiEffect, getApi, runLoaderEffect } from "@/lib/api-client";
import { appUrl, headLinks, socialMeta } from "@/lib/head";
import { route } from "../root";

export default route.page({
  tags: ["content", "gallery"],
  head: () => ({
    links: headLinks({ href: `${appUrl}/gallery`, rel: "canonical" }),
    meta: socialMeta({
      description:
        "Les plats, la salle et le tandoor du restaurant Indian Coffee à Savigny-le-Temple.",
      image: `${appUrl}/public/gallery-1.webp`,
      title: "Galerie · Indian Coffee",
      url: `${appUrl}/gallery`,
    }),
  }),
  loader: () =>
    runLoaderEffect(
      Effect.gen(function* () {
        const first = yield* apiEffect((signal) =>
          getApi().api.gallery.get({ fetch: { signal }, query: { page: 1 } })
        );
        const remaining = yield* Effect.all(
          Array.from(
            {
              length: Math.max(0, Math.ceil(first.total / first.pageSize) - 1),
            },
            (_, index) =>
              apiEffect((signal) =>
                getApi().api.gallery.get({
                  fetch: { signal },
                  query: { page: index + 2 },
                })
              )
          ),
          { concurrency: "unbounded" }
        );
        return {
          images: [first, ...remaining].flatMap((page) => page.images),
        };
      })
    ),
  component: ({ images }) => (
    <>
      <section className="madras-page-hero grain">
        <div className="madras-page-hero-inner">
          <div className="madras-page-hero-copy">
            <p className="eyebrow mb-5 text-saffron">En images</p>
            <h1>
              La salle, le feu,
              <br />
              <em>les assiettes.</em>
            </h1>
            <p>
              Quelques instants de service et les plats qui font vivre Indian
              Coffee au quotidien.
            </p>
          </div>
          <div className="madras-page-hero-image">
            <img
              alt="Salle du restaurant Indian Coffee"
              decoding="async"
              fetchPriority="high"
              height={750}
              src="/public/cover5.webp"
              width={1000}
            />
          </div>
        </div>
      </section>
      <Section rhythm="normal">
        <SectionHeader
          description="Des assiettes généreuses, la salle et les moments de partage."
          eyebrow="La maison"
          title="Un regard sur Indian Coffee"
        />
        <GalleryView images={images} />
      </Section>
    </>
  ),
});
