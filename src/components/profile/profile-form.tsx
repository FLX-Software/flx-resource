"use client";

import { useState, useTransition } from "react";
import { updateOwnProfile } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormProps {
  username: string;
  firstName: string;
  lastName: string;
}

export function ProfileForm({ username, firstName, lastName }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateOwnProfile(formData);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}
      {success && (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Profil gespeichert.
        </p>
      )}

      <div className="space-y-2">
        <Label>Benutzername</Label>
        <Input value={`@${username}`} disabled className="font-mono" />
        <p className="text-xs text-flx-muted">Der Benutzername kann nicht geändert werden.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Vorname</Label>
          <Input id="firstName" name="firstName" defaultValue={firstName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nachname</Label>
          <Input id="lastName" name="lastName" defaultValue={lastName} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Neues Passwort (optional)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
        />
        <p className="text-xs text-flx-muted">Mindestens 8 Zeichen, leer lassen um beizubehalten</p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Speichern..." : "Profil speichern"}
      </Button>
    </form>
  );
}
