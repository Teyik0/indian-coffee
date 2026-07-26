import type { SiteContent } from "@/api/modules/content/model";

export function PublicFooter({ content }: { content: SiteContent }) {
  return (
    <footer className="mt-24 bg-tamarind text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div className="flex max-w-md flex-col gap-4">
          <p className="font-display text-3xl">Indian Coffee</p>
          <p className="text-primary-foreground/75">{content.tagline}</p>
          <a className="w-fit underline underline-offset-4" href="/admin">
            Administration
          </a>
        </div>
        <div className="flex flex-col gap-3">
          <p className="font-semibold uppercase tracking-[0.18em] text-saffron text-xs">
            Nous trouver
          </p>
          <address className="not-italic text-primary-foreground/80">
            {content.addressLine}
            <br />
            {content.postalCode} {content.city}
          </address>
          <a href={`tel:${content.phone.replace(/\s/g, "")}`}>
            {content.phone}
          </a>
        </div>
        <div className="flex flex-col gap-3">
          <p className="font-semibold uppercase tracking-[0.18em] text-saffron text-xs">
            Explorer
          </p>
          <a href="/menu">La carte</a>
          <a href="/contact">Réserver une table</a>
          <a href="/privacy">Confidentialité</a>
        </div>
      </div>
      <div className="border-primary-foreground/15 border-t px-5 py-5 text-center text-primary-foreground/60 text-sm">
        © {new Date().getFullYear()} Indian Coffee · Savigny-le-Temple
      </div>
    </footer>
  );
}
