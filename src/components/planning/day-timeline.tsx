"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import type {
  Assignment,
  ConstructionSite,
  Employee,
  Vehicle,
} from "@prisma/client";
import { DayTimelineGrid } from "@/components/planning/day-timeline-grid";

type AssignmentWithRelations = Assignment & {
  employee: Employee | null;
  vehicle: Vehicle | null;
  site: ConstructionSite;
};

interface DayTimelineProps {
  day: Date;
  assignments: AssignmentWithRelations[];
  employees: Employee[];
  vehicles: Vehicle[];
  sites: ConstructionSite[];
  readOnly?: boolean;
}

export function DayTimeline({
  day,
  assignments,
  employees,
  vehicles,
  sites,
  readOnly = false,
}: DayTimelineProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-flx-muted">
        {format(day, "EEEE, d. MMMM yyyy", { locale: de })} · Mitarbeiter auf die
        Zeitleiste ziehen, Fahrzeuge auf Einsatz-Blöcke.
      </p>
      <DayTimelineGrid
        day={day}
        assignments={assignments}
        employees={employees}
        vehicles={vehicles}
        sites={sites}
        minWidth={1800}
        maxBodyHeight={600}
        readOnly={readOnly}
      />
    </div>
  );
}
