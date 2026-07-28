import type { SiteContent } from "@/api/modules/content/model";

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <rect
        height="17"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
        width="17"
        x="3.5"
        y="3.5"
      />
      <circle
        cx="12"
        cy="12"
        r="3.75"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="17.4" cy="6.8" fill="currentColor" r="1.1" />
    </svg>
  );
}

/**
 * Le pied de page exposait un lien « Administration » aux clients, n'affichait
 * aucun réseau social alors qu'ils sont en base, et ne renvoyait vers aucune
 * mention légale — obligatoire pour un site commercial français.
 */
export function PublicFooter({ content }: { content: SiteContent }) {
  const socials = [
    { href: content.instagramUrl, label: "Instagram" },
    { href: content.facebookUrl, label: "Facebook" },
  ].filter((entry): entry is { label: string; href: string } =>
    Boolean(entry.href)
  );

  return (
    <footer className="madras-footer grain relative mt-24 overflow-hidden bg-tamarind pb-24 text-paper lg:pb-0">
      <p aria-hidden className="madras-footer-mark">
        IC
      </p>
      <div className="relative mx-auto grid max-w-[90rem] gap-12 px-5 py-20 md:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8">
        <div className="flex max-w-md flex-col gap-4">
          <div className="flex items-center gap-3">
            <img
              alt=""
              className="size-12 rounded-full ring-1 ring-paper/25"
              height={48}
              loading="lazy"
              src="/public/indian-coffee-logo.webp"
              width={48}
            />
            <p className="font-display text-3xl">{content.restaurantName}</p>
          </div>
          <p className="text-paper/75">{content.tagline}</p>
          {socials.length > 0 ? (
            <ul className="mt-2 flex gap-4">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    aria-label={social.label}
                    className="flex size-11 items-center justify-center rounded-full border border-paper/30 text-paper transition-colors hover:border-saffron hover:bg-saffron hover:text-tamarind focus-visible:outline-2 focus-visible:outline-saffron focus-visible:outline-offset-4"
                    href={social.href}
                    rel="noreferrer me"
                    target="_blank"
                  >
                    {social.label === "Instagram" ? (
                      <InstagramIcon />
                    ) : (
                      <span aria-hidden className="font-semibold text-sm">
                        f
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <p className="eyebrow text-saffron">Nous trouver</p>
          <address className="text-paper/80 not-italic">
            {content.addressLine}
            <br />
            {content.postalCode} {content.city}
          </address>
          <a
            className="hover:text-saffron"
            href={`tel:${content.phone.replace(/[^\d+]/g, "")}`}
          >
            {content.phone}
          </a>
          <a className="hover:text-saffron" href={`mailto:${content.email}`}>
            {content.email}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <p className="eyebrow text-saffron">Horaires</p>
          <dl className="flex flex-col gap-1.5 text-paper/80 text-sm">
            {content.hours.map((slot) => (
              <div
                className={
                  slot.isoDays.includes(content.todayIsoDay)
                    ? "flex justify-between gap-3 font-semibold text-paper"
                    : "flex justify-between gap-3"
                }
                key={slot.day}
              >
                <dt>{slot.day}</dt>
                <dd className="numeric">{slot.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <p className="eyebrow text-saffron">Explorer</p>
          <a className="hover:text-saffron" href="/menu">
            La carte
          </a>
          <a className="hover:text-saffron" href="/gallery">
            Galerie
          </a>
          <a className="hover:text-saffron" href="/contact">
            Réserver une table
          </a>
          <a className="hover:text-saffron" href="/legal">
            Mentions légales
          </a>
          <a className="hover:text-saffron" href="/privacy">
            Confidentialité
          </a>
        </div>
      </div>

      <div className="relative flex flex-col justify-between gap-2 border-paper/15 border-t px-5 py-5 text-paper/60 text-xs uppercase tracking-[0.12em] sm:flex-row lg:px-8">
        <span>
          © {new Date().getFullYear()} {content.restaurantName}
        </span>
        <span>Savigny-le-Temple · Inde du Sud × Sri Lanka</span>
      </div>
    </footer>
  );
}
