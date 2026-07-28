import type { CSSProperties, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Forme minimale commune aux médias de la carte et de la galerie. */
export interface ImageSource {
  alt: string;
  height: number;
  /** Data-URI de flou produite à l'upload par `Bun.Image.placeholder()`. */
  placeholder?: string | null;
  src: string;
  srcSet?: string;
  width: number;
}

type ResponsiveImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "alt" | "src"
> & {
  alt: string;
  src: string;
  priority?: boolean;
  placeholder?: string | null;
};

/**
 * Les trois variantes WebP et le placeholder flou sont générés à l'upload et
 * stockés depuis toujours ; une seule URL était servie, sans `srcSet` ni
 * transition de chargement. Le composant les expose enfin.
 */
export function ResponsiveImage({
  alt,
  className,
  height,
  placeholder,
  priority = false,
  style,
  width,
  ...props
}: ResponsiveImageProps) {
  const blurStyle: CSSProperties | undefined = placeholder
    ? {
        backgroundImage: `url("${placeholder}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        ...style,
      }
    : style;

  return (
    <img
      alt={alt}
      className={cn("block object-cover", className)}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      height={height}
      loading={priority ? "eager" : "lazy"}
      style={blurStyle}
      width={width}
      {...props}
    />
  );
}

/** Variante qui accepte directement un média issu de l'API. */
export function MediaImage({
  media,
  className,
  sizes,
  priority = false,
}: {
  media: ImageSource;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <ResponsiveImage
      alt={media.alt}
      className={className}
      height={media.height}
      placeholder={media.placeholder}
      priority={priority}
      sizes={sizes}
      src={media.src}
      srcSet={media.srcSet}
      width={media.width}
    />
  );
}
