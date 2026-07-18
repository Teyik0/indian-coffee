import type { GalleryImage } from "./model";

const filenames = [
  "lamb-tikka.webp",
  "onion-bhaji.webp",
  "eggplant-bhaji.webp",
  "chicken-65.webp",
  "falooda.webp",
  "tandoori-prawns.webp",
  "gulab-jamun.webp",
  "gallery-1.webp",
  "gallery-2.webp",
  "gallery-3.webp",
  "kessari.webp",
  "kottu-roti.webp",
  "butter-chicken.webp",
  "mixed-fried-rice.webp",
  "mixed-tandoori.webp",
  "chicken-tikka.webp",
  "tandoori-chicken.webp",
  "rolls.webp",
  "fruit-salad.webp",
  "samosa.webp",
  "thali.webp",
  "dessert-asset.webp",
  "starter-asset.webp",
  "menu-asset.webp",
  "menu-asset-2.webp",
  "menu-asset-3.webp",
  "menu-asset-4.webp",
  "main-course-asset.webp",
  "vegetarian-dishes-asset.webp",
  "vegetarian-dishes-asset-2.webp",
  "specialties-asset.webp",
  "specialties-asset-2.webp",
  "vegetable-asset.webp",
  "cover.webp",
  "cover1.webp",
  "cover2.webp",
  "cover3.webp",
  "cover4.webp",
  "cover5.webp",
  "dessert-cover.webp",
] as const;

function humanize(filename: string) {
  return filename
    .replace(/\.webp$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/^asset /i, "")
    .replace(/^cover\d*/i, "Ambiance Indian Coffee");
}

export const gallerySeed: GalleryImage[] = filenames.map((filename, index) => ({
  id: `legacy-${index + 1}`,
  src: `/public/${filename}`,
  alt: humanize(filename),
  caption: humanize(filename),
  width: filename.startsWith("cover") ? 1000 : 400,
  height: filename.startsWith("cover") ? 667 : 400,
}));
