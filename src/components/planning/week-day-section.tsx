"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Maximize2 } from "lucide-react";
import type {
  Assignment,
  ConstructionSite,
  Employee,
  Vehicle,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { DayTimelineGrid } from "@/components/planning/day-timeline-grid";
import { cn } from "@/lib/utils";

type AssignmentWithRelations = Assignment & {
  employee: Employee | null;
  vehicle: Vehicle | null;
  site: ConstructionSite;
};

interface WeekDaySectionProps {
  day: Date;
  assignments: AssignmentWithRelations[];
  employees: Employee[];
  vehicles: Vehicle[];
  sites: ConstructionSite[];
  isToday?: boolean;
  onExpand: () => void;
  readOnly?: boolean;
}

export function WeekDaySection({
  day,
  assignments,
  employees,
  vehicles,
  sites,
  isToday,
  onExpand,
  readOnly = false,
}: WeekDaySectionProps) {
  const dayStr = format(day, "yyyy-MM-dd");
  const dayAssignments = assignments.filter(
    (a) => format(new Date(a.date), "yyyy-MM-dd") === dayStr
  );
  const employeeLaneCount = new Set(
    dayAssignments.filter((a) => a.employeeId).map((a) => a.employeeId)
  ).size;

  return (
    <section
      className={cn(
        "border-b border-flx-border last:border-b-0",
        isToday && "bg-flx-blue/5"
      )}
    >
      <div className="sticky left-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-flx-border-subtle bg-flx-card/95 px-4 py-3 backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {format(day, "EEEE", { locale: de })}
            <span className="ml-2 font-normal text-flx-muted">
              {format(day, "d. MMMM yyyy", { locale: de })}
            </span>
          </h3>
          <p className="text-xs text-flx-muted">
            {dayAssignments.length}{" "}
            {dayAssignments.length === 1 ? "Einsatz" : "Einsätze"} · horizontal
            scrollen für 24h-Ansicht
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onExpand}>
          <Maximize2 className="h-4 w-4" />
          Vollbild
        </Button>
      </div>

      <DayTimelineGrid
        day={day}
        assignments={assignments}
        employees={employees}
        vehicles={vehicles}
        sites={sites}
        compact
        minWidth={1600}
        maxBodyHeight={Math.min(480, Math.max(120, employeeLaneCount * 48 + 72))}
        readOnly={readOnly}
      />
    </section>
  );
}
