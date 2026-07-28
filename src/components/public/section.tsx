import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Primitives de rythme éditorial. Chaque page recopiait auparavant
 * `mx-auto max-w-7xl px-5 py-24 lg:px-8`, ce qui donnait huit sections
 * strictement identiques et interdisait toute variation de tempo.
 */

type Tone = "paper" | "warm" | "ink";
type Rhythm = "tight" | "normal" | "loose" | "none";

const toneClass: Record<Tone, string> = {
  // Panneau sombre, grain compris : c'est le contrepoint des sections claires.
  ink: "grain bg-tamarind text-paper",
  paper: "",
  warm: "bg-secondary/45",
};

const rhythmClass: Record<Rhythm, string> = {
  loose: "py-24 sm:py-32",
  none: "",
  normal: "py-16 sm:py-24",
  tight: "py-12 sm:py-16",
};

export function Section({
  children,
  className,
  tone = "paper",
  rhythm = "normal",
  width = "default",
  ...props
}: ComponentProps<"section"> & {
  tone?: Tone;
  rhythm?: Rhythm;
  width?: "default" | "narrow" | "wide" | "full";
}) {
  const inner =
    width === "full"
      ? null
      : cn(
          "mx-auto px-5 lg:px-8",
          width === "narrow" && "max-w-3xl",
          width === "default" && "max-w-7xl",
          width === "wide" && "max-w-[90rem]"
        );

  if (inner === null) {
    return (
      <section
        className={cn(toneClass[tone], rhythmClass[rhythm], className)}
        {...props}
      >
        {children}
      </section>
    );
  }

  return (
    <section
      className={cn(toneClass[tone], rhythmClass[rhythm], className)}
      {...props}
    >
      <div className={inner}>{children}</div>
    </section>
  );
}

export function Eyebrow({
  children,
  className,
  tone = "primary",
}: {
  children: ReactNode;
  className?: string;
  tone?: "primary" | "saffron" | "muted";
}) {
  return (
    <p
      className={cn(
        "eyebrow",
        tone === "primary" && "text-primary",
        tone === "saffron" && "text-saffron",
        tone === "muted" && "text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}

/**
 * En-tête de section. `aside` permet de poser une action ou un paragraphe à
 * l'opposé du titre sans réinventer la grille à chaque fois.
 */
export function SectionHeader({
  eyebrow,
  eyebrowTone,
  title,
  description,
  aside,
  align = "split",
  className,
  as: Heading = "h2",
}: {
  eyebrow?: ReactNode;
  eyebrowTone?: "primary" | "saffron" | "muted";
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  align?: "split" | "stacked" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "split" &&
          "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "mx-auto max-w-3xl text-center",
        className
      )}
    >
      <div className={cn(align === "split" && "max-w-2xl")}>
        {eyebrow ? (
          <Eyebrow className="mb-3" tone={eyebrowTone}>
            {eyebrow}
          </Eyebrow>
        ) : null}
        <Heading className="font-display text-title">{title}</Heading>
        {description ? (
          <p className="mt-4 text-lead text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {aside ? (
        <div className={cn(align === "split" && "shrink-0")}>{aside}</div>
      ) : null}
    </div>
  );
}
