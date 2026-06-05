"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ConstructionSite, SiteStatus } from "@prisma/client";
import { siteStatusLabels } from "@/lib/labels";

interface SiteFormProps {
  action: (formData: FormData) => Promise<void>;
  site?: ConstructionSite;
  onCancel?: () => void;
}

function toDateInput(date?: Date | null) {
  return date ? format(new Date(date), "yyyy-MM-dd") : "";
}

export function SiteForm({ action, site, onCancel }: SiteFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Baustellenname</Label>
        <Input id="name" name="name" defaultValue={site?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" name="address" defaultValue={site?.address} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client">Auftraggeber</Label>
        <Input id="client" name="client" defaultValue={site?.client ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Startdatum</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={toDateInput(site?.startDate)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Enddatum</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={toDateInput(site?.endDate)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={site?.status ?? "PLANNED"}>
          {(Object.keys(siteStatusLabels) as SiteStatus[]).map((status) => (
            <option key={status} value={status}>
              {siteStatusLabels[status]}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea id="description" name="description" defaultValue={site?.description ?? ""} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
        )}
        <Button type="submit">{site ? "Speichern" : "Hinzufügen"}</Button>
      </div>
    </form>
  );
}
