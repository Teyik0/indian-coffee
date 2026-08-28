import { useSync } from "@teyik0/furin/client";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useReducer } from "react";
import { toast } from "sonner";
import type { GalleryAdminEntry } from "@/api/modules/gallery/model";
import { TablePagination } from "@/components/admin/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface GalleryManagerState {
  draftAlt: string;
  draftCaption: string;
  draftVisible: boolean;
  editing: GalleryAdminEntry | null;
  entries: GalleryAdminEntry[];
  loading: boolean;
  page: number;
  pageCount: number;
  pendingDelete: GalleryAdminEntry | null;
  saving: boolean;
  total: number;
}

type GalleryManagerAction =
  | { type: "loadingChanged"; loading: boolean }
  | {
      type: "pageLoaded";
      entries: GalleryAdminEntry[];
      page: number;
      pageCount: number;
      total: number;
    }
  | { type: "editorOpened"; entry: GalleryAdminEntry }
  | { type: "editorClosed" }
  | { type: "draftAltChanged"; value: string }
  | { type: "draftCaptionChanged"; value: string }
  | { type: "draftVisibleChanged"; visible: boolean }
  | { type: "savingChanged"; saving: boolean }
  | {
      type: "entrySaved";
      alt: string;
      caption: string;
      id: string;
      visible: boolean;
    }
  | { type: "entriesReplaced"; entries: GalleryAdminEntry[] }
  | { type: "visibilityChanged"; id: string; visible: boolean }
  | { type: "entryRestored"; entry: GalleryAdminEntry }
  | { type: "pendingDeleteChanged"; entry: GalleryAdminEntry | null }
  | { type: "entryDeleted"; id: string };

function galleryManagerReducer(
  state: GalleryManagerState,
  action: GalleryManagerAction
): GalleryManagerState {
  switch (action.type) {
    case "loadingChanged":
      return { ...state, loading: action.loading };
    case "pageLoaded":
      return {
        ...state,
        entries: action.entries,
        page: action.page,
        pageCount: action.pageCount,
        total: action.total,
      };
    case "editorOpened":
      return {
        ...state,
        draftAlt: action.entry.alt,
        draftCaption: action.entry.caption,
        draftVisible: action.entry.isVisible,
        editing: action.entry,
      };
    case "editorClosed":
      return { ...state, editing: null };
    case "draftAltChanged":
      return { ...state, draftAlt: action.value };
    case "draftCaptionChanged":
      return { ...state, draftCaption: action.value };
    case "draftVisibleChanged":
      return { ...state, draftVisible: action.visible };
    case "savingChanged":
      return { ...state, saving: action.saving };
    case "entrySaved":
      return {
        ...state,
        editing: null,
        entries: state.entries.map((entry) =>
          entry.id === action.id
            ? {
                ...entry,
                alt: action.alt,
                caption: action.caption,
                isVisible: action.visible,
              }
            : entry
        ),
      };
    case "entriesReplaced":
      return { ...state, entries: action.entries };
    case "visibilityChanged":
      return {
        ...state,
        entries: state.entries.map((entry) =>
          entry.id === action.id
            ? { ...entry, isVisible: action.visible }
            : entry
        ),
      };
    case "entryRestored":
      return {
        ...state,
        entries: state.entries.map((entry) =>
          entry.id === action.entry.id ? action.entry : entry
        ),
      };
    case "pendingDeleteChanged":
      return { ...state, pendingDelete: action.entry };
    case "entryDeleted":
      return {
        ...state,
        entries: state.entries.filter((entry) => entry.id !== action.id),
        total: Math.max(0, state.total - 1),
      };
    default:
      return state;
  }
}

/**
 * La galerie n'offrait qu'un formulaire d'upload : aucune liste, donc aucun
 * moyen de corriger une légende, de masquer une photo, de la réordonner ni de
 * la supprimer. La route d'API forçait par ailleurs la page 1, rendant 28 des
 * 40 images inatteignables.
 */
