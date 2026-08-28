import { FlameIcon, PrinterIcon, SearchIcon, XIcon } from "lucide-react";
import type { ChangeEvent, MouseEvent, ReactNode } from "react";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import type { MenuCategoryView } from "@/api/modules/menu/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { formatPriceCents, SPICE_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Match {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  count: number;
  sections: MenuCategoryView["sections"];
}

/**
 * La recherche ne filtrait que la catégorie active : chercher « biryani » depuis
 * « Desserts » ne renvoyait rien, alors que le plat existe. Elle balaie
 * désormais toute la carte et indique le nombre de résultats par catégorie.
 */
export function MenuView({ categories }: { categories: MenuCategoryView[] }) {
  const [firstCategory] = categories;
  const [activeSlug, setActiveSlug] = useState(
    firstCategory ? firstCategory.slug : ""
  );
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(
    search.trim().toLocaleLowerCase("fr-FR")
  );

  const matches = useMemo<Match[]>(() => {
    if (!deferredSearch) {
      return [];
    }
    return categories.flatMap((category) => {
      const sections = category.sections.flatMap((section) => {
        const items = section.items.filter((item) =>
          `${item.name} ${item.description}`
            .toLocaleLowerCase("fr-FR")
            .includes(deferredSearch)
        );
        return items.length > 0
          ? [
              {
                ...section,
                items,
              },
            ]
          : [];
      });
      const count = sections.reduce(
        (total, section) => total + section.items.length,
        0
      );
      return count > 0
        ? [
            {
              categoryId: category.id,
              categoryName: category.name,
              categorySlug: category.slug,
              count,
              sections,
            },
          ]
        : [];
    });
  }, [categories, deferredSearch]);

  const totalMatches = matches.reduce((total, entry) => total + entry.count, 0);
  const searching = deferredSearch.length > 0;
  const current =
    categories.find((category) => category.slug === activeSlug) ??
    categories[0];

  const hasDietaryInfo = categories.some((category) =>
    category.sections.some((section) =>
      section.items.some(
        (item) => item.dietaryFlags.length > 0 || item.spiceLevel
      )
    )
  );

  const selectCategory = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const { slug } = event.currentTarget.dataset;
    if (slug) {
      setActiveSlug(slug);
      setSearch("");
    }
  }, []);

  const printMenu = useCallback(() => {
    window.print();
  }, []);

  const updateSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  let menuContent: ReactNode;
  if (!searching) {
    menuContent = (
      <div className="flex flex-col gap-14">
        <MenuSections sections={current?.sections ?? []} />
      </div>
    );
  } else if (matches.length === 0) {
    menuContent = (
      <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Aucun plat ne correspond à « {search.trim()} ».
      </p>
    );
  } else {
    menuContent = (
      <div className="flex flex-col gap-14">
        {matches.map((match) => (
          <section key={match.categoryId}>
            <h3 className="mb-6 font-display text-2xl">{match.categoryName}</h3>
            <MenuSections sections={match.sections} />
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="madras-menu mx-auto max-w-[90rem] px-5 py-16 lg:px-8 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
        <aside className="print-hidden min-w-0 max-w-full lg:sticky lg:top-24 lg:h-fit">
          <div className="madras-menu-nav flex max-w-full gap-2 overflow-x-auto pb-3 lg:flex-col lg:overflow-visible">
            {categories.map((category) => {
              const matched = matches.find(
                (entry) => entry.categoryId === category.id
              );
              return (
                <Button
                  className="shrink-0 justify-start gap-2"
                  data-slug={category.slug}
                  key={category.slug}
                  onClick={selectCategory}
                  variant={
                    !searching && category.slug === current?.slug
                      ? "default"
                      : "ghost"
                  }
                >
                  {category.name}
                  {/* Le compteur montre où se trouvent les résultats, plutôt
                      que de laisser croire qu'il n'y en a aucun. */}
                  {searching ? (
                    <Badge
                      className="ml-auto"
                      variant={matched ? "secondary" : "outline"}
                    >
                      {matched?.count ?? 0}
                    </Badge>
                  ) : null}
                </Button>
              );
            })}
          </div>

          <Button
            className="mt-4 w-full"
            onClick={printMenu}
            size="sm"
            variant="outline"
          >
            <PrinterIcon data-icon="inline-start" />
            Imprimer la carte
          </Button>
        </aside>

        <div className="min-w-0">
          <div className="mb-10 flex flex-col gap-6 border-border border-b pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow mb-2 text-primary">La carte</p>
              <h2 className="font-display text-title">
                {searching
                  ? `Résultats pour « ${search.trim()} »`
                  : current?.name}
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                {searching
                  ? `${totalMatches} plat${totalMatches > 1 ? "s" : ""} sur l’ensemble de la carte.`
                  : current?.description}
              </p>
            </div>
            <InputGroup className="print-hidden w-full md:max-w-xs">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Rechercher un plat dans toute la carte"
                onChange={updateSearch}
                placeholder="Rechercher dans toute la carte…"
                value={search}
              />
              {search ? (
                <InputGroupAddon align="inline-end">
                  <Button
                    aria-label="Effacer la recherche"
                    onClick={clearSearch}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <XIcon />
                  </Button>
                </InputGroupAddon>
              ) : null}
            </InputGroup>
          </div>

          {/* Annonce vocale du nombre de résultats. */}
          <p aria-live="polite" className="sr-only">
            {searching
              ? `${totalMatches} résultat${totalMatches > 1 ? "s" : ""}`
              : ""}
          </p>

          {menuContent}

          {hasDietaryInfo ? (
            <div className="mt-14 rounded-xl border bg-card/60 p-6">
              <h3 className="font-display text-lg">Repères</h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Les mentions de régime sont indicatives. Pour une allergie,
                signalez-le en salle ou par téléphone : la cuisine adapte quand
                c’est possible.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                <li>
                  <Badge className="gap-1" variant="secondary">
                    <FlameIcon className="size-3" />
                    Niveau d’épice
                  </Badge>
                </li>
                <li>
                  <Badge variant="outline">Régime ou allergène</Badge>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MenuSections({
  sections,
}: {
  sections: MenuCategoryView["sections"];
}) {
  if (sections.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Cette partie de la carte est en cours de mise à jour.
      </p>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <section id={`section-${section.id}`} key={section.id}>
          <div className="mb-6">
            <h4 className="font-display text-2xl">{section.name}</h4>
            {section.description ? (
              <p className="mt-1 text-muted-foreground text-sm">
                {section.description}
              </p>
            ) : null}
          </div>
          <div className="grid gap-x-10 md:grid-cols-2">
            {section.items.map((item) => (
              <article
                className={cn(
                  "madras-menu-item print-break-avoid border-border border-t py-5",
                  item.status === "UNAVAILABLE" && "opacity-70"
                )}
                key={item.id}
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-semibold text-lg">{item.name}</h5>
                      {item.status === "UNAVAILABLE" ? (
                        // `destructive` plutôt qu'`outline` : le contraste du
                        // badge sortant était trop faible pour être lu.
                        <Badge variant="destructive">
                          Indisponible aujourd’hui
                        </Badge>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p className="mt-1 text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    ) : null}
                    {item.spiceLevel || item.dietaryFlags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.spiceLevel ? (
                          <Badge className="gap-1" variant="secondary">
                            <FlameIcon className="size-3" />
                            {SPICE_LABELS[item.spiceLevel]}
                          </Badge>
                        ) : null}
                        {item.dietaryFlags.map((flag) => (
                          <Badge key={flag} variant="outline">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="numeric shrink-0 text-right font-semibold">
                    {item.variants.map((variant) => (
                      <div className="flex justify-end gap-2" key={variant.id}>
                        {variant.label ? (
                          <span className="font-normal text-muted-foreground text-xs">
                            {variant.label}
                          </span>
                        ) : null}
                        <span>{formatPriceCents(variant.priceCents)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
