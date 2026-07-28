import { appUrl, headLinks } from "@/lib/head";
import { route } from "./root";

export default route.page({
  tags: ["content"],
  head: () => ({
    links: headLinks({ href: `${appUrl}/privacy`, rel: "canonical" }),
    meta: [
      { title: "Politique de confidentialité · Indian Coffee" },
      {
        name: "description",
        content:
          "Comment Indian Coffee traite les données transmises via le formulaire de réservation.",
      },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: ({ restaurantName, addressLine, postalCode, city, email }) => (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <p className="eyebrow text-primary">Vos données</p>
      <h1 className="mt-3 font-display text-title">
        Politique de confidentialité
      </h1>
      <p className="mt-6 text-lead text-muted-foreground">
        Cette page décrit les informations que nous collectons lorsque vous
        demandez une table, pourquoi nous le faisons, combien de temps nous les
        conservons et comment exercer vos droits.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-heading">Responsable du traitement</h2>
        <p className="mt-3 text-muted-foreground">
          {restaurantName}, {addressLine}, {postalCode} {city}. Pour toute
          question relative à vos données :{" "}
          <a className="underline underline-offset-2" href={`mailto:${email}`}>
            {email}
          </a>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">
          Données collectées et finalités
        </h2>
        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-semibold">Données</th>
              <th className="py-2 pr-4 font-semibold">Finalité</th>
              <th className="py-2 font-semibold">Base légale</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b">
              <td className="py-3 pr-4">
                Nom, téléphone, adresse électronique
              </td>
              <td className="py-3 pr-4">
                Vous répondre et organiser votre venue
              </td>
              <td className="py-3">
                Exécution d’un contrat (art. 6.1.b) — votre demande de
                réservation
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-3 pr-4">
                Date, heure, nombre de convives, occasion, message libre
              </td>
              <td className="py-3 pr-4">
                Préparer la table et tenir compte de vos contraintes
              </td>
              <td className="py-3">Exécution d’un contrat (art. 6.1.b)</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 pr-4">
                Adresse IP et horodatage de la demande
              </td>
              <td className="py-3 pr-4">
                Limiter les envois automatisés et les abus
              </td>
              <td className="py-3">
                Intérêt légitime (art. 6.1.f) — sécurité du service
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-muted-foreground">
          Aucun champ n’est facultatif à des fins commerciales : nous ne
          collectons rien qui ne serve directement à traiter votre demande. Nous
          ne vous adressons aucune communication publicitaire.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Durée de conservation</h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
          <li>
            Demandes de réservation : douze mois à compter de la date demandée,
            puis suppression ou anonymisation.
          </li>
          <li>
            Journal technique de limitation des envois : une heure pour le
            compteur, vingt-quatre heures pour la clé d’idempotence.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Destinataires</h2>
        <p className="mt-3 text-muted-foreground">
          Vos données sont accessibles à l’équipe du restaurant habilitée à
          gérer les réservations. Nous faisons appel aux sous-traitants
          suivants, chacun lié par un contrat conforme à l’article 28 du RGPD :
        </p>
        <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
          <li>
            <strong>Neon</strong> — hébergement de la base de données, au sein
            de l’Union européenne.
          </li>
          <li>
            <strong>Vercel</strong> — hébergement de l’application. Des
            transferts hors UE peuvent avoir lieu, encadrés par les clauses
            contractuelles types de la Commission européenne.
          </li>
          <li>
            <strong>Resend</strong> — envoi des courriels de confirmation, avec
            le même encadrement contractuel.
          </li>
          <li>
            <strong>UploadThing</strong> — stockage des photographies du site.
            Aucune donnée de réservation ne lui est transmise.
          </li>
        </ul>
        <p className="mt-4 text-muted-foreground">
          Nous ne vendons ni ne louons vos données à des tiers.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Cookies et traceurs</h2>
        <p className="mt-3 text-muted-foreground">
          Le site public ne dépose aucun cookie publicitaire ni de mesure
          d’audience, et n’intègre aucune carte ni vidéo tierce : le lien vers
          l’itinéraire ouvre Google Maps dans un nouvel onglet. Seul l’espace
          d’administration utilise un cookie de session et un cookie de
          préférence d’affichage, strictement nécessaires à son fonctionnement.
          Aucun bandeau de consentement n’est donc requis.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Vos droits</h2>
        <p className="mt-3 text-muted-foreground">
          Vous disposez d’un droit d’accès, de rectification, d’effacement, de
          limitation et d’opposition, ainsi que du droit à la portabilité de vos
          données. Écrivez à{" "}
          <a className="underline underline-offset-2" href={`mailto:${email}`}>
            {email}
          </a>{" "}
          en précisant la référence de votre réservation : nous répondons dans
          un délai d’un mois.
        </p>
        <p className="mt-3 text-muted-foreground">
          Si notre réponse ne vous satisfait pas, vous pouvez introduire une
          réclamation auprès de la CNIL, 3 place de Fontenoy, TSA 80715, 75334
          Paris Cedex 07, ou sur{" "}
          <a
            className="underline underline-offset-2"
            href="https://www.cnil.fr"
            rel="noreferrer"
            target="_blank"
          >
            cnil.fr
          </a>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-heading">Modifications</h2>
        <p className="mt-3 text-muted-foreground">
          Cette politique peut évoluer. Toute modification substantielle sera
          signalée sur cette page. Voir également nos{" "}
          <a className="underline underline-offset-2" href="/legal">
            mentions légales
          </a>
          .
        </p>
      </section>
    </article>
  ),
});