function useGalleryManager({
  initialEntries,
  initialPage,
  initialPageCount,
  initialTotal,
  collections,
}: {
  initialEntries: GalleryAdminEntry[];
  initialPage: number;
  initialPageCount: number;
  initialTotal: number;
  collections: Collection[];
}) {
  const [state, dispatch] = useReducer(galleryManagerReducer, {
    draftAlt: "",
    draftCaption: "",
    draftVisible: true,
    editing: null,
    entries: initialEntries,
    loading: false,
    page: initialPage,
    pageCount: initialPageCount,
    pendingDelete: null,
    saving: false,
    total: initialTotal,
  });
  const {
    draftAlt,
    draftCaption,
    draftVisible,
    editing,
    entries,
    loading,
    page,
    pageCount,
    pendingDelete,
    saving,
    total,
  } = state;
  const setDraftAlt = (value: string) =>
    dispatch({ type: "draftAltChanged", value });
  const setDraftCaption = (value: string) =>
    dispatch({ type: "draftCaptionChanged", value });
  const setDraftVisible = (visible: boolean) =>
    dispatch({ type: "draftVisibleChanged", visible });
  const setEditing = (entry: GalleryAdminEntry | null) =>
    dispatch(
      entry ? { entry, type: "editorOpened" } : { type: "editorClosed" }
    );
  const setPendingDelete = (entry: GalleryAdminEntry | null) =>
    dispatch({ entry, type: "pendingDeleteChanged" });

  const updateEntry = useSync(
    (
      input: {
        id: string;
        alt: string;
        caption: string;
        isVisible: boolean;
      },
      options
    ) =>
      api.api.admin.gallery({ id: input.id }).patch(
        {
          alt: input.alt,
          caption: input.caption,
          isVisible: input.isVisible,
        },
        options
      )
  );

  const removeEntry = useSync((input: { id: string }, options) =>
    api.api.admin.gallery({ id: input.id }).delete(undefined, options)
  );

  const reorder = useSync((input: { ids: string[] }, options) =>
    api.api.admin.gallery.reorder.patch({ ids: input.ids }, options)
  );

  async function loadPage(next: number) {
    dispatch({ loading: true, type: "loadingChanged" });
    const { data, error } = await api.api.admin.gallery.get({
      query: { page: next, pageSize: 24 },
    });
    dispatch({ loading: false, type: "loadingChanged" });
    if (error || !data) {
      toast.error("Chargement impossible", {
        description: apiErrorMessage(error, "Réessayez dans un instant."),
      });
      return;
    }
    dispatch({
      entries: data.entries as GalleryAdminEntry[],
      page: data.page,
      pageCount: data.pageCount,
      total: data.total,
      type: "pageLoaded",
    });
  }

  function openEditor(entry: GalleryAdminEntry) {
    dispatch({ entry, type: "editorOpened" });
  }

  async function saveEditor() {
    if (!editing) {
      return;
    }
    if (draftAlt.trim().length < 3) {
      toast.error("Description requise", {
        description:
          "Le texte alternatif est lu par les lecteurs d’écran et par Google.",
      });
      return;
    }
    dispatch({ saving: true, type: "savingChanged" });
    const { error } = await updateEntry({
      alt: draftAlt.trim(),
      caption: draftCaption.trim(),
      id: editing.id,
      isVisible: draftVisible,
    });
    dispatch({ saving: false, type: "savingChanged" });
    if (error) {
      toast.error("Enregistrement impossible", {
        description: apiErrorMessage(error, "L’image n’a pas été modifiée."),
      });
      return;
    }
    dispatch({
      alt: draftAlt.trim(),
      caption: draftCaption.trim(),
      id: editing.id,
      type: "entrySaved",
      visible: draftVisible,
    });
    toast.success("Image mise à jour");
  }

  async function toggleVisible(entry: GalleryAdminEntry) {
    const next = !entry.isVisible;
    dispatch({ id: entry.id, type: "visibilityChanged", visible: next });
    const { error } = await updateEntry({
      alt: entry.alt,
      caption: entry.caption,
      id: entry.id,
      isVisible: next,
    });
    if (error) {
      dispatch({ entry, type: "entryRestored" });
      toast.error("Modification impossible");
      return;
    }
    toast.success(next ? "Image publiée" : "Image masquée");
  }

  async function move(entry: GalleryAdminEntry, direction: -1 | 1) {
    const index = entries.findIndex((item) => item.id === entry.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= entries.length) {
      return;
    }
    const next = [...entries];
    const [moved] = next.splice(index, 1);
    if (!moved) {
      return;
    }
    next.splice(target, 0, moved);
    dispatch({ entries: next, type: "entriesReplaced" });

    const { error } = await reorder({ ids: next.map((item) => item.id) });
    if (error) {
      dispatch({ entries, type: "entriesReplaced" });
      toast.error("Réordonnancement impossible");
    }
  }

  async function confirmDelete() {
    const target = pendingDelete;
    if (!target) {
      return;
    }
    dispatch({ entry: null, type: "pendingDeleteChanged" });
    const { error } = await removeEntry({ id: target.id });
    if (error) {
      toast.error("Suppression impossible", {
        description: apiErrorMessage(error, "L’image n’a pas été supprimée."),
      });
      return;
    }
    dispatch({ id: target.id, type: "entryDeleted" });
    toast.success("Image supprimée", {
      description: "Les fichiers seront retirés du stockage sous peu.",
    });
  }

  return {
    collections,
    confirmDelete,
    draftAlt,
    draftCaption,
    draftVisible,
    editing,
    entries,
    loadPage,
    loading,
    move,
    openEditor,
    page,
    pageCount,
    pendingDelete,
    saveEditor,
    saving,
    setDraftAlt,
    setDraftCaption,
    setDraftVisible,
    setEditing,
    setPendingDelete,
    toggleVisible,
    total,
  };
}

