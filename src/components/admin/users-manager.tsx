import { useSync } from "@teyik0/furin/client";
import {
  ShieldBanIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserPlusIcon,
} from "lucide-react";
import { useReducer } from "react";
import { toast } from "sonner";
import type { BackOfficeUser } from "@/api/modules/users/model";
import { type Column, DataTable } from "@/components/admin/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { api, apiErrorMessage } from "@/lib/api-client";
import { formatDay, formatRelative } from "@/lib/format";

interface PendingAccount {
  createdAt: Date;
  email: string;
  id: string;
  name: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  editor: "Équipe de salle",
};

type EditableRole = "admin" | "editor";

interface UsersManagerState {
  email: string;
  inviteOpen: boolean;
  name: string;
  password: string;
  pendingDelete: BackOfficeUser | null;
  promotedAccountIds: Set<string>;
  role: EditableRole;
  saving: boolean;
  users: BackOfficeUser[];
}

type UsersManagerAction =
  | { type: "inviteOpenChanged"; open: boolean }
  | { type: "nameChanged"; value: string }
  | { type: "emailChanged"; value: string }
  | { type: "passwordChanged"; value: string }
  | { type: "roleChanged"; role: EditableRole }
  | { type: "savingChanged"; saving: boolean }
  | { type: "pendingDeleteChanged"; user: BackOfficeUser | null }
  | { type: "userCreated"; user: BackOfficeUser }
  | { type: "userRoleUpdated"; id: string; role: string }
  | { type: "userBanUpdated"; id: string; banned: boolean }
  | { type: "userDeleted"; id: string }
  | { type: "accountPromoted"; account: PendingAccount };

function usersManagerReducer(
  state: UsersManagerState,
  action: UsersManagerAction
): UsersManagerState {
  switch (action.type) {
    case "inviteOpenChanged":
      return { ...state, inviteOpen: action.open };
    case "nameChanged":
      return { ...state, name: action.value };
    case "emailChanged":
      return { ...state, email: action.value };
    case "passwordChanged":
      return { ...state, password: action.value };
    case "roleChanged":
      return { ...state, role: action.role };
    case "savingChanged":
      return { ...state, saving: action.saving };
    case "pendingDeleteChanged":
      return { ...state, pendingDelete: action.user };
    case "userCreated":
      return {
        ...state,
        email: "",
        inviteOpen: false,
        name: "",
        password: "",
        users: [action.user, ...state.users],
      };
    case "userRoleUpdated":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.id ? { ...user, role: action.role } : user
        ),
      };
    case "userBanUpdated":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.id ? { ...user, banned: action.banned } : user
        ),
      };
    case "userDeleted":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.id),
      };
    case "accountPromoted":
      return {
        ...state,
        promotedAccountIds: new Set(state.promotedAccountIds).add(
          action.account.id
        ),
        users: [
          {
            banned: false,
            banReason: null,
            createdAt: action.account.createdAt,
            email: action.account.email,
            emailVerified: true,
            id: action.account.id,
            lastSessionAt: null,
            name: action.account.name,
            role: "editor",
          },
          ...state.users,
        ],
      };
    default:
      return state;
  }
}

/**
 * L'écran n'affichait que la carte du compte connecté : aucune liste, aucune
 * invitation, aucun changement de rôle. Le plugin `admin` de Better Auth était
 * pourtant déjà installé.
 */
