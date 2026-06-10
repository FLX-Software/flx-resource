"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { login } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await login(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Anmelden..." : "Anmelden"}
      </Button>

      <p className="text-center text-sm text-flx-muted">
        Noch kein Konto?{" "}
        <Link href="/register" className="text-flx-blue-light hover:underline">
          Registrieren
        </Link>
      </p>
    </form>
  );
}
