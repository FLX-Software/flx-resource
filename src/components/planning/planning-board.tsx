"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from "lucide-react";
import type {
  ConstructionSite,
  Employee,
  Vehicle,
  Assignment,
} from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/shared/modal";
import { AssignmentForm } from "@/components/forms/assignment-form";
import { DeleteButton } from "@/components/shared/delete-button";
import { Button } from "@/components/ui/button";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { DayTimeline } from "@/components/planning/day-timeline";
import { SitePickerDialog } from "@/components/planning/site-picker-dialog";
import { DRAG_EMPLOYEE_TYPE } from "@/components/planning/planning-constants";
import {
  createAssignment,
  createDragAssignment,
  deleteAssignment,
} from "@/lib/actions";
import {
  DEFAULT_END_MINUTES,
  DEFAULT_START_MINUTES,
  formatTimeRange,
} from "@/lib/planning-time";
import { formatDate } from "@/lib/utils";

type AssignmentWithRelations = Assignment & {
  employee: Employee | null;
  vehicle: Vehicle | null;
  site: ConstructionSite;
};

interface PlanningBoardProps {
  employees: Employee[];
  vehicles: Vehicle[];
  sites: ConstructionSite[];
  assignments: AssignmentWithRelations[];
  defaultDate: Date;
}

interface PendingDayDrop {
  employeeId: string;
  date: Date;
}

