"use client";

import { useState, useTransition } from "react";
import type { Assignment, ConstructionSite, Employee, Vehicle } from "@prisma/client";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { VehicleImage } from "@/components/vehicles/vehicle-image";
import { DeleteButton } from "@/components/shared/delete-button";
import { DRAG_VEHICLE_TYPE } from "@/components/planning/planning-constants";
import { assignVehicleToAssignment, deleteAssignment } from "@/lib/actions";
import { formatTimeRange } from "@/lib/planning-time";
import { cn } from "@/lib/utils";

type AssignmentCard = Assignment & {
  employee: Employee | null;
  vehicle: Vehicle | null;
  site: ConstructionSite;
};

interface AssignmentPlanningCardProps {
  assignment: AssignmentCard;
}

export function AssignmentPlanningCard({ assignment }: AssignmentPlanningCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleVehicleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const vehicleId = e.dataTransfer.getData(DRAG_VEHICLE_TYPE);
    if (!vehicleId) return;

    setError(null);
    startTransition(async () => {
      try {
        await assignVehicleToAssignment(assignment.id, vehicleId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Fahrzeug konnte nicht zugewiesen werden."
        );
      }
    });
  }

  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DRAG_VEHICLE_TYPE)) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleVehicleDrop}
      className={cn(
        "rounded-md border border-flx-border bg-flx-elevated p-2 text-xs shadow-sm transition-colors",
        dragOver && "ring-2 ring-flx-blue",
        isPending && "opacity-60"
      )}
    >
      <p className="font-medium text-flx-blue-light">{assignment.site.name}</p>

      {assignment.employee && (
        <div className="mt-2 flex items-center gap-2">
          <EmployeeAvatar
            firstName={assignment.employee.firstName}
            lastName={assignment.employee.lastName}
            photoUrl={assignment.employee.photoUrl}
            size="sm"
          />
          <span className="text-slate-200">
            {assignment.employee.firstName} {assignment.employee.lastName}
          </span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 rounded-md border border-dashed border-flx-border bg-flx-card p-1.5">
        {assignment.vehicle ? (
          <>
            <VehicleImage
              name={assignment.vehicle.name}
              photoUrl={assignment.vehicle.photoUrl}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-200">
                {assignment.vehicle.name}
              </p>
              <p className="truncate text-[10px] text-flx-muted">
                {assignment.vehicle.licensePlate}
              </p>
            </div>
          </>
        ) : (
          <p className="text-[10px] text-flx-muted-foreground">
            Fahrzeug hierher ziehen
          </p>
        )}
      </div>

      <p className="mt-2 text-flx-muted-foreground">
        {formatTimeRange(assignment.startMinutes, assignment.endMinutes)}
      </p>

      {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}

      <div className="mt-2 flex justify-end">
        <DeleteButton
          action={deleteAssignment.bind(null, assignment.id)}
          label="Zuweisung löschen"
        />
      </div>
    </div>
  );
}
