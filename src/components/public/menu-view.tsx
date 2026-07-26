import { SearchIcon } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import type { MenuCategoryView } from "@/api/modules/menu/model";
import { formatPrice } from "@/api/modules/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function MenuView({ categories }: { categories: MenuCategoryView[] }) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(
    search.trim().toLocaleLowerCase("fr-FR"),
  );

  const visible = useMemo(() => {
    const selected =
      categories.find((category) => category.slug === activeSlug) ??
      categories[0];
    if (!selected) return null;
    if (!deferredSearch) return selected;
    return {
      ...selected,
      sections: selected.sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            `${item.name} ${item.description}`
              .toLocaleLowerCase("fr-FR")
              .includes(deferredSearch),
          ),
        }))
        .filter((section) => section.items.length > 0),
    };
  }, [activeSlug, categories, deferredSearch]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="flex gap-2 overflow-x-auto pb-3 lg:flex-col lg:overflow-visible">
            {categories.map((category) => (
              <Button
                className="shrink-0 justify-start"
                key={category.slug}
                onClick={() => setActiveSlug(category.slug)}
                variant={category.slug === visible?.slug ? "default" : "ghost"}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-10 flex flex-col gap-6 border-border border-b pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 font-semibold uppercase tracking-[0.2em] text-primary text-xs">
                La carte
              </p>
              <h2 className="font-display text-4xl sm:text-5xl">
                {visible?.name}
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                {visible?.description}
              </p>
            </div>
            <InputGroup className="w-full md:max-w-xs">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Rechercher un plat"
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder="Rechercher un plat…"
                value={search}
              />
            </InputGroup>
          </div>

          <div className="flex flex-col gap-14">
            {visible?.sections.map((section) => (
              <section key={section.id}>
                <div className="mb-6">
                  <h3 className="font-display text-2xl">{section.name}</h3>
                  {section.description ? (
                    <p className="mt-1 text-muted-foreground text-sm">
                      {section.description}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-x-10 md:grid-cols-2">
                  {section.items.map((item) => (
                    <article
                      className="border-border border-t py-5"
                      key={item.id}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-lg">
                              {item.name}
                            </h4>
                            {item.status === "UNAVAILABLE" ? (
                              <Badge variant="outline">Indisponible</Badge>
                            ) : null}
                          </div>
                          {item.description ? (
                            <p className="mt-1 text-muted-foreground text-sm">
                              {item.description}
                            </p>
                          ) : null}
                          {item.dietaryFlags.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {item.dietaryFlags.map((flag) => (
                                <Badge key={flag} variant="secondary">
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-right font-semibold tabular-nums">
                          {item.variants.map((variant) => (
                            <div
                              className="flex justify-end gap-2"
                              key={variant.id}
                            >
                              {variant.label ? (
                                <span className="font-normal text-muted-foreground text-xs">
                                  {variant.label}
                                </span>
                              ) : null}
                              <span>{formatPrice(variant.priceCents)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
            {visible?.sections.length === 0 ? (
              <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                Aucun plat ne correspond à votre recherche.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
