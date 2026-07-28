import { Link, useRouter } from "@teyik0/furin/link";
import { MenuIcon, PhoneIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { OpenState } from "@/api/modules/content/model";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { OpenStatus } from "./open-status";

const navigation = [
  { label: "Accueil", to: "/" },
  { label: "La carte", to: "/menu" },
  { label: "Galerie", to: "/gallery" },
  { label: "Réserver", to: "/contact" },
] as const;

function isActivePath(pathname: string, target: string): boolean {
  return target === "/"
    ? pathname === target
    : pathname === target || pathname.startsWith(`${target}/`);
}

export function PublicHeader({
  openState,
  phone,
}: {
  openState: OpenState;
  phone: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pathname, setPathname] = useState("/");
  const { currentHref } = useRouter();
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "/contact";

  useEffect(() => {
    setPathname(currentHref.split("?")[0] || "/");
  }, [currentHref]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      {/* Lien d'évitement : la navigation au clavier commençait par traverser
          tout l'en-tête avant d'atteindre le contenu. */}
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        href="#contenu"
      >
        Aller au contenu
      </a>

      <header className="madras-header sticky top-0 z-40 border-paper/15 border-b bg-tamarind text-paper">
        <div className="mx-auto flex h-20 max-w-[90rem] items-center justify-between gap-4 px-5 lg:px-8">
          <Link className="group flex items-center gap-3" to="/">
            <img
              alt="Indian Coffee"
              className="size-12 rounded-full object-cover ring-1 ring-primary-foreground/25"
              height={48}
              src="/public/indian-coffee-logo.webp"
              width={48}
            />
            <span className="flex flex-col">
              <span className="font-display font-semibold text-xl leading-none tracking-tight transition group-hover:text-saffron">
                Indian Coffee
              </span>
              <span className="mt-1 hidden text-[0.62rem] text-paper/55 uppercase tracking-[0.18em] sm:block">
                Maison depuis 2012
              </span>
            </span>
          </Link>

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-8 md:flex"
          >
            {navigation.map((item) => {
              const active = isActivePath(pathname, item.to);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "madras-nav-link",
                    active && "madras-nav-link-active"
                  )}
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <OpenStatus
              className="madras-open-status"
              size="sm"
              state={openState}
            />
            <a
              className={buttonVariants({ variant: "outline" })}
              href={telHref}
            >
              <PhoneIcon data-icon="inline-start" />
              Appeler
            </a>
            <Link className={buttonVariants()} to="/contact">
              Réserver
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet onOpenChange={setMobileMenuOpen} open={mobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    aria-label="Ouvrir le menu"
                    size="icon"
                    variant="outline"
                  />
                }
              >
                <MenuIcon />
              </SheetTrigger>
              <SheetContent className="maison-madras" side="right">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl">
                    Indian Coffee
                  </SheetTitle>
                  <SheetDescription>
                    Restaurant indien à Savigny-le-Temple
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4">
                  <OpenStatus state={openState} />
                </div>
                <nav
                  aria-label="Navigation mobile"
                  className="flex flex-col gap-2 px-4"
                >
                  {navigation.map((item) => {
                    const active = isActivePath(pathname, item.to);
                    return (
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          "justify-start",
                          active && "bg-accent text-accent-foreground"
                        )}
                        key={item.to}
                        onClick={closeMobileMenu}
                        to={item.to}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Barre d'appel collante : sur mobile, l'appel est de loin la première
          action attendue d'un site de restaurant. */}
      <div className="print-hidden fixed inset-x-0 bottom-0 z-40 flex gap-2 border-paper/15 border-t bg-tamarind p-3 text-paper lg:hidden">
        <a
          className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
          href={telHref}
        >
          <PhoneIcon data-icon="inline-start" />
          Appeler
        </a>
        <Link className={cn(buttonVariants(), "flex-1")} to="/contact">
          Réserver une table
        </Link>
      </div>
    </>
  );
}