export function PlanningBoard({
  employees,
  vehicles,
  sites,
  assignments,
  defaultDate,
}: PlanningBoardProps) {
  const router = useRouter();
  const [showAssign, setShowAssign] = useState(false);
  const [openDay, setOpenDay] = useState<Date | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [pendingDayDrop, setPendingDayDrop] = useState<PendingDayDrop | null>(null);
  const [isPending, startTransition] = useTransition();

  const weekStart = startOfWeek(defaultDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(defaultDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const assignmentsByDay = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return {
      day,
      assignments: assignments.filter(
        (a) => format(new Date(a.date), "yyyy-MM-dd") === dayStr
      ),
    };
  });

  function navigateWeek(offset: number) {
    const next = offset > 0 ? addWeeks(weekStart, 1) : subWeeks(weekStart, 1);
    router.push(`/planung?week=${format(next, "yyyy-MM-dd")}`);
  }

  function handleDayDrop(e: React.DragEvent, day: Date) {
    e.preventDefault();
    setDragOverDay(null);
    const employeeId = e.dataTransfer.getData(DRAG_EMPLOYEE_TYPE);
    if (!employeeId) return;
    setPendingDayDrop({ employeeId, date: day });
  }

  function confirmDayDrop(siteId: string) {
    if (!pendingDayDrop) return;
    startTransition(async () => {
      await createDragAssignment({
        employeeId: pendingDayDrop.employeeId,
        siteId,
        date: format(pendingDayDrop.date, "yyyy-MM-dd"),
        startMinutes: DEFAULT_START_MINUTES,
        endMinutes: DEFAULT_END_MINUTES,
      });
      setPendingDayDrop(null);
    });
  }

  return (
    <>
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Mitarbeiter ({employees.length}) – in Tage ziehen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {employees.length === 0 ? (
                <p className="text-sm text-stone-500">Keine Mitarbeiter verfügbar</p>
              ) : (
                employees.map((employee) => (
                  <div
                    key={employee.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(DRAG_EMPLOYEE_TYPE, employee.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className="flex cursor-grab items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm active:cursor-grabbing"
                  >
                    <EmployeeAvatar
                      firstName={employee.firstName}
                      lastName={employee.lastName}
                      photoUrl={employee.photoUrl}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-stone-800">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-xs text-stone-500">{employee.role}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Manuelle Zuweisung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-stone-500">
              Alternativ Mitarbeiter, Fahrzeug und Zeiten per Formular zuweisen.
            </p>
            <Button onClick={() => setShowAssign(true)} className="w-full">
              <Plus className="h-4 w-4" />
              Zuweisung erstellen
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-amber-700" />
            Wochenplan
            <span className="text-base font-normal text-stone-500">
              ({format(weekStart, "d. MMM", { locale: de })} –{" "}
              {format(weekEnd, "d. MMM yyyy", { locale: de })})
            </span>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
              Vorherige
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/planung")}
            >
              Heute
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
              Nächste
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
            {assignmentsByDay.map(({ day, assignments: dayAssignments }) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const isToday = dayStr === format(new Date(), "yyyy-MM-dd");
              return (
                <div
                  key={dayStr}
                  onDragOver={(e) => {
                    if (e.dataTransfer.types.includes(DRAG_EMPLOYEE_TYPE)) {
                      e.preventDefault();
                      setDragOverDay(dayStr);
                    }
                  }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={(e) => handleDayDrop(e, day)}
                  className={`flex min-h-[220px] flex-col rounded-lg border p-3 transition-colors ${
                    dragOverDay === dayStr
                      ? "border-amber-400 bg-amber-50"
                      : isToday
                        ? "border-amber-300 bg-amber-50/40"
                        : "border-stone-200 bg-stone-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDay(day)}
                    className="mb-3 w-full rounded-md text-left hover:bg-white/60"
                  >
                    <p className="text-sm font-semibold text-stone-800">
                      {format(day, "EEEE", { locale: de })}
                    </p>
                    <span className="text-xs text-stone-500">{formatDate(day)}</span>
                    <span className="mt-1 block text-[10px] font-medium text-amber-700">
                      Tagesansicht öffnen →
                    </span>
                  </button>

                  {dayAssignments.length === 0 ? (
                    <p className="flex flex-1 items-center justify-center text-xs text-stone-400">
                      Mitarbeiter hierher ziehen
                    </p>
                  ) : (
                    <div className="flex-1 space-y-2">
                      {dayAssignments.map((a) => (
                        <div
                          key={a.id}
                          className="rounded-md bg-white p-2 text-xs shadow-sm"
                        >
                          <p className="font-medium text-amber-800">{a.site.name}</p>
                          {a.employee && (
                            <p className="mt-1 text-stone-600">
                              {a.employee.firstName} {a.employee.lastName}
                            </p>
                          )}
                          {a.vehicle && (
                            <p className="text-stone-600">🚛 {a.vehicle.name}</p>
                          )}
                          <p className="mt-1 text-stone-400">
                            {formatTimeRange(a.startMinutes, a.endMinutes)}
                          </p>
                          <div className="mt-2 flex justify-end">
                            <DeleteButton
                              action={deleteAssignment.bind(null, a.id)}
                              label="Zuweisung löschen"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {openDay && (
        <Modal
          open={!!openDay}
          onOpenChange={(open) => !open && setOpenDay(null)}
          title={`Tagesplanung – ${format(openDay, "EEEE, d. MMMM", { locale: de })}`}
          description="24-Stunden-Zeitleiste mit stundenweiser Zuweisung."
          className="max-w-6xl"
        >
          <DayTimeline
            day={openDay}
            assignments={assignments}
            employees={employees}
            sites={sites}
          />
        </Modal>
      )}

      <SitePickerDialog
        open={!!pendingDayDrop}
        onOpenChange={(open) => !open && setPendingDayDrop(null)}
        sites={sites}
        title="Baustelle wählen"
        description="Standardzeit: 08:00 – 17:00 Uhr. In der Tagesansicht können Sie die Dauer anpassen."
        onConfirm={confirmDayDrop}
        isPending={isPending}
      />

      <Modal
        open={showAssign}
        onOpenChange={setShowAssign}
        title="Ressourcen zuweisen"
        description="Wählen Sie Baustelle, Datum, Zeiten und Ressourcen."
      >
        <AssignmentForm
          employees={employees}
          vehicles={vehicles}
          sites={sites}
          defaultDate={defaultDate}
          action={async (formData) => {
            await createAssignment(formData);
            setShowAssign(false);
          }}
        />
      </Modal>
    </>
  );
}