function useUsersManager({
  initialUsers,
  pendingAccounts,
  currentUserId,
}: {
  initialUsers: BackOfficeUser[];
  pendingAccounts: PendingAccount[];
  currentUserId: string;
}) {
  const [state, dispatch] = useReducer(usersManagerReducer, {
    email: "",
    inviteOpen: false,
    name: "",
    password: "",
    pendingDelete: null,
    promotedAccountIds: new Set<string>(),
    role: "editor",
    saving: false,
    users: initialUsers,
  });
  const {
    email,
    inviteOpen,
    name,
    password,
    pendingDelete,
    promotedAccountIds,
    role,
    saving,
    users,
  } = state;
  const pendingList = pendingAccounts.filter(
    (account) => !promotedAccountIds.has(account.id)
  );
  const setEmail = (value: string) => dispatch({ type: "emailChanged", value });
  const setInviteOpen = (open: boolean) =>
    dispatch({ open, type: "inviteOpenChanged" });
  const setName = (value: string) => dispatch({ type: "nameChanged", value });
  const setPassword = (value: string) =>
    dispatch({ type: "passwordChanged", value });
  const setPendingDelete = (user: BackOfficeUser | null) =>
    dispatch({ type: "pendingDeleteChanged", user });
  const setRole = (nextRole: EditableRole) =>
    dispatch({ role: nextRole, type: "roleChanged" });

  const createUser = useSync(
    (
      input: {
        name: string;
        email: string;
        password: string;
        role: "admin" | "editor";
      },
      options
    ) => api.api.admin.users.post(input, options)
  );
  const setRoleRequest = useSync(
    (input: { id: string; role: "admin" | "editor" }, options) =>
      api.api.admin
        .users({ id: input.id })
        .role.patch({ role: input.role }, options)
  );
  const setBanRequest = useSync(
    (input: { id: string; banned: boolean }, options) =>
      api.api.admin
        .users({ id: input.id })
        .ban.patch({ banned: input.banned }, options)
  );
  const deleteRequest = useSync((input: { id: string }, options) =>
    api.api.admin.users({ id: input.id }).delete(undefined, options)
  );

  async function invite() {
    if (password.length < 12) {
      toast.error("Mot de passe trop court", {
        description: "Douze caractères au minimum.",
      });
      return;
    }
    dispatch({ saving: true, type: "savingChanged" });
    const { data, error } = await createUser({ email, name, password, role });
    dispatch({ saving: false, type: "savingChanged" });
    if (error || !data) {
      toast.error("Création impossible", {
        description: apiErrorMessage(error, "Le compte n’a pas été créé."),
      });
      return;
    }
    dispatch({
      type: "userCreated",
      user: {
        banned: false,
        banReason: null,
        createdAt: new Date(),
        email,
        emailVerified: true,
        id: data.id,
        lastSessionAt: null,
        name,
        role,
      },
    });
    toast.success("Compte créé", {
      description: "Communiquez le mot de passe à son ou sa titulaire.",
    });
  }

  async function changeRole(user: BackOfficeUser, next: "admin" | "editor") {
    const previous = user.role;
    dispatch({ id: user.id, role: next, type: "userRoleUpdated" });
    const { error } = await setRoleRequest({ id: user.id, role: next });
    if (error) {
      dispatch({ id: user.id, role: previous, type: "userRoleUpdated" });
      toast.error("Changement de rôle refusé", {
        description: apiErrorMessage(error, "Le rôle n’a pas été modifié."),
      });
      return;
    }
    toast.success(`Rôle mis à jour : ${ROLE_LABELS[next]}`);
  }

  async function toggleBan(user: BackOfficeUser) {
    const next = !user.banned;
    const { error } = await setBanRequest({ banned: next, id: user.id });
    if (error) {
      toast.error("Action refusée", {
        description: apiErrorMessage(error, "Le compte n’a pas été modifié."),
      });
      return;
    }
    dispatch({ banned: next, id: user.id, type: "userBanUpdated" });
    toast.success(
      next
        ? "Compte suspendu · ses sessions ont été révoquées"
        : "Compte réactivé"
    );
  }

  async function confirmDelete() {
    const target = pendingDelete;
    if (!target) {
      return;
    }
    dispatch({ type: "pendingDeleteChanged", user: null });
    const { error } = await deleteRequest({ id: target.id });
    if (error) {
      toast.error("Suppression impossible", {
        description: apiErrorMessage(error, "Le compte n’a pas été supprimé."),
      });
      return;
    }
    dispatch({ id: target.id, type: "userDeleted" });
    toast.success("Compte supprimé");
  }

  async function promotePending(account: PendingAccount) {
    const { error } = await setRoleRequest({ id: account.id, role: "editor" });
    if (error) {
      toast.error("Attribution impossible", {
        description: apiErrorMessage(error, "Le rôle n’a pas été attribué."),
      });
      return;
    }
    dispatch({ account, type: "accountPromoted" });
    toast.success("Accès accordé à l’équipe de salle");
  }

  const columns: Column<BackOfficeUser>[] = [
    {
      cell: (user) => (
        <span className="min-w-0">
          <span className="block truncate font-medium">
            {user.name}
            {user.id === currentUserId ? (
              <span className="ml-2 text-muted-foreground text-xs">(vous)</span>
            ) : null}
          </span>
          <span className="block truncate text-muted-foreground text-xs">
            {user.email}
          </span>
        </span>
      ),
      header: "Compte",
      key: "name",
    },
    {
      cell: (user) => (
        <Select
          disabled={user.id === currentUserId}
          onValueChange={(value) =>
            changeRole(user, value as "admin" | "editor")
          }
          value={user.role === "admin" ? "admin" : "editor"}
        >
          <SelectTrigger
            aria-label={`Rôle de ${user.name}`}
            className="h-8 w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="editor">Équipe de salle</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      ),
      header: "Rôle",
      key: "role",
    },
    {
      cell: (user) => (
        <span className="text-muted-foreground text-sm">
          {user.lastSessionAt ? formatRelative(user.lastSessionAt) : "Jamais"}
        </span>
      ),
      header: "Dernière connexion",
      hideBelowMd: true,
      key: "lastSession",
    },
    {
      cell: (user) => (
        <span className="text-muted-foreground text-sm">
          {formatDay(user.createdAt)}
        </span>
      ),
      header: "Créé le",
      hideBelowMd: true,
      key: "created",
    },
    {
      cell: (user) =>
        user.banned ? (
          <Badge variant="destructive">Suspendu</Badge>
        ) : (
          <Badge variant="secondary">Actif</Badge>
        ),
      header: "État",
      key: "state",
    },
    {
      align: "end",
      cell: (user) =>
        user.id === currentUserId ? null : (
          <div className="flex justify-end gap-1">
            <Button
              aria-label={user.banned ? "Réactiver" : "Suspendre"}
              onClick={() => toggleBan(user)}
              size="icon-sm"
              variant="ghost"
            >
              {user.banned ? <ShieldCheckIcon /> : <ShieldBanIcon />}
            </Button>
            <Button
              aria-label="Supprimer le compte"
              onClick={() => setPendingDelete(user)}
              size="icon-sm"
              variant="ghost"
            >
              <TrashIcon className="text-destructive" />
            </Button>
          </div>
        ),
      header: <span className="sr-only">Actions</span>,
      key: "actions",
    },
  ];

  return {
    columns,
    confirmDelete,
    currentUserId,
    email,
    invite,
    inviteOpen,
    name,
    password,
    pendingDelete,
    pendingList,
    promotePending,
    role,
    saving,
    setEmail,
    setInviteOpen,
    setName,
    setPassword,
    setPendingDelete,
    setRole,
    users,
  };
}

export function UsersManager(props: {
  initialUsers: BackOfficeUser[];
  pendingAccounts: PendingAccount[];
  currentUserId: string;
}) {
  return <UsersManagerView {...useUsersManager(props)} />;
}

function UsersManagerView({
  columns,
  confirmDelete,
  email,
  invite,
  inviteOpen,
  name,
  password,
  pendingDelete,
  pendingList,
  promotePending,
  role,
  saving,
  setEmail,
  setInviteOpen,
  setName,
  setPassword,
  setPendingDelete,
  setRole,
  users,
}: ReturnType<typeof useUsersManager>) {
  return (
    <div className="flex flex-col gap-5">
      {pendingList.length > 0 ? (
        <Alert>
          <AlertTitle>
            {pendingList.length} compte{pendingList.length > 1 ? "s" : ""} sans
            accès
          </AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <p>
              Ces comptes se sont créés via une connexion Google et n’ont aucun
              droit sur le back-office.
            </p>
            <ul className="flex flex-col gap-2">
              {pendingList.map((account) => (
                <li
                  className="flex flex-wrap items-center gap-3 text-sm"
                  key={account.id}
                >
                  <span className="font-medium">{account.email}</span>
                  <Button
                    onClick={() => promotePending(account)}
                    size="sm"
                    variant="outline"
                  >
                    Donner l’accès équipe
                  </Button>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {users.length} compte{users.length > 1 ? "s" : ""} habilité
          {users.length > 1 ? "s" : ""}
        </p>
        <Dialog onOpenChange={setInviteOpen} open={inviteOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <UserPlusIcon data-icon="inline-start" />
                Créer un compte
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un compte back-office</DialogTitle>
              <DialogDescription>
                L’inscription libre est désactivée : les comptes sont créés ici.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="user-name">Nom</FieldLabel>
                <Input
                  id="user-name"
                  onChange={(event) => setName(event.currentTarget.value)}
                  value={name}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="user-email">Email</FieldLabel>
                <Input
                  id="user-email"
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  type="email"
                  value={email}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="user-password">
                  Mot de passe initial
                </FieldLabel>
                <Input
                  id="user-password"
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  type="text"
                  value={password}
                />
                <FieldDescription>
                  Douze caractères minimum. À transmettre à la personne
                  concernée, qui pourra le changer.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="user-role">Rôle</FieldLabel>
                <Select
                  onValueChange={(value) =>
                    setRole(value as "admin" | "editor")
                  }
                  value={role}
                >
                  <SelectTrigger id="user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="editor">
                        Équipe de salle — carte, réservations, contenu
                      </SelectItem>
                      <SelectItem value="admin">
                        Administrateur — accès complet
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                onClick={() => setInviteOpen(false)}
                type="button"
                variant="ghost"
              >
                Annuler
              </Button>
              <Button disabled={saving} onClick={invite} type="button">
                {saving ? <Spinner data-icon="inline-start" /> : null}
                Créer le compte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        emptyTitle="Aucun compte"
        getRowId={(user) => user.id}
        rows={users}
      />

      <AlertDialog
        onOpenChange={(open) => (open ? undefined : setPendingDelete(null))}
        open={pendingDelete !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer le compte de {pendingDelete?.name} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ses sessions seront révoquées et son accès définitivement retiré.
              Pour un retrait temporaire, préférez la suspension.
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
