"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { register } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface RegisterEmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface RegisterFormProps {
  employees: RegisterEmployeeOption[];
  requiresAdminSecret: boolean;
}

export function RegisterForm({ employees, requiresAdminSecret }: RegisterFormProps) {
  const [accountType, setAccountType] = useState<"EMPLOYEE" | "ADMIN">("EMPLOYEE");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("accountType", accountType);

    startTransition(async () => {
      try {
        await register(formData);
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
        <Label htmlFor="email">E-Mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
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

      <div className="space-y-2">
        <Label htmlFor="accountType">Kontotyp</Label>
        <Select
          id="accountType"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as "EMPLOYEE" | "ADMIN")}
        >
          <option value="EMPLOYEE">Mitarbeiter (nur Einsicht)</option>
          <option value="ADMIN">Planer / Produktionsleiter (Admin)</option>
        </Select>
      </div>

      {accountType === "EMPLOYEE" && (
        <div className="space-y-2">
          <Label htmlFor="employeeId">Mitarbeiterprofil</Label>
          <Select id="employeeId" name="employeeId" required defaultValue="">
            <option value="" disabled>
              Profil auswählen...
            </option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName} ({employee.role})
              </option>
            ))}
          </Select>
          {employees.length === 0 && (
            <p className="text-xs text-amber-400">
              Keine freien Mitarbeiterprofile verfügbar. Bitte den Planer kontaktieren.
            </p>
          )}
        </div>
      )}

      {accountType === "ADMIN" && requiresAdminSecret && (
        <div className="space-y-2">
          <Label htmlFor="adminSecret">Planer-Registrierungscode</Label>
          <Input id="adminSecret" name="adminSecret" required />
        </div>
      )}

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
