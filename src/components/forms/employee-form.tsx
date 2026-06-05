"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Employee, EmployeeStatus } from "@prisma/client";
import { employeeStatusLabels } from "@/lib/labels";

interface EmployeeFormProps {
  action: (formData: FormData) => Promise<void>;
  employee?: Employee;
  onCancel?: () => void;
}

export function EmployeeForm({ action, employee, onCancel }: EmployeeFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Vorname</Label>
          <Input id="firstName" name="firstName" defaultValue={employee?.firstName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nachname</Label>
          <Input id="lastName" name="lastName" defaultValue={employee?.lastName} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Funktion</Label>
        <Input id="role" name="role" defaultValue={employee?.role} placeholder="z.B. Zimmermann" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={employee?.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input id="email" name="email" type="email" defaultValue={employee?.email ?? ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="skills">Fähigkeiten</Label>
        <Input id="skills" name="skills" defaultValue={employee?.skills ?? ""} placeholder="z.B. Holzbau, Kran" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={employee?.status ?? "AVAILABLE"}>
          {(Object.keys(employeeStatusLabels) as EmployeeStatus[]).map((status) => (
            <option key={status} value={status}>
              {employeeStatusLabels[status]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
        )}
        <Button type="submit">{employee ? "Speichern" : "Hinzufügen"}</Button>
      </div>
    </form>
  );
}
