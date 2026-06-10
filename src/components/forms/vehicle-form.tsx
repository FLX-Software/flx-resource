"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { VehicleImage } from "@/components/vehicles/vehicle-image";
import type { Vehicle, VehicleStatus } from "@prisma/client";
import { vehicleStatusLabels } from "@/lib/labels";

interface VehicleFormProps {
  action: (formData: FormData) => Promise<void>;
  vehicle?: Vehicle;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function VehicleForm({ action, vehicle, onCancel, onSuccess }: VehicleFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(vehicle?.photoUrl ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setRemovePhoto(false);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemovePhoto() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemovePhoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (selectedFile) {
      formData.set("photo", selectedFile);
    } else {
      formData.delete("photo");
    }

    startTransition(async () => {
      try {
        await action(formData);
        onSuccess?.();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Fahrzeug konnte nicht gespeichert werden."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <VehicleImage
          name={vehicle?.name ?? "Fahrzeug"}
          photoUrl={previewUrl}
          size="lg"
        />
        <div className="space-y-2">
          <Label htmlFor="vehicle-photo">Fahrzeugbild</Label>
          <input
            ref={fileInputRef}
            id="vehicle-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
              {previewUrl ? "Bild ändern" : "Bild hochladen"}
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
              >
                <X className="h-4 w-4" />
                Entfernen
              </Button>
            )}
          </div>
          <p className="text-xs text-stone-500">JPG, PNG oder WebP, max. 5 MB</p>
        </div>
      </div>
      <input type="hidden" name="removePhoto" value={removePhoto ? "true" : "false"} />

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
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Abbrechen
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Speichern..." : vehicle ? "Speichern" : "Hinzufügen"}
        </Button>
      </div>
    </form>
  );
}
