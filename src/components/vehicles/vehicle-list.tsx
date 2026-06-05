"use client";

import { useState } from "react";
import { Pencil, Plus, Truck } from "lucide-react";
import type { Vehicle, Assignment, ConstructionSite } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/shared/modal";
import { StatusBadge } from "@/components/shared/status-badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { VehicleForm } from "@/components/forms/vehicle-form";
import {
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/lib/actions";
import { formatDate } from "@/lib/utils";

type VehicleWithAssignments = Vehicle & {
  assignments: (Assignment & { site: ConstructionSite })[];
};

interface VehicleListProps {
  vehicles: VehicleWithAssignments[];
}

export function VehicleList({ vehicles }: VehicleListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Fahrzeug hinzufügen
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">{vehicle.name}</p>
                    <p className="text-sm text-stone-500">{vehicle.licensePlate}</p>
                  </div>
                </div>
                <StatusBadge type="vehicle" status={vehicle.status} />
              </div>

              <div className="mb-4 space-y-1 text-sm text-stone-600">
                <p>Typ: {vehicle.type}</p>
                {vehicle.capacity && <p>Kapazität: {vehicle.capacity}</p>}
              </div>

              {vehicle.assignments.length > 0 && (
                <div className="mb-4 rounded-lg bg-stone-50 p-3">
                  <p className="mb-2 text-xs font-medium text-stone-500">
                    Kommende Einsätze
                  </p>
                  {vehicle.assignments.map((a) => (
                    <p key={a.id} className="text-xs text-stone-600">
                      {formatDate(a.date)} – {a.site.name}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(vehicle)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteButton
                  action={deleteVehicle.bind(null, vehicle.id)}
                  label="Fahrzeug löschen"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 p-12 text-center">
          <p className="text-stone-500">Noch keine Fahrzeuge erfasst.</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            Erstes Fahrzeug hinzufügen
          </Button>
        </div>
      )}

      <Modal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Neues Fahrzeug"
        description="Erfassen Sie ein neues Fahrzeug."
      >
        <VehicleForm
          action={async (formData) => {
            await createVehicle(formData);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      {editing && (
        <Modal
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          title="Fahrzeug bearbeiten"
        >
          <VehicleForm
            vehicle={editing}
            action={async (formData) => {
              await updateVehicle(editing.id, formData);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  );
}
