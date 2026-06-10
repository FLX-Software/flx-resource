"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await login(formData);
        if (result?.ok) {
          router.push("/");
          router.refresh();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Anmeldung fehlgeschlagen."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="username">Benutzername</Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
        />
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
