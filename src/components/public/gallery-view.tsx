import { useState } from "react";
import type { GalleryImage } from "@/api/modules/gallery/model";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResponsiveImage } from "./responsive-image";

export function GalleryView({ images }: { images: GalleryImage[] }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const visible = images.slice(0, visibleCount);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {visible.map((image) => (
          <button
            aria-label={`Agrandir ${image.alt}`}
            className="group mb-4 block w-full overflow-hidden rounded-xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            key={image.id}
            onClick={() => setSelected(image)}
            type="button"
          >
            <ResponsiveImage
              alt={image.alt}
              className="w-full transition duration-500 group-hover:scale-[1.025]"
              height={image.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={image.src}
              width={image.width}
            />
            <span className="sr-only">{image.caption}</span>
          </button>
        ))}
      </div>
      {visibleCount < images.length ? (
        <div className="mt-10 flex justify-center">
          <Button
            onClick={() => setVisibleCount((count) => count + 12)}
            variant="outline"
          >
            Charger plus de photos
          </Button>
        </div>
      ) : null}

      <Dialog
        onOpenChange={(open) => (open ? undefined : setSelected(null))}
        open={selected !== null}
      >
        <DialogContent className="max-w-4xl p-3" showCloseButton>
          <DialogHeader className="sr-only">
            <DialogTitle>{selected?.alt ?? "Photo Indian Coffee"}</DialogTitle>
            <DialogDescription>
              {selected?.caption ?? "Galerie du restaurant"}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <ResponsiveImage
              alt={selected.alt}
              className="max-h-[80svh] w-full rounded-lg object-contain"
              height={selected.height}
              priority
              src={selected.src}
              width={selected.width}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
