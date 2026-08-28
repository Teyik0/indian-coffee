import { useSync } from "@teyik0/furin/client";
import { PlusIcon, SaveIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ResolvedDay } from "@/api/modules/content/opening-hours.service";
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
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { api, apiErrorMessage } from "@/lib/api-client";
import { formatIsoDay, toIsoDay } from "@/lib/format";

/** `key` distingue deux services aux mêmes horaires lors du réordonnancement. */
interface RangeDraft {
  closesAt: string;
  key: string;
  opensAt: string;
}
interface DayDraft {
  dayName: string;
  dayOfWeek: number;
  isClosed: boolean;
  ranges: RangeDraft[];
}

interface SpecialHour {
  closesAt: string | null;
  day: string;
  id: string;
  isClosed: boolean;
  label: string | null;
  opensAt: string | null;
}

function minutesToInput(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toDraft(week: ResolvedDay[]): DayDraft[] {
  return week.map((day) => ({
    dayName: day.dayName,
    dayOfWeek: day.isoDay,
    isClosed: day.isClosed,
    ranges:
      day.ranges.length > 0
        ? day.ranges.map((range, index) => ({
            closesAt: minutesToInput(range.closesAt),
            key: `${day.isoDay}-${index}`,
            opensAt: minutesToInput(range.opensAt),
          }))
        : [{ closesAt: "22:30", key: `${day.isoDay}-0`, opensAt: "11:00" }],
  }));
}

/**
 * L'écran des horaires était en lecture seule et le schéma ne pouvait même pas
 * exprimer un jour de fermeture. Les valeurs saisies ici gouvernent désormais la
 * validation des réservations, le badge « ouvert maintenant » et le JSON-LD.
 */
function useHoursManager({
  initialWeek,
  initialExceptions,
}: {
  initialWeek: ResolvedDay[];
  initialExceptions: SpecialHour[];
}) {
  const [days, setDays] = useState<DayDraft[]>(() => toDraft(initialWeek));
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify(toDraft(initialWeek))
  );
  const [exceptions, setExceptions] = useState(initialExceptions);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newDay, setNewDay] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newClosed, setNewClosed] = useState(true);
  const [newOpens, setNewOpens] = useState("11:00");
  const [newCloses, setNewCloses] = useState("22:30");
  const [savingException, setSavingException] = useState(false);

  const dirty = JSON.stringify(days) !== baseline;

  const saveWeek = useSync((input: { days: DayDraft[] }, options) =>
    api.api.admin.content.hours.put(
      {
        days: input.days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          isClosed: day.isClosed,
          // `key` est un identifiant de rendu : il ne part pas au serveur.
          ranges: day.isClosed
            ? []
            : day.ranges.map(({ opensAt, closesAt }) => ({
                closesAt,
                opensAt,
              })),
        })),
      },
      options
    )
  );

  const saveException = useSync((input: Omit<SpecialHour, "id">, options) =>
    api.api.admin.content["special-hours"].put(
      {
        closesAt: input.closesAt ?? "",
        day: input.day,
        isClosed: input.isClosed,
        label: input.label ?? "",
        opensAt: input.opensAt ?? "",
      },
      options
    )
  );

  const removeException = useSync((input: { id: string }, options) =>
    api.api.admin.content["special-hours"]({ id: input.id }).delete(
      undefined,
      options
    )
  );

  function updateDay(dayOfWeek: number, patch: Partial<DayDraft>) {
    setDays((current) =>
      current.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day
      )
    );
  }

  function updateRange(
    dayOfWeek: number,
    index: number,
    patch: Partial<RangeDraft>
  ) {
    setDays((current) =>
      current.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              ranges: day.ranges.map((range, rangeIndex) =>
                rangeIndex === index ? { ...range, ...patch } : range
              ),
            }
          : day
      )
    );
  }

  async function submitWeek() {
    const invalid = days.find(
      (day) =>
        !day.isClosed &&
        day.ranges.some((range) => range.opensAt >= range.closesAt)
    );
    if (invalid) {
      setError(
        `${invalid.dayName} : l’heure de fermeture doit suivre l’heure d’ouverture.`
      );
      return;
    }

    setPending(true);
    setError(null);
    const { error: requestError } = await saveWeek({ days });
    setPending(false);
    if (requestError) {
      setError(
        apiErrorMessage(requestError, "Les horaires n’ont pas été enregistrés.")
      );
      return;
    }
    setBaseline(JSON.stringify(days));
    toast.success("Horaires enregistrés", {
      description: "Les réservations suivent désormais cette grille.",
    });
  }

  async function submitException() {
    if (!newDay) {
      toast.error("Choisissez une date");
      return;
    }
    setSavingException(true);
    const { data, error: requestError } = await saveException({
      closesAt: newClosed ? null : newCloses,
      day: newDay,
      isClosed: newClosed,
      label: newLabel || null,
      opensAt: newClosed ? null : newOpens,
    });
    setSavingException(false);
    if (requestError || !data) {
      toast.error("Enregistrement impossible", {
        description: apiErrorMessage(
          requestError,
          "La fermeture n’a pas été enregistrée."
        ),
      });
      return;
    }
    setExceptions((current) => [
      ...current.filter((entry) => toIsoDay(entry.day) !== newDay),
      data as SpecialHour,
    ]);
    setNewDay("");
    setNewLabel("");
    toast.success("Date exceptionnelle enregistrée");
  }

  async function deleteException(id: string) {
    const { error: requestError } = await removeException({ id });
    if (requestError) {
      toast.error("Suppression impossible");
      return;
    }
    setExceptions((current) => current.filter((entry) => entry.id !== id));
    toast.success("Date exceptionnelle supprimée");
  }

  const today = new Date().toISOString().slice(0, 10);

  return {
    baseline,
    days,
    deleteException,
    dirty,
    error,
    exceptions,
    newClosed,
    newCloses,
    newDay,
    newLabel,
    newOpens,
    pending,
    savingException,
    setDays,
    setNewClosed,
    setNewCloses,
    setNewDay,
    setNewLabel,
    setNewOpens,
    submitException,
    submitWeek,
    today,
    updateDay,
    updateRange,
  };
}

