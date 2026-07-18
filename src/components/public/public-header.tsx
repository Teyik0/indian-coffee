import { Link } from "@teyik0/furin/link";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { to: "/", label: "Accueil" },
  { to: "/menu", label: "La carte" },
  { to: "/gallery", label: "Galerie" },
  { to: "/contact", label: "Réserver" },
] as const;

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link className="group flex items-center gap-3" to="/">
          <img
            alt="Indian Coffee"
            className="size-11 rounded-full object-cover ring-1 ring-tamarind/20"
            height={44}
            src="/public/indian-coffee-logo.webp"
            width={44}
          />
          <span className="font-display text-xl font-semibold tracking-tight group-hover:text-primary">
            Indian Coffee
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Button
              key={item.to}
              nativeButton={false}
              render={<Link to={item.to} />}
              variant="ghost"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="md:hidden">
          <Sheet onOpenChange={setMobileMenuOpen} open={mobileMenuOpen}>
            <SheetTrigger
              render={<Button aria-label="Ouvrir le menu" size="icon" variant="outline" />}
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Indian Coffee</SheetTitle>
                <SheetDescription>Restaurant indien à Savigny-le-Temple</SheetDescription>
              </SheetHeader>
              <nav aria-label="Navigation mobile" className="flex flex-col gap-2 px-4">
                {navigation.map((item) => (
                  <Button
                    className="justify-start"
                    key={item.to}
                    nativeButton={false}
                    onClick={() => setMobileMenuOpen(false)}
                    render={<Link to={item.to} />}
                    variant="ghost"
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
