"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ConstructionSite, Vehicle } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface SitePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sites: ConstructionSite[];
  vehicles?: Vehicle[];
  title: string;
  description?: string;
  onConfirm: (siteId: string, vehicleId?: string | null) => void;
  isPending?: boolean;
}

export function SitePickerDialog({
  open,
  onOpenChange,
  sites,
  vehicles = [],
  title,
  description,
  onConfirm,
  isPending,
}: SitePickerDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-flx-border bg-flx-card p-6 shadow-2xl shadow-black/50">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold text-white">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-flx-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="rounded-lg p-1 text-flx-muted hover:bg-flx-elevated hover:text-white">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const siteId = formData.get("siteId") as string;
              const vehicleId = (formData.get("vehicleId") as string) || null;
              if (siteId) onConfirm(siteId, vehicleId);
            }}
            className="space-y-4"
          >
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
            {vehicles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="vehicleId">Fahrzeug (optional)</Label>
                <Select id="vehicleId" name="vehicleId" defaultValue="">
                  <option value="">Kein Fahrzeug</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.licensePlate})
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Speichern..." : "Zuweisen"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
