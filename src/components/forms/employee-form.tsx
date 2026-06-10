"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import type { Employee, EmployeeStatus } from "@prisma/client";
import { employeeStatusLabels } from "@/lib/labels";

interface EmployeeFormProps {
  action: (formData: FormData) => Promise<void>;
  employee?: Employee;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function EmployeeForm({ action, employee, onCancel, onSuccess }: EmployeeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(employee?.photoUrl ?? null);
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
          err instanceof Error ? err.message : "Mitarbeiter konnte nicht gespeichert werden."
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
        <EmployeeAvatar
          firstName={employee?.firstName ?? "?"}
          lastName={employee?.lastName ?? "?"}
          photoUrl={previewUrl}
          size="lg"
        />
        <div className="space-y-2">
          <Label htmlFor="employee-photo">Profilfoto</Label>
          <input
            ref={fileInputRef}
            id="employee-photo"
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
              {previewUrl ? "Foto ändern" : "Foto hochladen"}
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
          <p className="text-xs text-flx-muted">JPG, PNG oder WebP, max. 5 MB</p>
        </div>
      </div>
      <input type="hidden" name="removePhoto" value={removePhoto ? "true" : "false"} />

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
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Abbrechen
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Speichern..." : employee ? "Speichern" : "Hinzufügen"}
        </Button>
      </div>
    </form>
  );
}
