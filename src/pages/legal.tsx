import { appUrl, headLinks, socialMeta } from "@/lib/head";
import { route } from "./root";

/**
 * Les mentions légales sont obligatoires pour tout site professionnel français
 * (articles 6-III de la LCEN et L.111-1 du code de la consommation). Le site n'en
 * comportait aucune.
 *
 * Les champs entre crochets relèvent de l'état civil de la société : ils doivent
 * être complétés par l'exploitant, ils ne peuvent pas être devinés depuis le code.
 */
export default route.page({
  component: ({
    restaurantName,
    addressLine,
    postalCode,
    city,
    phone,
    email,
  }) => (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <p className="eyebrow text-primary">Informations légales</p>
      <h1 className="mt-3 font-display text-title">Mentions légales</h1>

      <section className="mt-10">
        <h2 className="font-display text-heading">Éditeur du site</h2>
        <dl className="mt-4 flex flex-col gap-3">
          <div>
            <dt className="text-muted-foreground text-sm">
              Dénomination sociale
            </dt>
            <dd>{restaurantName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Adresse</dt>
            <dd>
              {addressLine}, {postalCode} {city}, France
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Téléphone</dt>
            <dd>
              <a
                className="underline underline-offset-2"
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              >
                {phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Courriel</dt>
            <dd>
              <a
                className="underline underline-offset-2"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">
              Forme juridique, capital social et RCS
            </dt>
            <dd>[à compléter par l’exploitant]</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">
              Numéro SIRET et TVA intracommunautaire
            </dt>
            <dd>[à compléter par l’exploitant]</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">
              Responsable de la publication
            </dt>
            <dd>[à compléter par l’exploitant]</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Hébergement</h2>
        <p className="mt-3 text-muted-foreground">
          Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
          91789, États-Unis. La base de données est opérée par Neon Inc. au sein
          de l’Union européenne.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Propriété intellectuelle</h2>
        <p className="mt-3 text-muted-foreground">
          Les textes, photographies et éléments graphiques présents sur ce site
          sont la propriété de l’éditeur, sauf mention contraire. Toute
          reproduction sans autorisation écrite est interdite.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Prix et prestations</h2>
        <p className="mt-3 text-muted-foreground">
          Les prix affichés sur la carte sont exprimés en euros, toutes taxes
          comprises. Ils sont donnés à titre indicatif et peuvent évoluer ;
          seuls les prix affichés en salle font foi. Une demande de réservation
          transmise par ce site ne constitue pas une réservation confirmée :
          elle le devient après notre réponse par courriel.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Allergènes</h2>
        <p className="mt-3 text-muted-foreground">
          Conformément au règlement (UE) n° 1169/2011, les informations
          relatives aux allergènes présents dans nos plats sont disponibles sur
          demande auprès de notre personnel. Les mentions de régime figurant sur
          la carte en ligne sont indicatives.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Médiation</h2>
        <p className="mt-3 text-muted-foreground">
          En cas de litige non résolu directement avec nous, vous pouvez saisir
          gratuitement un médiateur de la consommation. Les coordonnées du
          médiateur compétent sont disponibles sur demande.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Données personnelles</h2>
        <p className="mt-3 text-muted-foreground">
          Le traitement des informations transmises via le formulaire de
          réservation est détaillé dans notre{" "}
          <a className="underline underline-offset-2" href="/privacy">
            politique de confidentialité
          </a>
          .
        </p>
      </section>
    </article>
  ),
  head: () => ({
    links: headLinks({ href: `${appUrl}/legal`, rel: "canonical" }),
    meta: [
      ...socialMeta({
        description:
          "Informations légales du restaurant Indian Coffee à Savigny-le-Temple.",
        image: `${appUrl}/public/cover.webp`,
        title: "Mentions légales · Indian Coffee",
        url: `${appUrl}/legal`,
      }),
      { content: "index, follow", name: "robots" },
    ],
  }),
  loader: async () => ({}),
  tags: ["content"],
});
