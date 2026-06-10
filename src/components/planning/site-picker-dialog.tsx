"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ConstructionSite } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface SitePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sites: ConstructionSite[];
  title: string;
  description?: string;
  onConfirm: (siteId: string) => void;
  isPending?: boolean;
}

export function SitePickerDialog({
  open,
  onOpenChange,
  sites,
  title,
  description,
  onConfirm,
  isPending,
}: SitePickerDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-stone-200 bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold text-stone-900">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-stone-500">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const siteId = new FormData(e.currentTarget).get("siteId") as string;
              if (siteId) onConfirm(siteId);
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
