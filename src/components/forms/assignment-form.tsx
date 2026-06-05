"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ConstructionSite, Employee, Vehicle } from "@prisma/client";

interface AssignmentFormProps {
  action: (formData: FormData) => Promise<void>;
  employees: Employee[];
  vehicles: Vehicle[];
  sites: ConstructionSite[];
  defaultDate?: Date;
}

export function AssignmentForm({
  action,
  employees,
  vehicles,
  sites,
  defaultDate = new Date(),
}: AssignmentFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Datum</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={format(defaultDate, "yyyy-MM-dd")}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="siteId">Baustelle</Label>
        <Select id="siteId" name="siteId" required defaultValue="">
          <option value="" disabled>
            Baustelle wählen...
          </option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="employeeId">Mitarbeiter</Label>
        <Select id="employeeId" name="employeeId" defaultValue="">
          <option value="">Kein Mitarbeiter</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName} ({emp.role})
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="vehicleId">Fahrzeug</Label>
        <Select id="vehicleId" name="vehicleId" defaultValue="">
          <option value="">Kein Fahrzeug</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.name} ({vehicle.licensePlate})
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notizen</Label>
        <Textarea id="notes" name="notes" placeholder="z.B. Montage OG, Kranarbeiten..." />
      </div>
      <Button type="submit" className="w-full">
        Zuweisen
      </Button>
    </form>
  );
}
