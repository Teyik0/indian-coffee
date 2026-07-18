import { galleryService } from "@/api/modules/gallery/service";
import { GalleryView } from "@/components/public/gallery-view";
import { route } from "../root";

export default route.page({
  loader: async () => {
    const pages = await Promise.all([1, 2, 3, 4].map((page) => galleryService.getPage(page)));
    return { images: pages.flatMap((entry) => entry.images) };
  },
  head: () => ({
    meta: [
      { title: "Galerie · Indian Coffee" },
      {
        name: "description",
        content: "Découvrez les plats et l’ambiance du restaurant Indian Coffee.",
      },
    ],
  }),
  component: ({ images }) => (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-14 grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <p className="mb-3 font-semibold uppercase tracking-[0.22em] text-primary text-xs">
            En images
          </p>
          <h1 className="font-display text-5xl sm:text-7xl">La salle, le feu, les assiettes.</h1>
        </div>
        <p className="max-w-xl text-lg text-muted-foreground md:justify-self-end">
          Quelques instants de service et les plats qui font vivre Indian Coffee au quotidien.
        </p>
      </div>
      <GalleryView images={images} />
    </div>
  ),
});
