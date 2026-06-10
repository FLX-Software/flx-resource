"use client";

import { useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import type {
  Assignment,
  ConstructionSite,
  Employee,
  Vehicle,
} from "@prisma/client";
import {
  DROP_DURATION_MINUTES,
  minutesFromTimelineX,
  normalizeRange,
} from "@/lib/planning-time";
import { createDragAssignment } from "@/lib/actions";
import { TimelineAssignmentBar } from "@/components/planning/timeline-assignment-bar";
import { SitePickerDialog } from "@/components/planning/site-picker-dialog";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { DRAG_EMPLOYEE_TYPE } from "@/components/planning/planning-constants";
import { cn } from "@/lib/utils";

type AssignmentWithRelations = Assignment & {
  employee: Employee | null;
  vehicle: Vehicle | null;
  site: ConstructionSite;
};

interface PendingDrop {
  employeeId: string;
  startMinutes: number;
  endMinutes: number;
}

interface DayTimelineGridProps {
  day: Date;
  assignments: AssignmentWithRelations[];
  employees: Employee[];
  vehicles: Vehicle[];
  sites: ConstructionSite[];
  compact?: boolean;
  minWidth?: number;
  maxBodyHeight?: number;
  readOnly?: boolean;
}

function EmployeeTimelineRow({
  label,
  subtitle,
  avatar,
  items,
  hourGrid,
  onDropEmployee,
  compact,
  readOnly,
}: {
  label: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  items: AssignmentWithRelations[];
  hourGrid: React.ReactNode;
  onDropEmployee: (e: React.DragEvent<HTMLDivElement>) => void;
  compact?: boolean;
  readOnly?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const getTimelineRect = () => rowRef.current?.getBoundingClientRect() ?? null;

  return (
    <div
      className={cn(
        "grid gap-2",
        compact ? "mb-1 grid-cols-[132px_1fr]" : "mb-2 grid-cols-[56px_1fr]"
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {avatar}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-200">{label}</p>
          {subtitle && (
            <p className="truncate text-[10px] text-flx-muted">{subtitle}</p>
          )}
        </div>
      </div>
      <div
        ref={rowRef}
        onDragOver={
          readOnly
            ? undefined
            : (e) => {
                if (e.dataTransfer.types.includes(DRAG_EMPLOYEE_TYPE)) {
                  e.preventDefault();
                  setDragOver(true);
                }
              }
        }
        onDragLeave={readOnly ? undefined : () => setDragOver(false)}
        onDrop={
          readOnly
            ? undefined
            : (e) => {
                setDragOver(false);
                onDropEmployee(e);
              }
        }
        className={cn(
          "relative overflow-hidden rounded-lg bg-flx-elevated",
          compact ? "h-10" : "h-12",
          dragOver && "ring-2 ring-inset ring-flx-blue"
        )}
      >
        {hourGrid}
        {items.map((assignment) => (
          <TimelineAssignmentBar
            key={assignment.id}
            assignment={assignment}
            getTimelineRect={getTimelineRect}
            compact={compact}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

export function DayTimelineGrid({
  day,
  assignments,
  employees,
  vehicles,
  sites,
  compact = false,
  minWidth = 1400,
  maxBodyHeight = 360,
  readOnly = false,
}: DayTimelineGridProps) {
  const [dragOver, setDragOver] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [isPending, startTransition] = useTransition();

  const dayStr = format(day, "yyyy-MM-dd");
  const dayAssignments = assignments.filter(
    (a) => format(new Date(a.date), "yyyy-MM-dd") === dayStr && a.employeeId
  );

  const hours = Array.from({ length: 25 }, (_, i) => i);
  const labelColWidth = compact ? "132px" : "56px";

  function handleDropOnTimeline(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const employeeId = e.dataTransfer.getData(DRAG_EMPLOYEE_TYPE);
    if (!employeeId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const startMinutes = minutesFromTimelineX(e.clientX, rect);
    const { startMinutes: start, endMinutes: end } = normalizeRange(
      startMinutes,
      startMinutes + DROP_DURATION_MINUTES
    );

    setPendingDrop({ employeeId, startMinutes: start, endMinutes: end });
  }

  function confirmDrop(siteId: string, vehicleId?: string | null) {
    if (!pendingDrop) return;
    startTransition(async () => {
      await createDragAssignment({
        employeeId: pendingDrop.employeeId,
        siteId,
        vehicleId,
        date: dayStr,
        startMinutes: pendingDrop.startMinutes,
        endMinutes: pendingDrop.endMinutes,
      });
      setPendingDrop(null);
    });
  }

  const lanes = new Map<string, AssignmentWithRelations[]>();
  for (const assignment of dayAssignments) {
    const key = assignment.employeeId ?? assignment.id;
    const list = lanes.get(key) ?? [];
    list.push(assignment);
    lanes.set(key, list);
  }

  const hourGrid = hours.map((hour) => (
    <div
      key={hour}
      className="pointer-events-none absolute top-0 h-full border-l border-flx-border-subtle"
      style={{ left: `${(hour / 24) * 100}%` }}
    />
  ));

  return (
    <>
      <div className="overflow-x-auto">
        <div style={{ minWidth }} className="px-3 py-2">
          <div
            className="mb-1 grid gap-2"
            style={{ gridTemplateColumns: `${labelColWidth} 1fr` }}
          >
            <div />
            <div className="relative h-5 border-b border-flx-border">
              {hours.map((hour) => (
                <span
                  key={hour}
                  className="absolute -translate-x-1/2 text-[10px] text-flx-muted-foreground"
                  style={{ left: `${(hour / 24) * 100}%` }}
                >
                  {String(hour).padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>

          <div
            className="overflow-y-auto pr-1"
            style={{ maxHeight: maxBodyHeight }}
          >
            {lanes.size === 0 && (
              <div
                onDragOver={
                  readOnly
                    ? undefined
                    : (e) => {
                        if (e.dataTransfer.types.includes(DRAG_EMPLOYEE_TYPE)) {
                          e.preventDefault();
                          setDragOver(true);
                        }
                      }
                }
                onDragLeave={readOnly ? undefined : () => setDragOver(false)}
                onDrop={
                  readOnly
                    ? undefined
                    : (e) => {
                        setDragOver(false);
                        handleDropOnTimeline(e);
                      }
                }
                className={cn(
                  "mb-2 rounded-lg border border-dashed py-6 text-center text-xs text-flx-muted",
                  dragOver
                    ? "border-flx-blue bg-flx-blue/10"
                    : "border-flx-border bg-flx-elevated"
                )}
                style={{ gridColumn: "1 / -1" }}
              >
                {readOnly
                  ? "Keine Einsätze an diesem Tag."
                  : "Mitarbeiter aus der linken Liste auf die Zeitleiste ziehen"}
              </div>
            )}

            {Array.from(lanes.entries()).map(([employeeId, items]) => {
              const employee =
                employees.find((e) => e.id === employeeId) ?? items[0].employee;

              return (
                <EmployeeTimelineRow
                  key={employeeId}
                  label={
                    employee
                      ? `${employee.firstName} ${employee.lastName}`
                      : "—"
                  }
                  subtitle={employee?.role}
                  avatar={
                    employee ? (
                      <EmployeeAvatar
                        firstName={employee.firstName}
                        lastName={employee.lastName}
                        photoUrl={employee.photoUrl}
                        size="sm"
                      />
                    ) : undefined
                  }
                  items={items}
                  hourGrid={hourGrid}
                  onDropEmployee={handleDropOnTimeline}
                  compact={compact}
                  readOnly={readOnly}
                />
              );
            })}

            {lanes.size > 0 && !readOnly && (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `${labelColWidth} 1fr` }}
              >
                <div className="text-[10px] text-flx-muted-foreground">+</div>
                <div
                  onDragOver={(e) => {
                    if (e.dataTransfer.types.includes(DRAG_EMPLOYEE_TYPE)) {
                      e.preventDefault();
                      setDragOver(true);
                    }
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    setDragOver(false);
                    handleDropOnTimeline(e);
                  }}
                  className={cn(
                    "relative rounded-lg border border-dashed",
                    compact ? "h-8" : "h-10",
                    dragOver
                      ? "border-flx-blue bg-flx-blue/10"
                      : "border-flx-border"
                  )}
                >
                  <p className="flex h-full items-center justify-center text-[10px] text-flx-muted">
                    Weiteren Mitarbeiter hierher ziehen
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SitePickerDialog
        open={!!pendingDrop}
        onOpenChange={(open) => !open && setPendingDrop(null)}
        sites={sites}
        vehicles={vehicles}
        title="Baustelle wählen"
        description="Baustelle und optional ein Fahrzeug für diesen Einsatz wählen."
        onConfirm={confirmDrop}
        isPending={isPending}
      />
    </>
  );
}
