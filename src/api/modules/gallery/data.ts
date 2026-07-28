/**
 * Visuels historiques servis depuis `public/`. Ils n'ont pas de variantes
 * générées ni de flou de chargement : ce sont des fichiers statiques, pas des
 * médias uploadés, d'où une forme distincte de `GalleryImage`.
 */
export interface GallerySeedImage {
  alt: string;
  caption: string;
  height: number;
  id: string;
  src: string;
  width: number;
}

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

const WEBP_EXTENSION_PATTERN = /\.webp$/i;
const WORD_SEPARATOR_PATTERN = /[-_]/g;
const ASSET_PREFIX_PATTERN = /^asset /i;
const COVER_PREFIX_PATTERN = /^cover\d*/i;

function humanize(filename: string) {
  return filename
    .replace(WEBP_EXTENSION_PATTERN, "")
    .replace(WORD_SEPARATOR_PATTERN, " ")
    .replace(ASSET_PREFIX_PATTERN, "")
    .replace(COVER_PREFIX_PATTERN, "Ambiance Indian Coffee");
}

export const gallerySeed: GallerySeedImage[] = filenames.map(
  (filename, index) => ({
    alt: humanize(filename),
    caption: humanize(filename),
    height: filename.startsWith("cover") ? 667 : 400,
    id: `legacy-${index + 1}`,
    src: `/public/${filename}`,
    width: filename.startsWith("cover") ? 1000 : 400,
  })
);
