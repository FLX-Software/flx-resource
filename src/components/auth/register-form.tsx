"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await register(formData);
        if (result?.ok) {
          router.push("/");
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen.");
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
          <Input id="firstName" name="firstName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nachname</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Benutzername</Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          minLength={3}
          maxLength={32}
          pattern="[a-zA-Z0-9._-]+"
          required
        />
        <p className="text-xs text-flx-muted">
          3–32 Zeichen, Buchstaben, Zahlen, Punkt, Unterstrich oder Bindestrich
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-flx-muted">Mindestens 8 Zeichen</p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Registrieren..." : "Konto erstellen"}
      </Button>

      <p className="text-center text-sm text-flx-muted">
        Bereits registriert?{" "}
        <Link href="/login" className="text-flx-blue-light hover:underline">
          Anmelden
        </Link>
      </p>
    </form>
  );
}
