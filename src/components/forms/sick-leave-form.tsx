"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Employee } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

interface SickLeaveFormProps {
  employee: Employee;
  action: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function SickLeaveForm({
  employee,
  action,
  onCancel,
  onSuccess,
}: SickLeaveFormProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const defaultUntil = employee.sickUntil
    ? format(new Date(employee.sickUntil), "yyyy-MM-dd")
    : today;
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await action(formData);
        onSuccess?.();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Krankmeldung konnte nicht gespeichert werden."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <p className="text-sm text-flx-muted">
        Krankmeldung für{" "}
        <span className="font-medium text-white">
          {employee.firstName} {employee.lastName}
        </span>
      </p>

      <div className="space-y-2">
        <Label htmlFor="sickUntil">Krank bis einschließlich</Label>
        <DatePicker
          id="sickUntil"
          name="sickUntil"
          defaultValue={defaultUntil}
          min={today}
          required
          placeholder="Enddatum der Krankmeldung wählen"
        />
        <p className="text-xs text-flx-muted">
          Ab dem Folgetag wird der Status automatisch auf „Verfügbar“ gesetzt.
        </p>
      </div>

      {employee.status === "SICK" && employee.sickUntil && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          Aktuell krank gemeldet bis{" "}
          {format(new Date(employee.sickUntil), "d. MMMM yyyy", { locale: de })}.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Abbrechen
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Speichern..." : "Krankmeldung speichern"}
        </Button>
      </div>
    </form>
  );
}
