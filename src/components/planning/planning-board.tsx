"use client";

import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { de } from "date-fns/locale";
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
import { Plus } from "lucide-react";
import { createAssignment, deleteAssignment } from "@/lib/actions";
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

export function PlanningBoard({
  employees,
  vehicles,
  sites,
  assignments,
  defaultDate,
}: PlanningBoardProps) {
  const [showAssign, setShowAssign] = useState(false);

  const weekStart = startOfWeek(defaultDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const assignmentsByDay = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return {
      day,
      assignments: assignments.filter(
        (a) => format(new Date(a.date), "yyyy-MM-dd") === dayStr
      ),
    };
  });

  return (
    <>
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Verfügbare Mitarbeiter ({employees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {employees.length === 0 ? (
                <p className="text-sm text-stone-500">Keine verfügbar</p>
              ) : (
                employees.map((e) => (
                  <p key={e.id} className="text-sm text-stone-700">
                    {e.firstName} {e.lastName}
                    <span className="text-stone-400"> · {e.role}</span>
                  </p>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Verfügbare Fahrzeuge ({vehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {vehicles.length === 0 ? (
                <p className="text-sm text-stone-500">Keine verfügbar</p>
              ) : (
                vehicles.map((v) => (
                  <p key={v.id} className="text-sm text-stone-700">
                    {v.name}
                    <span className="text-stone-400"> · {v.licensePlate}</span>
                  </p>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Neue Zuweisung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-stone-500">
              Weisen Sie Mitarbeiter und/oder Fahrzeuge einer Baustelle zu.
            </p>
            <Button onClick={() => setShowAssign(true)} className="w-full">
              <Plus className="h-4 w-4" />
              Zuweisung erstellen
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Wochenplan{" "}
            <span className="text-base font-normal text-stone-500">
              ({format(weekStart, "d. MMM", { locale: de })} –{" "}
              {format(addDays(weekStart, 4), "d. MMM yyyy", { locale: de })})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-5">
            {assignmentsByDay.map(({ day, assignments: dayAssignments }) => (
              <div
                key={day.toISOString()}
                className="rounded-lg border border-stone-200 bg-stone-50 p-3"
              >
                <p className="mb-3 text-sm font-semibold text-stone-800">
                  {format(day, "EEEE", { locale: de })}
                  <span className="block text-xs font-normal text-stone-500">
                    {formatDate(day)}
                  </span>
                </p>

                {dayAssignments.length === 0 ? (
                  <p className="text-xs text-stone-400">Keine Einsätze</p>
                ) : (
                  <div className="space-y-2">
                    {dayAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-md bg-white p-2.5 text-xs shadow-sm"
                      >
                        <p className="font-medium text-amber-800">
                          {a.site.name}
                        </p>
                        {a.employee && (
                          <p className="mt-1 text-stone-600">
                            👤 {a.employee.firstName} {a.employee.lastName}
                          </p>
                        )}
                        {a.vehicle && (
                          <p className="text-stone-600">🚛 {a.vehicle.name}</p>
                        )}
                        {a.notes && (
                          <p className="mt-1 text-stone-400">{a.notes}</p>
                        )}
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
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal
        open={showAssign}
        onOpenChange={setShowAssign}
        title="Ressourcen zuweisen"
        description="Wählen Sie Baustelle, Datum und Ressourcen."
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
