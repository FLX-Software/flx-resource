"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Employee, Vehicle } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { VehicleImage } from "@/components/vehicles/vehicle-image";
import {
  DRAG_EMPLOYEE_TYPE,
  DRAG_VEHICLE_TYPE,
} from "@/components/planning/planning-constants";

interface ResourcePaletteProps {
  employees: Employee[];
  vehicles: Vehicle[];
}

export function ResourcePalette({
  employees,
  vehicles,
}: ResourcePaletteProps) {
  const [employeeQuery, setEmployeeQuery] = useState("");
  const [vehicleQuery, setVehicleQuery] = useState("");

  const filteredEmployees = useMemo(() => {
    const q = employeeQuery.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q)
    );
  }, [employees, employeeQuery]);

  const filteredVehicles = useMemo(() => {
    const q = vehicleQuery.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.licensePlate.toLowerCase().includes(q)
    );
  }, [vehicles, vehicleQuery]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-200">
            Mitarbeiter ({employees.length})
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-flx-muted-foreground" />
          <Input
            value={employeeQuery}
            onChange={(e) => setEmployeeQuery(e.target.value)}
            placeholder="Suchen..."
            className="pl-8"
          />
        </div>
        <div className="max-h-[40vh] space-y-1 overflow-y-auto pr-1">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(DRAG_EMPLOYEE_TYPE, employee.id);
                e.dataTransfer.effectAllowed = "copy";
              }}
              className="flex cursor-grab items-center gap-2 rounded-md border border-flx-border bg-flx-elevated px-2 py-1.5 text-xs active:cursor-grabbing hover:border-flx-blue/50"
            >
              <EmployeeAvatar
                firstName={employee.firstName}
                lastName={employee.lastName}
                photoUrl={employee.photoUrl}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-200">
                  {employee.firstName} {employee.lastName}
                </p>
                <p className="truncate text-[10px] text-flx-muted">{employee.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-200">
          Fahrzeuge ({vehicles.length})
        </p>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-flx-muted-foreground" />
          <Input
            value={vehicleQuery}
            onChange={(e) => setVehicleQuery(e.target.value)}
            placeholder="Suchen..."
            className="pl-8"
          />
        </div>
        <div className="max-h-[28vh] space-y-1 overflow-y-auto pr-1">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(DRAG_VEHICLE_TYPE, vehicle.id);
                e.dataTransfer.effectAllowed = "copy";
              }}
              className="flex cursor-grab items-center gap-2 rounded-md border border-flx-blue/30 bg-flx-elevated px-2 py-1.5 text-xs active:cursor-grabbing hover:border-flx-blue"
            >
              <VehicleImage
                name={vehicle.name}
                photoUrl={vehicle.photoUrl}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-200">{vehicle.name}</p>
                <p className="truncate text-[10px] text-flx-muted">
                  {vehicle.licensePlate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