export function HoursManager(props: {
  initialWeek: ResolvedDay[];
  initialExceptions: SpecialHour[];
}) {
  return <HoursManagerView {...useHoursManager(props)} />;
}

function HoursManagerView({
  baseline,
  days,
  deleteException,
  dirty,
  error,
  exceptions,
  newClosed,
  newCloses,
  newDay,
  newLabel,
  newOpens,
  pending,
  savingException,
  setDays,
  setNewClosed,
  setNewCloses,
  setNewDay,
  setNewLabel,
  setNewOpens,
  submitException,
  submitWeek,
  today,
  updateDay,
  updateRange,
}: ReturnType<typeof useHoursManager>) {
  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Horaires non enregistrés</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Grille hebdomadaire</CardTitle>
          <CardDescription>
            Fuseau Europe/Paris. Un jour fermé n’accepte plus aucune
            réservation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {days.map((day) => (
            <div
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start"
              key={day.dayOfWeek}
            >
              <div className="flex w-40 shrink-0 items-center gap-3">
                <Switch
                  aria-label={`${day.dayName} ouvert`}
                  checked={!day.isClosed}
                  id={`day-open-${day.dayOfWeek}`}
                  onCheckedChange={(checked) =>
                    updateDay(day.dayOfWeek, { isClosed: !checked })
                  }
                />
                <label
                  className="font-medium"
                  htmlFor={`day-open-${day.dayOfWeek}`}
                >
                  {day.dayName}
                </label>
              </div>

              {day.isClosed ? (
                <p className="text-muted-foreground text-sm sm:pt-1.5">Fermé</p>
              ) : (
                <div className="flex flex-1 flex-col gap-2">
                  {day.ranges.map((range, index) => (
                    <div
                      className="flex flex-wrap items-center gap-2"
                      key={range.key}
                    >
                      <Input
                        aria-label={`${day.dayName} — ouverture ${index + 1}`}
                        className="w-32"
                        onChange={(event) =>
                          updateRange(day.dayOfWeek, index, {
                            opensAt: event.currentTarget.value,
                          })
                        }
                        step="900"
                        type="time"
                        value={range.opensAt}
                      />
                      <span className="text-muted-foreground">—</span>
                      <Input
                        aria-label={`${day.dayName} — fermeture ${index + 1}`}
                        className="w-32"
                        onChange={(event) =>
                          updateRange(day.dayOfWeek, index, {
                            closesAt: event.currentTarget.value,
                          })
                        }
                        step="900"
                        type="time"
                        value={range.closesAt}
                      />
                      {day.ranges.length > 1 ? (
                        <Button
                          aria-label="Retirer ce service"
                          onClick={() =>
                            updateDay(day.dayOfWeek, {
                              ranges: day.ranges.filter(
                                (_, rangeIndex) => rangeIndex !== index
                              ),
                            })
                          }
                          size="icon-sm"
                          variant="ghost"
                        >
                          <TrashIcon className="text-destructive" />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  {day.ranges.length < 3 ? (
                    <Button
                      className="self-start"
                      onClick={() =>
                        updateDay(day.dayOfWeek, {
                          ranges: [
                            ...day.ranges,
                            {
                              closesAt: "22:30",
                              key: `${day.dayOfWeek}-${day.ranges.length}-new`,
                              opensAt: "19:00",
                            },
                          ],
                        })
                      }
                      size="sm"
                      variant="ghost"
                    >
                      <PlusIcon data-icon="inline-start" />
                      Ajouter un service
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fermetures exceptionnelles</CardTitle>
          <CardDescription>
            Jours fériés, congés, horaires particuliers. Ces dates prennent le
            pas sur la grille hebdomadaire.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {exceptions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucune date exceptionnelle enregistrée.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {exceptions.map((exception) => (
                <li
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0"
                  key={exception.id}
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-sm">
                      {formatIsoDay(exception.day)}
                    </span>
                    <span className="block text-muted-foreground text-xs">
                      {exception.isClosed
                        ? (exception.label ?? "Fermé toute la journée")
                        : `${exception.opensAt?.slice(0, 5)} — ${exception.closesAt?.slice(0, 5)}${
                            exception.label ? ` · ${exception.label}` : ""
                          }`}
                    </span>
                  </span>
                  <Button
                    aria-label={`Supprimer la date du ${exception.day}`}
                    onClick={() => deleteException(exception.id)}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <TrashIcon className="text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="exception-day">Date</FieldLabel>
                <Input
                  id="exception-day"
                  min={today}
                  onChange={(event) => setNewDay(event.currentTarget.value)}
                  type="date"
                  value={newDay}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="exception-label">Motif</FieldLabel>
                <Input
                  id="exception-label"
                  onChange={(event) => setNewLabel(event.currentTarget.value)}
                  placeholder="Congés annuels"
                  value={newLabel}
                />
                <FieldDescription>
                  Affiché aux clients qui tentent de réserver ce jour-là.
                </FieldDescription>
              </Field>
            </div>

            <Field orientation="horizontal">
              <Switch
                checked={newClosed}
                id="exception-closed"
                onCheckedChange={(checked) => setNewClosed(Boolean(checked))}
              />
              <FieldLabel htmlFor="exception-closed">
                Fermé toute la journée
              </FieldLabel>
            </Field>

            {newClosed ? null : (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  aria-label="Ouverture exceptionnelle"
                  className="w-32"
                  onChange={(event) => setNewOpens(event.currentTarget.value)}
                  step="900"
                  type="time"
                  value={newOpens}
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  aria-label="Fermeture exceptionnelle"
                  className="w-32"
                  onChange={(event) => setNewCloses(event.currentTarget.value)}
                  step="900"
                  type="time"
                  value={newCloses}
                />
              </div>
            )}

            <Button
              className="self-start"
              disabled={savingException}
              onClick={submitException}
              variant="outline"
            >
              {savingException ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PlusIcon data-icon="inline-start" />
              )}
              Enregistrer cette date
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>

      {dirty ? (
        <div className="save-bar -mx-4 flex items-center justify-between gap-4 px-4 py-3 md:-mx-7 md:px-7">
          <p className="text-muted-foreground text-sm">
            Grille hebdomadaire modifiée
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={pending}
              onClick={() => setDays(JSON.parse(baseline) as DayDraft[])}
              variant="ghost"
            >
              Annuler
            </Button>
            <Button disabled={pending} onClick={submitWeek}>
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon data-icon="inline-start" />
              )}
              {pending ? "Enregistrement…" : "Enregistrer les horaires"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