export function GalleryManager(props: {
  initialEntries: GalleryAdminEntry[];
  initialPage: number;
  initialPageCount: number;
  initialTotal: number;
  collections: Collection[];
}) {
  return <GalleryManagerView {...useGalleryManager(props)} />;
}

function GalleryManagerView({
  collections,
  confirmDelete,
  draftAlt,
  draftCaption,
  draftVisible,
  editing,
  entries,
  loadPage,
  loading,
  move,
  openEditor,
  page,
  pageCount,
  pendingDelete,
  saveEditor,
  saving,
  setDraftAlt,
  setDraftCaption,
  setDraftVisible,
  setEditing,
  setPendingDelete,
  toggleVisible,
  total,
}: ReturnType<typeof useGalleryManager>) {
  if (entries.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <EyeIcon />
          </EmptyMedia>
          <EmptyTitle>Aucune image</EmptyTitle>
          <EmptyDescription>
            Envoyez une première photo pour alimenter la galerie publique.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {entries.map((entry, index) => (
          <figure
            className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-card"
            key={entry.id}
          >
            <div className="relative aspect-4/3 overflow-hidden bg-muted">
              <img
                alt={entry.alt}
                className={`size-full object-cover transition ${
                  entry.isVisible ? "" : "opacity-40 grayscale"
                }`}
                height={entry.height}
                loading="lazy"
                sizes="(max-width: 640px) 50vw, 25vw"
                src={entry.src}
                srcSet={entry.srcSet}
                style={
                  entry.placeholder
                    ? {
                        backgroundImage: `url("${entry.placeholder}")`,
                        backgroundSize: "cover",
                      }
                    : undefined
                }
                width={entry.width}
              />
              {entry.isVisible ? null : (
                <Badge className="absolute top-2 left-2" variant="outline">
                  Masquée
                </Badge>
              )}
            </div>
            <figcaption className="flex flex-1 flex-col gap-2 p-3">
              <p className="line-clamp-2 text-sm">{entry.alt}</p>
              {entry.caption ? (
                <p className="line-clamp-1 text-muted-foreground text-xs">
                  {entry.caption}
                </p>
              ) : null}
              <div className="mt-auto flex items-center gap-0.5">
                <Button
                  aria-label="Déplacer avant"
                  disabled={index === 0}
                  onClick={() => move(entry, -1)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <ChevronUpIcon />
                </Button>
                <Button
                  aria-label="Déplacer après"
                  disabled={index === entries.length - 1}
                  onClick={() => move(entry, 1)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <ChevronDownIcon />
                </Button>
                <Button
                  aria-label={entry.isVisible ? "Masquer" : "Publier"}
                  onClick={() => toggleVisible(entry)}
                  size="icon-sm"
                  variant="ghost"
                >
                  {entry.isVisible ? <EyeIcon /> : <EyeOffIcon />}
                </Button>
                <Button
                  aria-label="Modifier la description"
                  onClick={() => openEditor(entry)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <PencilIcon />
                </Button>
                <Button
                  aria-label="Supprimer"
                  className="ml-auto"
                  onClick={() => setPendingDelete(entry)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <TrashIcon className="text-destructive" />
                </Button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Chargement…</p>
      ) : (
        <TablePagination
          label="images"
          onPageChange={loadPage}
          page={page}
          pageCount={pageCount}
          total={total}
        />
      )}

      {collections.length > 1 ? (
        <p className="text-muted-foreground text-xs">
          Collections : {collections.map((entry) => entry.name).join(", ")}.
        </p>
      ) : null}

      <Dialog
        onOpenChange={(open) => (open ? undefined : setEditing(null))}
        open={editing !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l’image</DialogTitle>
            <DialogDescription>
              La description accessible est lue par les lecteurs d’écran et
              indexée par les moteurs de recherche.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="gallery-alt">
                Description accessible
              </FieldLabel>
              <Input
                id="gallery-alt"
                onChange={(event) => setDraftAlt(event.currentTarget.value)}
                value={draftAlt}
              />
              <FieldDescription>
                Décrivez ce que montre la photo.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="gallery-caption">Légende</FieldLabel>
              <Input
                id="gallery-caption"
                onChange={(event) => setDraftCaption(event.currentTarget.value)}
                value={draftCaption}
              />
            </Field>
            <Field orientation="horizontal">
              <Switch
                checked={draftVisible}
                id="gallery-visible"
                onCheckedChange={(checked) => setDraftVisible(Boolean(checked))}
              />
              <FieldLabel htmlFor="gallery-visible">
                Publiée sur le site
              </FieldLabel>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              onClick={() => setEditing(null)}
              type="button"
              variant="ghost"
            >
              Annuler
            </Button>
            <Button disabled={saving} onClick={saveEditor} type="button">
              {saving ? <Spinner data-icon="inline-start" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => (open ? undefined : setPendingDelete(null))}
        open={pendingDelete !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette image ?</AlertDialogTitle>
            <AlertDialogDescription>
              L’image sera retirée de la galerie et ses fichiers effacés du
              stockage. Pour la retirer temporairement, utilisez « Masquer ».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
