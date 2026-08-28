import { useSync } from "@teyik0/furin/client";
import { SaveIcon } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import type { SiteContent } from "@/api/modules/content/model";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, apiErrorCode, apiErrorMessage } from "@/lib/api-client";

interface SettingsDraft {
  addressLine: string;
  city: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  mapUrl: string;
  phone: string;
  postalCode: string;
  reservationNotice: string;
  restaurantName: string;
  tagline: string;
}

interface HomeDraft {
  eyebrow: string;
  heroIntro: string;
  heroTitle: string;
  storyBody: string;
  storyTitle: string;
}

function TextField({
  id,
  label,
  value,
  onChange,
  description,
  type = "text",
  placeholder,
}: {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  description?: ReactNode;
  type?: string;
  placeholder?: string;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  );
}

function AreaField({
  id,
  label,
  value,
  onChange,
  description,
  rows = 3,
}: {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  description?: ReactNode;
  rows?: number;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupTextarea
          id={id}
          onChange={(event) => onChange(event.currentTarget.value)}
          rows={rows}
          value={value}
        />
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  );
}

/**
 * Le formulaire n'exposait qu'une partie des réglages : le hero et l'histoire de
 * la page d'accueil vivaient en base sans aucune interface, et les liens sociaux
 * n'étaient éditables nulle part. Trois onglets, deux versions optimistes
 * distinctes (`site_settings` et `home_content` ont chacune la leur).
 */
function useContentForm(initialContent: SiteContent) {
  const [settings, setSettings] = useState<SettingsDraft>({
    addressLine: initialContent.addressLine,
    city: initialContent.city,
    email: initialContent.email,
    facebookUrl: initialContent.facebookUrl ?? "",
    instagramUrl: initialContent.instagramUrl ?? "",
    mapUrl: initialContent.mapUrl,
    phone: initialContent.phone,
    postalCode: initialContent.postalCode,
    reservationNotice: initialContent.reservationNotice,
    restaurantName: initialContent.restaurantName,
    tagline: initialContent.tagline,
  });
  const [home, setHome] = useState<HomeDraft>({
    eyebrow: initialContent.hero.eyebrow,
    heroIntro: initialContent.hero.intro,
    heroTitle: initialContent.hero.title,
    storyBody: initialContent.story.body,
    storyTitle: initialContent.story.title,
  });
  const [settingsBaseline, setSettingsBaseline] = useState(() =>
    JSON.stringify({
      addressLine: initialContent.addressLine,
      city: initialContent.city,
      email: initialContent.email,
      facebookUrl: initialContent.facebookUrl ?? "",
      instagramUrl: initialContent.instagramUrl ?? "",
      mapUrl: initialContent.mapUrl,
      phone: initialContent.phone,
      postalCode: initialContent.postalCode,
      reservationNotice: initialContent.reservationNotice,
      restaurantName: initialContent.restaurantName,
      tagline: initialContent.tagline,
    })
  );
  const [homeBaseline, setHomeBaseline] = useState(() =>
    JSON.stringify({
      eyebrow: initialContent.hero.eyebrow,
      heroIntro: initialContent.hero.intro,
      heroTitle: initialContent.hero.title,
      storyBody: initialContent.story.body,
      storyTitle: initialContent.story.title,
    })
  );
  const settingsVersion = useRef(initialContent.version);
  // `home_content` porte sa propre version, distincte de celle des réglages.
  const homeVersion = useRef(initialContent.homeVersion);
  const [pending, setPending] = useState<"settings" | "home" | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);

  const saveSettings = useSync(
    (input: SettingsDraft & { version: number }, options) =>
      api.api.admin.content.settings.patch(input, options)
  );
  const saveHome = useSync((input: HomeDraft & { version: number }, options) =>
    api.api.admin.content.home.patch(input, options)
  );

  const settingsDirty = JSON.stringify(settings) !== settingsBaseline;
  const homeDirty = JSON.stringify(home) !== homeBaseline;
  let dirtyLabel = "Page d’accueil modifiée";
  if (settingsDirty && homeDirty) {
    dirtyLabel = "Informations et page d’accueil modifiées";
  } else if (settingsDirty) {
    dirtyLabel = "Informations modifiées";
  }

  async function submitSettings() {
    setPending("settings");
    setConflict(null);
    const { data, error } = await saveSettings({
      ...settings,
      version: settingsVersion.current,
    });
    setPending(null);
    if (error) {
      const message = apiErrorMessage(
        error,
        "Les informations n’ont pas été enregistrées."
      );
      if (apiErrorCode(error) === "VERSION_CONFLICT") {
        setConflict(message);
      } else {
        toast.error("Enregistrement impossible", { description: message });
      }
      return;
    }
    if (data && "version" in data) {
      settingsVersion.current = data.version;
    }
    setSettingsBaseline(JSON.stringify(settings));
    toast.success("Informations enregistrées");
  }

  async function submitHome() {
    setPending("home");
    setConflict(null);
    const { data, error } = await saveHome({
      ...home,
      version: homeVersion.current,
    });
    setPending(null);
    if (error) {
      const message = apiErrorMessage(
        error,
        "La page d’accueil n’a pas été enregistrée."
      );
      if (apiErrorCode(error) === "VERSION_CONFLICT") {
        setConflict(message);
      } else {
        toast.error("Enregistrement impossible", { description: message });
      }
      return;
    }
    if (data && "version" in data) {
      homeVersion.current = data.version;
    }
    setHomeBaseline(JSON.stringify(home));
    toast.success("Page d’accueil enregistrée");
  }

  return {
    conflict,
    dirtyLabel,
    home,
    homeDirty,
    pending,
    setHome,
    setSettings,
    settings,
    settingsDirty,
    submitHome,
    submitSettings,
  };
}

