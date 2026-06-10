"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { User, Employee, UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/shared/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createUserAccount,
  updateUserAccount,
  deleteUserAccount,
} from "@/lib/admin-actions";

type UserWithEmployee = User & {
  employee: Pick<Employee, "id" | "firstName" | "lastName" | "role"> | null;
};

type EmployeeOption = Pick<Employee, "id" | "firstName" | "lastName" | "role"> & {
  user: { id: string } | null;
};

interface UserAdminPanelProps {
  users: UserWithEmployee[];
  employees: EmployeeOption[];
  currentUserId: string;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrator",
  EMPLOYEE: "Mitarbeiter",
};

function UserForm({
  user,
  employees,
  onSuccess,
  onCancel,
}: {
  user?: UserWithEmployee;
  employees: EmployeeOption[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableEmployees = employees.filter(
    (e) => !e.user || e.user.id === user?.id
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (user) {
          await updateUserAccount(user.id, formData);
        } else {
          await createUserAccount(formData);
        }
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Vorname</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={user?.firstName}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nachname</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={user?.lastName}
            required
          />
        </div>
      </div>

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="username">Benutzername</Label>
          <Input id="username" name="username" required minLength={3} maxLength={32} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">
          {user ? "Neues Passwort (leer = unverändert)" : "Passwort"}
        </Label>
        <Input
          id="password"
          name="password"
          type="text"
          minLength={user ? undefined : 8}
          required={!user}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rolle</Label>
        <select
          id="role"
          name="role"
          defaultValue={user?.role ?? "EMPLOYEE"}
          className="flex h-10 w-full rounded-lg border border-flx-border bg-flx-elevated px-3 text-sm text-white"
        >
          <option value="ADMIN">Administrator</option>
          <option value="EMPLOYEE">Mitarbeiter</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employeeId">Mitarbeiterprofil (optional)</Label>
        <select
          id="employeeId"
          name="employeeId"
          defaultValue={user?.employeeId ?? ""}
          className="flex h-10 w-full rounded-lg border border-flx-border bg-flx-elevated px-3 text-sm text-white"
        >
          <option value="">Keine Verknüpfung</option>
          {availableEmployees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName} ({e.role})
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Speichern..." : "Speichern"}
        </Button>
      </div>
    </form>
  );
}

export function UserAdminPanel({ users, employees, currentUserId }: UserAdminPanelProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<UserWithEmployee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  function handleDelete(userId: string) {
    if (!confirm("Dieses Benutzerkonto wirklich löschen?")) return;
    setDeletingId(userId);
    startDelete(async () => {
      try {
        await deleteUserAccount(userId);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Benutzer anlegen
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-flx-border text-flx-muted">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Benutzername</th>
                  <th className="px-4 py-3 font-medium">Passwort</th>
                  <th className="px-4 py-3 font-medium">Rolle</th>
                  <th className="px-4 py-3 font-medium">Mitarbeiterprofil</th>
                  <th className="px-4 py-3 text-right font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-flx-border-subtle">
                    <td className="px-4 py-3 text-white">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">@{user.username}</td>
                    <td className="px-4 py-3 font-mono text-amber-300/90">
                      {user.passwordDisplay}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          user.role === "ADMIN"
                            ? "rounded bg-flx-blue/15 px-2 py-0.5 text-xs text-flx-blue-light"
                            : "rounded bg-flx-elevated px-2 py-0.5 text-xs text-flx-muted"
                        }
                      >
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {user.employee
                        ? `${user.employee.firstName} ${user.employee.lastName}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          disabled={user.id === currentUserId || deletingId === user.id}
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <p className="p-8 text-center text-flx-muted">Noch keine Benutzer angelegt.</p>
          )}
        </CardContent>
      </Card>

      <Modal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Neuer Benutzer"
        description="Legen Sie ein neues Benutzerkonto an. Administrator-Konten werden hier eingerichtet."
      >
        <UserForm
          employees={employees}
          onSuccess={() => setShowCreate(false)}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      {editing && (
        <Modal
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          title="Benutzer bearbeiten"
          description={`@${editing.username}`}
        >
          <UserForm
            user={editing}
            employees={employees}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  );
}
