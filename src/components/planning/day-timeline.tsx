"use client";

import { useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type {
  Assignment,
  ConstructionSite,
  Employee,
  Vehicle,
} from "@prisma/client";
import {
  DROP_DURATION_MINUTES,
  minutesFromTimelineX,
  minutesToTime,
  normalizeRange,
} from "@/lib/planning-time";
import { createDragAssignment } from "@/lib/actions";
import { TimelineAssignmentBar } from "@/components/planning/timeline-assignment-bar";
import { SitePickerDialog } from "@/components/planning/site-picker-dialog";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { DRAG_EMPLOYEE_TYPE } from "@/components/planning/planning-constants";

type AssignmentWithRelations = Assignment & {
  employee: Employee | null;
  vehicle: Vehicle | null;
  site: ConstructionSite;
};

interface DayTimelineProps {
  day: Date;
  assignments: AssignmentWithRelations[];
  employees: Employee[];
  sites: ConstructionSite[];
}

interface PendingDrop {
  employeeId: string;
  startMinutes: number;
  endMinutes: number;
}

function TimelineRow({
  label,
  avatar,
  children,
  onDropEmployee,
  onDragOverChange,
}: {
  label: string;
  avatar?: React.ReactNode;
  children: React.ReactNode;
  onDropEmployee: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOverChange: (active: boolean) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-2 grid grid-cols-[56px_1fr] gap-2">
      <div className="flex flex-col items-center justify-center gap-1 text-center">
        {avatar}
        <span className="text-[10px] leading-tight text-stone-600">{label}</span>
      </div>
      <div
        ref={rowRef}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes(DRAG_EMPLOYEE_TYPE)) {
            e.preventDefault();
            onDragOverChange(true);
          }
        }}
        onDragLeave={() => onDragOverChange(false)}
        onDrop={(e) => {
          onDragOverChange(false);
          onDropEmployee(e);
        }}
        className="timeline-row relative h-12 rounded-lg bg-stone-50"
      >
        {children}
      </div>
    </div>
  );
}

export function DayTimeline({
  day,
  assignments,
  employees,
  sites,
}: DayTimelineProps) {
  const [dragOver, setDragOver] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastRowRef = useRef<HTMLDivElement>(null);

  const dayStr = format(day, "yyyy-MM-dd");
  const dayAssignments = assignments.filter(
    (a) => format(new Date(a.date), "yyyy-MM-dd") === dayStr && a.employeeId
  );

  const hours = Array.from({ length: 25 }, (_, i) => i);

  function getTimelineRect(): DOMRect | null {
    const row = document.querySelector(".timeline-row") as HTMLDivElement | null;
    return row?.getBoundingClientRect() ?? null;
  }

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

  function confirmDrop(siteId: string) {
    if (!pendingDrop) return;
    startTransition(async () => {
      await createDragAssignment({
        employeeId: pendingDrop.employeeId,
        siteId,
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
      className="pointer-events-none absolute top-0 h-full border-l border-stone-100"
      style={{ left: `${(hour / 24) * 100}%` }}
    />
  ));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <p className="text-sm text-stone-500">
          Ziehen Sie Mitarbeiter auf die Zeitleiste. Blöcke an den Rändern
          verlängern oder verkürzen, in der Mitte verschieben.
        </p>
        <div className="flex flex-wrap gap-2">
          {employees.map((employee) => (
            <div
              key={employee.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(DRAG_EMPLOYEE_TYPE, employee.id);
                e.dataTransfer.effectAllowed = "copy";
              }}
              className="flex cursor-grab items-center gap-2 rounded-full border border-stone-200 bg-white px-2 py-1 text-xs shadow-sm active:cursor-grabbing"
            >
              <EmployeeAvatar
                firstName={employee.firstName}
                lastName={employee.lastName}
                photoUrl={employee.photoUrl}
                size="sm"
              />
              <span>
                {employee.firstName} {employee.lastName}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <div className="min-w-[900px] p-4">
          <div className="mb-2 grid grid-cols-[56px_1fr] gap-2">
            <div />
            <div className="relative h-6 border-b border-stone-200">
              {hours.map((hour) => (
                <span
                  key={hour}
                  className="absolute -translate-x-1/2 text-[10px] text-stone-400"
                  style={{ left: `${(hour / 24) * 100}%` }}
                >
                  {String(hour).padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>

          {lanes.size === 0 && (
            <TimelineRow
              label="—"
              onDropEmployee={handleDropOnTimeline}
              onDragOverChange={setDragOver}
            >
              {hourGrid}
              <p className="flex h-full items-center justify-center text-xs text-stone-400">
                Mitarbeiter hierher ziehen
              </p>
            </TimelineRow>
          )}

          {Array.from(lanes.entries()).map(([employeeId, items]) => {
            const employee =
              employees.find((e) => e.id === employeeId) ?? items[0].employee;
            return (
              <TimelineRow
                key={employeeId}
                label={
                  employee
                    ? `${employee.firstName.charAt(0)}. ${employee.lastName}`
                    : "—"
                }
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
                onDropEmployee={handleDropOnTimeline}
                onDragOverChange={setDragOver}
              >
                {hourGrid}
                {items.map((assignment) => (
                  <TimelineAssignmentBar
                    key={assignment.id}
                    assignment={assignment}
                    getTimelineRect={getTimelineRect}
                  />
                ))}
              </TimelineRow>
            );
          })}

          {lanes.size > 0 && (
            <div className="grid grid-cols-[56px_1fr] gap-2">
              <div className="text-[10px] text-stone-400">+</div>
              <div
                ref={lastRowRef}
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
                className={`relative h-10 rounded-lg border border-dashed ${
                  dragOver
                    ? "border-amber-400 bg-amber-50"
                    : "border-stone-200"
                }`}
              >
                <p className="flex h-full items-center justify-center text-[10px] text-stone-400">
                  Weiteren Mitarbeiter hierher ziehen
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-stone-400">
        {format(day, "EEEE, d. MMMM yyyy", { locale: de })} · 00:00 bis 24:00 Uhr
        {pendingDrop && (
          <>
            {" "}
            · Neue Zuweisung: {minutesToTime(pendingDrop.startMinutes)} –{" "}
            {minutesToTime(pendingDrop.endMinutes)}
          </>
        )}
      </p>

      <SitePickerDialog
        open={!!pendingDrop}
        onOpenChange={(open) => !open && setPendingDrop(null)}
        sites={sites}
        title="Baustelle wählen"
        description="Wählen Sie die Baustelle für diesen Einsatz."
        onConfirm={confirmDrop}
        isPending={isPending}
      />
    </div>
  );
}