export function ContentForm({
  initialContent,
}: {
  initialContent: SiteContent;
}) {
  return renderContentForm(useContentForm(initialContent));
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: la vue rend deux brouillons indépendants dans des onglets.
function renderContentForm({
  conflict,
  dirtyLabel,
  home,
  homeDirty,
  pending,
  setHome,
  setSettings,
  settings,
  settingsDirty,
  submitHome,
  submitSettings,
}: ReturnType<typeof useContentForm>) {
  return (
    <div className="flex flex-col gap-6">
      {conflict ? (
        <Alert variant="destructive">
          <AlertTitle>Modification concurrente</AlertTitle>
          <AlertDescription>
            {conflict} Rechargez la page avant de reprendre vos modifications.
          </AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="establishment">
        <TabsList>
          <TabsTrigger value="establishment">Établissement</TabsTrigger>
          <TabsTrigger value="home">Page d’accueil</TabsTrigger>
          <TabsTrigger value="social">Réseaux & réservation</TabsTrigger>
        </TabsList>

        <TabsContent className="pt-6" value="establishment">
          <Card>
            <CardHeader>
              <CardTitle>Informations du restaurant</CardTitle>
              <CardDescription>
                Reprises dans l’en-tête, le pied de page, la page contact et les
                données structurées lues par Google.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-5 md:grid-cols-2">
                  <TextField
                    id="content-name"
                    label="Nom"
                    onChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        restaurantName: value,
                      }))
                    }
                    value={settings.restaurantName}
                  />
                  <TextField
                    id="content-phone"
                    label="Téléphone"
                    onChange={(value) =>
                      setSettings((current) => ({ ...current, phone: value }))
                    }
                    value={settings.phone}
                  />
                </div>
                <AreaField
                  description="Phrase de présentation affichée dans le pied de page."
                  id="content-tagline"
                  label="Accroche"
                  onChange={(value) =>
                    setSettings((current) => ({ ...current, tagline: value }))
                  }
                  value={settings.tagline}
                />
                <div className="grid gap-5 md:grid-cols-2">
                  <TextField
                    id="content-email"
                    label="Email"
                    onChange={(value) =>
                      setSettings((current) => ({ ...current, email: value }))
                    }
                    type="email"
                    value={settings.email}
                  />
                  <TextField
                    id="content-address"
                    label="Adresse"
                    onChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        addressLine: value,
                      }))
                    }
                    value={settings.addressLine}
                  />
                </div>
                <div className="grid gap-5 md:grid-cols-[10rem_1fr]">
                  <TextField
                    id="content-postal"
                    label="Code postal"
                    onChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        postalCode: value,
                      }))
                    }
                    value={settings.postalCode}
                  />
                  <TextField
                    id="content-city"
                    label="Ville"
                    onChange={(value) =>
                      setSettings((current) => ({ ...current, city: value }))
                    }
                    value={settings.city}
                  />
                </div>
                <TextField
                  description="Lien ouvert par le bouton « itinéraire »."
                  id="content-map"
                  label="Lien Google Maps"
                  onChange={(value) =>
                    setSettings((current) => ({ ...current, mapUrl: value }))
                  }
                  value={settings.mapUrl}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="pt-6" value="home">
          <div className="grid gap-6 xl:grid-cols-[1fr_22rem] xl:items-start">
            <Card>
              <CardHeader>
                <CardTitle>Bloc d’accueil</CardTitle>
                <CardDescription>
                  Ces textes n’étaient éditables nulle part : il fallait
                  modifier la base pour changer le titre de la page d’accueil.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <TextField
                    description="Petite ligne au-dessus du titre."
                    id="home-eyebrow"
                    label="Surtitre"
                    onChange={(value) =>
                      setHome((current) => ({ ...current, eyebrow: value }))
                    }
                    value={home.eyebrow}
                  />
                  <TextField
                    id="home-title"
                    label="Titre principal"
                    onChange={(value) =>
                      setHome((current) => ({ ...current, heroTitle: value }))
                    }
                    value={home.heroTitle}
                  />
                  <AreaField
                    id="home-intro"
                    label="Introduction"
                    onChange={(value) =>
                      setHome((current) => ({ ...current, heroIntro: value }))
                    }
                    value={home.heroIntro}
                  />
                  <TextField
                    id="home-story-title"
                    label="Titre de l’histoire"
                    onChange={(value) =>
                      setHome((current) => ({ ...current, storyTitle: value }))
                    }
                    value={home.storyTitle}
                  />
                  <AreaField
                    id="home-story-body"
                    label="Histoire de la maison"
                    onChange={(value) =>
                      setHome((current) => ({ ...current, storyBody: value }))
                    }
                    rows={6}
                    value={home.storyBody}
                  />
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Aperçu fidèle à la typographie publique : on voit l'effet du
                texte avant publication. */}
            <Card className="xl:sticky xl:top-20">
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
                <CardDescription>Rendu approximatif du hero.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grain rounded-lg bg-tamarind p-6 text-primary-foreground">
                  <p className="eyebrow mb-3 text-saffron">
                    {home.eyebrow || "Surtitre"}
                  </p>
                  <p className="font-display text-3xl leading-tight">
                    {home.heroTitle || "Titre principal"}
                  </p>
                  <p className="mt-3 text-primary-foreground/75 text-sm">
                    {home.heroIntro || "Introduction du restaurant."}
                  </p>
                </div>
                <div className="mt-5">
                  <p className="font-display text-xl">
                    {home.storyTitle || "Titre de l’histoire"}
                  </p>
                  <p className="mt-2 line-clamp-6 text-muted-foreground text-sm">
                    {home.storyBody || "Histoire de la maison."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="pt-6" value="social">
          <Card>
            <CardHeader>
              <CardTitle>Réseaux sociaux et réservation</CardTitle>
              <CardDescription>
                Les liens renseignés apparaissent dans le pied de page et dans
                les données structurées.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-5 md:grid-cols-2">
                  <TextField
                    id="content-instagram"
                    label="Instagram"
                    onChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        instagramUrl: value,
                      }))
                    }
                    placeholder="https://instagram.com/…"
                    value={settings.instagramUrl}
                  />
                  <TextField
                    id="content-facebook"
                    label="Facebook"
                    onChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        facebookUrl: value,
                      }))
                    }
                    placeholder="https://facebook.com/…"
                    value={settings.facebookUrl}
                  />
                </div>
                <AreaField
                  description="Affiché en haut de la page de réservation."
                  id="content-notice"
                  label="Message de réservation"
                  onChange={(value) =>
                    setSettings((current) => ({
                      ...current,
                      reservationNotice: value,
                    }))
                  }
                  value={settings.reservationNotice}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {settingsDirty || homeDirty ? (
        <div className="save-bar -mx-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:-mx-7 md:px-7">
          <p className="text-muted-foreground text-sm">{dirtyLabel}</p>
          <div className="flex items-center gap-2">
            {settingsDirty ? (
              <Button disabled={pending !== null} onClick={submitSettings}>
                {pending === "settings" ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <SaveIcon data-icon="inline-start" />
                )}
                Enregistrer les informations
              </Button>
            ) : null}
            {homeDirty ? (
              <Button
                disabled={pending !== null}
                onClick={submitHome}
                variant={settingsDirty ? "outline" : "default"}
              >
                {pending === "home" ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <SaveIcon data-icon="inline-start" />
                )}
                Enregistrer l’accueil
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
