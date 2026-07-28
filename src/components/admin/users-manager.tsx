import { useSync } from "@teyik0/furin/client";
import {
  ShieldBanIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserPlusIcon,
} from "lucide-react";
import { useState } from "react";
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

/**
 * L'écran n'affichait que la carte du compte connecté : aucune liste, aucune
 * invitation, aucun changement de rôle. Le plugin `admin` de Better Auth était
 * pourtant déjà installé.
 */
export function UsersManager({
  initialUsers,
  pendingAccounts,
  currentUserId,
}: {
  initialUsers: BackOfficeUser[];
  pendingAccounts: PendingAccount[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [pendingList, setPendingList] = useState(pendingAccounts);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<BackOfficeUser | null>(
    null
  );

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
    setSaving(true);
    const { data, error } = await createUser({ email, name, password, role });
    setSaving(false);
    if (error || !data) {
      toast.error("Création impossible", {
        description: apiErrorMessage(error, "Le compte n’a pas été créé."),
      });
      return;
    }
    setUsers((current) => [
      {
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
      ...current,
    ]);
    setInviteOpen(false);
    setName("");
    setEmail("");
    setPassword("");
    toast.success("Compte créé", {
      description: "Communiquez le mot de passe à son ou sa titulaire.",
    });
  }

  async function changeRole(user: BackOfficeUser, next: "admin" | "editor") {
    const previous = user.role;
    setUsers((current) =>
      current.map((entry) =>
        entry.id === user.id ? { ...entry, role: next } : entry
      )
    );
    const { error } = await setRoleRequest({ id: user.id, role: next });
    if (error) {
      setUsers((current) =>
        current.map((entry) =>
          entry.id === user.id ? { ...entry, role: previous } : entry
        )
      );
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
    setUsers((current) =>
      current.map((entry) =>
        entry.id === user.id ? { ...entry, banned: next } : entry
      )
    );
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
    setPendingDelete(null);
    const { error } = await deleteRequest({ id: target.id });
    if (error) {
      toast.error("Suppression impossible", {
        description: apiErrorMessage(error, "Le compte n’a pas été supprimé."),
      });
      return;
    }
    setUsers((current) => current.filter((entry) => entry.id !== target.id));
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
    setPendingList((current) =>
      current.filter((entry) => entry.id !== account.id)
    );
    setUsers((current) => [
      {
        banned: false,
        banReason: null,
        createdAt: account.createdAt,
        email: account.email,
        emailVerified: true,
        id: account.id,
        lastSessionAt: null,
        name: account.name,
        role: "editor",
      },
      ...current,
    ]);
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
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="editor">Équipe de salle</SelectItem>
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
                    <SelectItem value="editor">
                      Équipe de salle — carte, réservations, contenu
                    </SelectItem>
                    <SelectItem value="admin">
                      Administrateur — accès complet
                    </SelectItem>
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
