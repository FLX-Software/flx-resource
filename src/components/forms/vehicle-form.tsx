"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Vehicle, VehicleStatus } from "@prisma/client";
import { vehicleStatusLabels } from "@/lib/labels";

interface VehicleFormProps {
  action: (formData: FormData) => Promise<void>;
  vehicle?: Vehicle;
  onCancel?: () => void;
}

export function VehicleForm({ action, vehicle, onCancel }: VehicleFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Bezeichnung</Label>
        <Input id="name" name="name" defaultValue={vehicle?.name} placeholder="z.B. Kranwagen" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="licensePlate">Kennzeichen</Label>
          <Input id="licensePlate" name="licensePlate" defaultValue={vehicle?.licensePlate} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Typ</Label>
          <Input id="type" name="type" defaultValue={vehicle?.type} placeholder="z.B. Lieferwagen" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacity">Kapazität</Label>
        <Input id="capacity" name="capacity" defaultValue={vehicle?.capacity ?? ""} placeholder="z.B. 3.5t" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={vehicle?.status ?? "AVAILABLE"}>
          {(Object.keys(vehicleStatusLabels) as VehicleStatus[]).map((status) => (
            <option key={status} value={status}>
              {vehicleStatusLabels[status]}
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
        <Button type="submit">{vehicle ? "Speichern" : "Hinzufügen"}</Button>
      </div>
    </form>
  );
}
