// biome-ignore-all lint/performance/noJsxPropsBind: Furin composite slots are component factories
import {
  CompositeComponent,
  createCompositeComponent,
} from "@teyik0/furin/rsc";
import { Clock3Icon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type { ComponentType } from "react";
import { ReservationForm } from "@/components/public/reservation-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApi, unwrapApiResult } from "@/lib/api-client";
import { route } from "../root";

type IconComponent = ComponentType<{ className?: string }>;

export default route.page({
  tags: ["content"],
  loader: async () => {
    const content = unwrapApiResult(await getApi().api.content.get());
    return {
      shell: await createCompositeComponent<{
        ClockIcon: IconComponent;
        Form: ComponentType;
        MailIcon: IconComponent;
        MapPinIcon: IconComponent;
        PhoneIcon: IconComponent;
      }>(({ ClockIcon, Form, MailIcon, MapPinIcon, PhoneIcon }) => (
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mb-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-3 font-semibold uppercase tracking-[0.22em] text-primary text-xs">
                Votre table
              </p>
              <h1 className="max-w-4xl text-balance font-display text-5xl leading-[0.98] sm:text-7xl">
                Prenons le temps de vous recevoir.
              </h1>
            </div>
            <p className="max-w-xl text-lg text-muted-foreground">
              {content.reservationNotice} Pour les groupes de plus de 20
              personnes, appelez-nous directement.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">
                  Demande de réservation
                </CardTitle>
                <CardDescription>
                  La demande n’est définitive qu’après réception de notre
                  confirmation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>Nous contacter</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <a
                    className="flex items-start gap-3"
                    href={`tel:${content.phone.replace(/\s/g, "")}`}
                  >
                    <PhoneIcon className="mt-0.5 text-primary" />
                    <span>
                      <strong className="block">Téléphone</strong>
                      {content.phone}
                    </span>
                  </a>
                  <a
                    className="flex items-start gap-3"
                    href={`mailto:${content.email}`}
                  >
                    <MailIcon className="mt-0.5 text-primary" />
                    <span>
                      <strong className="block">Email</strong>
                      {content.email}
                    </span>
                  </a>
                  <a
                    className="flex items-start gap-3"
                    href={content.mapUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MapPinIcon className="mt-0.5 text-primary" />
                    <span>
                      <strong className="block">Adresse</strong>
                      {content.addressLine}
                      <br />
                      {content.postalCode} {content.city}
                    </span>
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClockIcon /> Horaires
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {content.hours.map((slot) => (
                    <div className="flex justify-between gap-5" key={slot.day}>
                      <span>{slot.day}</span>
                      <strong>{slot.value}</strong>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <a
                className="group relative min-h-60 overflow-hidden rounded-xl bg-tamarind p-7 text-primary-foreground"
                href={content.mapUrl}
                rel="noreferrer"
                target="_blank"
              >
                <span className="relative flex h-full flex-col justify-between gap-12">
                  <span className="font-display text-3xl">
                    Afficher l’itinéraire
                  </span>
                  <span className="text-primary-foreground/70">
                    La carte interactive ne se charge qu’après votre clic.
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      )),
    };
  },
  head: () => ({
    meta: [
      { title: "Réserver une table · Indian Coffee" },
      {
        name: "description",
        content:
          "Demandez une réservation chez Indian Coffee à Savigny-le-Temple.",
      },
    ],
  }),
  component: ({ shell }) => (
    <CompositeComponent
      ClockIcon={(props) => <Clock3Icon {...props} />}
      Form={() => <ReservationForm />}
      MailIcon={(props) => <MailIcon {...props} />}
      MapPinIcon={(props) => <MapPinIcon {...props} />}
      PhoneIcon={(props) => <PhoneIcon {...props} />}
      src={shell}
    />
  ),
});
