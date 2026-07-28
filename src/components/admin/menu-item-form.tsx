import { useSync } from "@teyik0/furin/client";
import { PlusIcon, SaveIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DIETARY_FLAGS,
  type MenuItemView,
  type MenuStatus,
  type SpiceLevel,
} from "@/api/modules/menu/model";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { api, apiErrorCode, apiErrorMessage } from "@/lib/api-client";
import {
  formatPriceCents,
  MENU_STATUS_LABELS,
  SPICE_LABELS,
} from "@/lib/format";

interface VariantDraft {
  detail: string;
  id?: string;
  key: string;
  label: string;
  /** Saisi en euros, converti en centimes à l'envoi. */
  price: string;
}

interface MediaOption {
  alt: string;
  id: string;
  thumbUrl: string;
}

/** Charge utile attendue par `PATCH /api/admin/menu/items/:id`. */
interface MenuItemPayload {
  description: string;
  dietaryFlags: string[];
  featured: boolean;
  mediaId?: string;
  name: string;
  spiceLevel: SpiceLevel | null;
  status: MenuStatus;
  variants: Array<{
    id?: string;
    label: string | null;
    detail: string | null;
    priceCents: number;
  }>;
  version: number;
}

function toDraft(item: MenuItemView): VariantDraft[] {
  return item.variants.map((variant, index) => ({
    detail: variant.detail ?? "",
    id: variant.id,
    key: variant.id ?? `variant-${index}`,
    label: variant.label ?? "",
    price: (variant.priceCents / 100).toFixed(2),
  }));
}

function priceToCents(value: string) {
  const normalised = value.replace(",", ".").trim();
  const parsed = Number(normalised);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.round(parsed * 100);
}

function spiceLevelOrNone(spiceLevel: SpiceLevel | null) {
  return spiceLevel === null ? "NONE" : spiceLevel;
}

/**
 * Écran d'édition d'un plat. Il n'existait aucun moyen de changer un prix : le
 * back-office ne savait que basculer la disponibilité. Les variantes sont
 * remplacées en bloc côté serveur, dans une transaction.
 */
