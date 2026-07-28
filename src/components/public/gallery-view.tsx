import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/api/modules/gallery/model";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaImage } from "./responsive-image";

const PAGE_SIZE = 12;

export function GalleryView({ images }: { images: GalleryImage[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const visible = images.slice(0, visibleCount);
  const selected = selectedIndex === null ? null : images[selectedIndex];
  const hasMore = visibleCount < images.length;

  const step = useCallback(
    (direction: -1 | 1) => {
      setSelectedIndex((current) => {
        if (current === null) {
          return current;
        }
        const next = current + direction;
        if (next < 0) {
          return images.length - 1;
        }
        if (next >= images.length) {
          return 0;
        }
        return next;
      });
    },
    [images.length]
  );

  const openImage = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.dataset.index);
    if (Number.isInteger(index)) {
      setSelectedIndex(index);
    }
  }, []);

  const closeViewer = useCallback((open: boolean) => {
    if (!open) {
      setSelectedIndex(null);
    }
  }, []);

  const showPrevious = useCallback(() => {
    step(-1);
  }, [step]);

  const showNext = useCallback(() => {
    step(1);
  }, [step]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!(hasMore && loadMoreElement)) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setVisibleCount(images.length);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount(Math.min(visibleCount + PAGE_SIZE, images.length));
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [hasMore, images.length, visibleCount]);

  // Flèches gauche/droite dans la visionneuse : attendu de tout diaporama.
  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        step(-1);
      }
      if (event.key === "ArrowRight") {
        step(1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, step]);

  return (
    <>
      <ul className="madras-gallery grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((image, index) => (
          <li
            className={
              index % 7 === 0 ? "sm:col-span-2 sm:row-span-2" : undefined
            }
            key={image.id}
          >
            <button
              aria-label={`Agrandir : ${image.alt}`}
              className="group block size-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              data-index={index}
              onClick={openImage}
              type="button"
            >
              <MediaImage
                className={`size-full transition duration-500 group-hover:scale-[1.03] ${
                  index % 7 === 0 ? "aspect-square" : "aspect-4/3"
                }`}
                media={image}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </button>
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="sr-only">
        {visible.length} photos affichées sur {images.length}.
      </p>

      {hasMore ? (
        <div aria-hidden="true" className="h-px" ref={loadMoreRef} />
      ) : null}

      <Dialog onOpenChange={closeViewer} open={selected !== null}>
        <DialogContent className="max-w-5xl p-3" showCloseButton>
          <DialogHeader className="sr-only">
            <DialogTitle>{selected?.alt ?? "Photo Indian Coffee"}</DialogTitle>
            <DialogDescription>
              {selected?.caption ?? "Galerie du restaurant"}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="relative">
              <MediaImage
                className="max-h-[80svh] w-full rounded-lg object-contain"
                media={selected}
                priority
                sizes="90vw"
              />
              <Button
                aria-label="Photo précédente"
                className="absolute top-1/2 left-2 -translate-y-1/2"
                onClick={showPrevious}
                size="icon"
                variant="secondary"
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                aria-label="Photo suivante"
                className="absolute top-1/2 right-2 -translate-y-1/2"
                onClick={showNext}
                size="icon"
                variant="secondary"
              >
                <ChevronRightIcon />
              </Button>
              {selected.caption ? (
                <p className="mt-2 text-center text-muted-foreground text-sm">
                  {selected.caption}
                </p>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
