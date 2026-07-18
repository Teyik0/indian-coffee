import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ResponsiveImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> & {
  alt: string;
  priority?: boolean;
};

export function ResponsiveImage({
  alt,
  className,
  priority = false,
  ...props
}: ResponsiveImageProps) {
  return (
    <img
      alt={alt}
      className={cn("block object-cover", className)}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      {...props}
    />
  );
}