export function MenuItemForm({
  item,
  categoryName,
  sectionName,
  mediaOptions,
}: {
  item: MenuItemView;
  categoryName: string;
  sectionName: string;
  mediaOptions: MediaOption[];
}) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [status, setStatus] = useState<MenuStatus>(item.status);
  const [featured, setFeatured] = useState(item.featured);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel | "NONE">(
    spiceLevelOrNone(item.spiceLevel)
  );
  const [flags, setFlags] = useState<string[]>(item.dietaryFlags);
  const [mediaId, setMediaId] = useState(item.media ? item.media.id : "");
  const [variants, setVariants] = useState<VariantDraft[]>(toDraft(item));
  const [version, setVersion] = useState(item.version);
  const [pending, setPending] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);

  const save = useSync((input: MenuItemPayload, options) =>
    api.api.admin.menu.items({ id: item.id }).patch(input, options)
  );

  const dirty =
    name !== item.name ||
    description !== item.description ||
    status !== item.status ||
    featured !== item.featured ||
    spiceLevelOrNone(item.spiceLevel) !== spiceLevel ||
    flags.join("|") !== item.dietaryFlags.join("|") ||
    mediaId !== (item.media ? item.media.id : "") ||
    JSON.stringify(variants.map(({ key: _key, ...rest }) => rest)) !==
      JSON.stringify(toDraft(item).map(({ key: _key, ...rest }) => rest));

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((current) =>
      current.map((variant) =>
        variant.key === key ? { ...variant, ...patch } : variant
      )
    );
  }

  async function submit() {
    const parsed = variants.map((variant) => ({
      detail: variant.detail.trim() || null,
      id: variant.id,
      label: variant.label.trim() || null,
      priceCents: priceToCents(variant.price),
    }));
    const invalid = parsed.find((variant) => variant.priceCents === null);
    if (invalid || parsed.length === 0) {
      toast.error("Prix invalide", {
        description: "Chaque ligne de prix doit contenir un montant en euros.",
      });
      return;
    }

    setPending(true);
    setConflict(null);
    const { data, error } = await save({
      description: description.trim(),
      dietaryFlags: flags,
      featured,
      mediaId: mediaId || undefined,
      name: name.trim(),
      spiceLevel: spiceLevel === "NONE" ? null : spiceLevel,
      status,
      variants: parsed as Array<{
        id?: string;
        label: string | null;
        detail: string | null;
        priceCents: number;
      }>,
      version,
    });
    setPending(false);

    if (error) {
      const message = apiErrorMessage(
        error,
        "Le plat n’a pas pu être enregistré."
      );
      // Le conflit de version reste affiché : un toast disparaîtrait avant que
      // l'utilisateur comprenne qu'il doit recharger.
      if (apiErrorCode(error) === "VERSION_CONFLICT") {
        setConflict(message);
      } else {
        toast.error("Enregistrement impossible", { description: message });
      }
      return;
    }
    if (data && "version" in data) {
      setVersion(data.version);
    }
    toast.success("Plat enregistré", {
      description: "La carte publique est mise à jour.",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {conflict ? (
        <Alert variant="destructive">
          <AlertTitle>Modification concurrente</AlertTitle>
          <AlertDescription>
            {conflict} Rechargez la page pour repartir de la dernière version.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Description du plat</CardTitle>
            <CardDescription>
              {categoryName} · {sectionName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="item-name">Nom</FieldLabel>
                <Input
                  id="item-name"
                  onChange={(event) => setName(event.currentTarget.value)}
                  value={name}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="item-description">Description</FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    id="item-description"
                    onChange={(event) =>
                      setDescription(event.currentTarget.value)
                    }
                    rows={4}
                    value={description}
                  />
                </InputGroup>
                <FieldDescription>
                  Visible sur la carte publique, sous le nom du plat.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service</CardTitle>
            <CardDescription>
              Statut, mise en avant et niveau d’épice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="item-status">Statut</FieldLabel>
                <Select
                  onValueChange={(value) => setStatus(value as MenuStatus)}
                  value={status}
                >
                  <SelectTrigger id="item-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      ["AVAILABLE", "UNAVAILABLE", "HIDDEN"] as MenuStatus[]
                    ).map((value) => (
                      <SelectItem key={value} value={value}>
                        {MENU_STATUS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  « Masqué » retire le plat de la carte publique sans le
                  supprimer.
                </FieldDescription>
              </Field>

              <Field orientation="horizontal">
                <Switch
                  checked={featured}
                  id="item-featured"
                  onCheckedChange={(checked) => setFeatured(Boolean(checked))}
                />
                <div>
                  <FieldLabel htmlFor="item-featured">
                    Signature de la maison
                  </FieldLabel>
                  <FieldDescription>
                    Les plats signature apparaissent sur la page d’accueil.
                  </FieldDescription>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="item-spice">Niveau d’épice</FieldLabel>
                <Select
                  onValueChange={(value) =>
                    setSpiceLevel(value as SpiceLevel | "NONE")
                  }
                  value={spiceLevel}
                >
                  <SelectTrigger id="item-spice">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Non précisé</SelectItem>
                    {(["MILD", "MEDIUM", "HOT"] as SpiceLevel[]).map(
                      (value) => (
                        <SelectItem key={value} value={value}>
                          {SPICE_LABELS[value]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>

              {/* `fieldset` plutôt qu'un `Field` : le groupe de cases porte son
                  intitulé via `legend`, et chaque case a son propre label. */}
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 font-medium text-sm">
                  Régimes et allergènes
                </legend>
                {DIETARY_FLAGS.map((flag) => {
                  const id = `flag-${flag.toLocaleLowerCase("fr-FR").replace(/[^a-z0-9]+/g, "-")}`;
                  return (
                    <div className="flex items-center gap-2" key={flag}>
                      <Checkbox
                        checked={flags.includes(flag)}
                        id={id}
                        onCheckedChange={(checked) =>
                          setFlags((current) =>
                            checked
                              ? [...current, flag]
                              : current.filter((value) => value !== flag)
                          )
                        }
                      />
                      <FieldLabel className="font-normal" htmlFor={id}>
                        {flag}
                      </FieldLabel>
                    </div>
                  );
                })}
              </fieldset>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prix</CardTitle>
          <CardDescription>
            Une ligne par déclinaison. Le libellé sert aux formats (« demi », «
            bouteille ») et reste vide pour un prix unique.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {variants.map((variant, index) => (
            <div
              className="grid gap-3 sm:grid-cols-[1fr_1fr_9rem_auto] sm:items-end"
              key={variant.key}
            >
              <Field>
                <FieldLabel htmlFor={`variant-label-${variant.key}`}>
                  Libellé
                </FieldLabel>
                <Input
                  id={`variant-label-${variant.key}`}
                  onChange={(event) =>
                    updateVariant(variant.key, {
                      label: event.currentTarget.value,
                    })
                  }
                  placeholder={index === 0 ? "Prix unique" : "Grande portion"}
                  value={variant.label}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`variant-detail-${variant.key}`}>
                  Précision
                </FieldLabel>
                <Input
                  id={`variant-detail-${variant.key}`}
                  onChange={(event) =>
                    updateVariant(variant.key, {
                      detail: event.currentTarget.value,
                    })
                  }
                  placeholder="Servi avec riz"
                  value={variant.detail}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`variant-price-${variant.key}`}>
                  Prix (€)
                </FieldLabel>
                <Input
                  id={`variant-price-${variant.key}`}
                  inputMode="decimal"
                  onChange={(event) =>
                    updateVariant(variant.key, {
                      price: event.currentTarget.value,
                    })
                  }
                  value={variant.price}
                />
              </Field>
              <Button
                aria-label="Retirer cette ligne de prix"
                disabled={variants.length === 1}
                onClick={() =>
                  setVariants((current) =>
                    current.filter((entry) => entry.key !== variant.key)
                  )
                }
                size="icon"
                variant="ghost"
              >
                <TrashIcon className="text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            className="self-start"
            onClick={() =>
              setVariants((current) => [
                ...current,
                {
                  detail: "",
                  key: `new-${current.length}-${current.at(-1)?.key ?? "0"}`,
                  label: "",
                  price: "0.00",
                },
              ])
            }
            size="sm"
            variant="outline"
          >
            <PlusIcon data-icon="inline-start" />
            Ajouter une déclinaison
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visuel</CardTitle>
          <CardDescription>
            La page d’accueil affichait des photos codées en dur, sans lien avec
            le plat. Le visuel choisi ici est celui qui sera publié.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <button
              aria-pressed={mediaId === ""}
              className={`flex aspect-square items-center justify-center rounded-lg border border-dashed text-muted-foreground text-xs ${
                mediaId === "" ? "border-primary ring-2 ring-ring/40" : ""
              }`}
              onClick={() => setMediaId("")}
              type="button"
            >
              Aucun
            </button>
            {mediaOptions.map((media) => (
              <button
                aria-label={media.alt}
                aria-pressed={mediaId === media.id}
                className={`overflow-hidden rounded-lg border ${
                  mediaId === media.id
                    ? "border-primary ring-2 ring-ring/40"
                    : ""
                }`}
                key={media.id}
                onClick={() => setMediaId(media.id)}
                type="button"
              >
                <img
                  alt=""
                  className="aspect-square w-full object-cover"
                  height={320}
                  src={media.thumbUrl}
                  width={320}
                />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {dirty ? (
        <div className="save-bar -mx-4 flex items-center justify-between gap-4 px-4 py-3 md:-mx-7 md:px-7">
          <p className="text-muted-foreground text-sm">
            Modifications non enregistrées ·{" "}
            {variants
              .map((variant) => priceToCents(variant.price))
              .filter((cents): cents is number => cents !== null)
              .map(formatPriceCents)
              .join(" / ")}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={pending}
              onClick={() => {
                setName(item.name);
                setDescription(item.description);
                setStatus(item.status);
                setFeatured(item.featured);
                setSpiceLevel(spiceLevelOrNone(item.spiceLevel));
                setFlags(item.dietaryFlags);
                setMediaId(item.media ? item.media.id : "");
                setVariants(toDraft(item));
              }}
              variant="ghost"
            >
              Annuler
            </Button>
            <Button disabled={pending} onClick={submit}>
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon data-icon="inline-start" />
              )}
              {pending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          <Badge className="mr-2" variant="secondary">
            À jour
          </Badge>
          Version {version}
        </p>
      )}
    </div>
  );
}

export type { MediaOption };
