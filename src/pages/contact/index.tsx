import { Clock3Icon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { OpenStatus } from "@/components/public/open-status";
import { ReservationForm } from "@/components/public/reservation-form";
import { Section } from "@/components/public/section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { appUrl, headLinks, socialMeta } from "@/lib/head";
import { route } from "../root";

export default route.page({
  tags: ["content", "reservations"],
  head: () => ({
    links: headLinks({ href: `${appUrl}/contact`, rel: "canonical" }),
    meta: socialMeta({
      description:
        "Demandez une table chez Indian Coffee à Savigny-le-Temple : créneaux disponibles, horaires et itinéraire.",
      image: `${appUrl}/public/cover.webp`,
      title: "Réserver une table · Indian Coffee",
      url: `${appUrl}/contact`,
    }),
  }),
  loader: async () => ({
    calendar: unwrapApiResult(
      await getApi().api.reservations.calendar.get({ query: { days: 60 } })
    ),
  }),
  component: ({
    calendar,
    reservationNotice,
    phone,
    email,
    addressLine,
    postalCode,
    city,
    mapUrl,
    hours,
    todayIsoDay,
    openState,
  }) => (
    <>
      <section className="madras-page-hero grain">
        <div className="madras-page-hero-inner">
          <div className="madras-page-hero-copy">
            <p className="eyebrow mb-5 text-saffron">Votre table</p>
            <h1>
              Prenons le temps
              <br />
              <em>de vous recevoir.</em>
            </h1>
            <p>
              {reservationNotice} Pour un groupe de plus de{" "}
              {calendar.maxPartySize} personnes, appelez-nous directement.
            </p>
            <OpenStatus
              className="madras-open-status mt-6 self-start"
              state={openState}
            />
          </div>
          <div className="madras-page-hero-image">
            <img
              alt="Salle du restaurant Indian Coffee"
              decoding="async"
              fetchPriority="high"
              height={750}
              src="/public/cover2.webp"
              width={1000}
            />
          </div>
        </div>
      </section>

      <Section rhythm="normal">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <Card className="madras-reservation-card shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-3xl">
                Demande de réservation
              </CardTitle>
              <CardDescription>
                La table n’est retenue qu’après réception de notre confirmation
                par courriel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReservationForm calendar={calendar} />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Nous contacter</CardTitle>
                <CardDescription>
                  Le téléphone reste le plus rapide pour une demande de dernière
                  minute.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <a
                  className="flex items-start gap-3 hover:text-primary"
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                >
                  <PhoneIcon className="mt-0.5 shrink-0 text-primary" />
                  <span>
                    <strong className="block">Téléphone</strong>
                    {phone}
                  </span>
                </a>
                <a
                  className="flex items-start gap-3 hover:text-primary"
                  href={`mailto:${email}`}
                >
                  <MailIcon className="mt-0.5 shrink-0 text-primary" />
                  <span>
                    <strong className="block">Email</strong>
                    {email}
                  </span>
                </a>
                <a
                  className="flex items-start gap-3 hover:text-primary"
                  href={mapUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MapPinIcon className="mt-0.5 shrink-0 text-primary" />
                  <span>
                    <strong className="block">Adresse</strong>
                    {addressLine}
                    <br />
                    {postalCode} {city}
                  </span>
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock3Icon className="text-primary" /> Horaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="flex flex-col gap-2">
                  {hours.map((slot) => {
                    const isToday = slot.isoDays.includes(todayIsoDay);
                    return (
                      <div
                        className={
                          isToday
                            ? "flex items-baseline justify-between gap-5 rounded-md bg-secondary/60 px-2 py-1 font-semibold"
                            : "flex items-baseline justify-between gap-5 px-2 py-1"
                        }
                        key={slot.day}
                      >
                        <dt>{slot.day}</dt>
                        <dd className="numeric">{slot.value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </CardContent>
            </Card>

            <a
              className="group relative flex min-h-60 flex-col justify-between gap-12 overflow-hidden bg-tamarind p-7 text-paper transition hover:shadow-lift"
              href={mapUrl}
              rel="noreferrer"
              target="_blank"
            >
              <span className="font-display text-3xl">
                Afficher l’itinéraire
              </span>
              <span className="text-paper/70">
                Ouvre Google Maps dans un nouvel onglet. Aucune carte tierce
                n’est chargée sur cette page.
              </span>
            </a>
          </div>
        </div>
      </Section>
    </>
  ),
});
