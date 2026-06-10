"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Pencil, Plus, Thermometer } from "lucide-react";
import type { Employee, Assignment, ConstructionSite } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/shared/modal";
import { StatusBadge } from "@/components/shared/status-badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { EmployeeForm } from "@/components/forms/employee-form";
import { SickLeaveForm } from "@/components/forms/sick-leave-form";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  reportEmployeeSickLeave,
  endEmployeeSickLeave,
} from "@/lib/actions";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { formatTimeRange } from "@/lib/planning-time";
import { formatDate } from "@/lib/utils";

type EmployeeWithAssignments = Employee & {
  assignments: (Assignment & { site: ConstructionSite })[];
};

interface EmployeeListProps {
  employees: EmployeeWithAssignments[];
  isAdmin?: boolean;
}

export function EmployeeList({ employees, isAdmin = false }: EmployeeListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [sickLeaveEmployee, setSickLeaveEmployee] = useState<Employee | null>(null);
  const [isEndingSick, startEndSick] = useTransition();

  return (
    <>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Mitarbeiter hinzufügen
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <EmployeeAvatar
                    firstName={employee.firstName}
                    lastName={employee.lastName}
                    photoUrl={employee.photoUrl}
                    size="lg"
                  />
                  <div>
                    <p className="font-semibold text-white">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-sm text-flx-muted">{employee.role}</p>
                  </div>
                </div>
                <StatusBadge type="employee" status={employee.status} />
              </div>

              {employee.status === "SICK" && employee.sickUntil && (
                <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  Krank bis einschließlich{" "}
                  {format(new Date(employee.sickUntil), "d. MMMM yyyy", { locale: de })}
                </p>
              )}

              <div className="mb-4 space-y-1 text-sm text-slate-300">
                {employee.phone && <p>📞 {employee.phone}</p>}
                {employee.email && <p>✉️ {employee.email}</p>}
                {employee.skills && (
                  <p className="text-xs text-flx-muted">{employee.skills}</p>
                )}
              </div>

              {employee.assignments.length > 0 && (
                <div className="mb-4 rounded-lg bg-flx-elevated p-3">
                  <p className="mb-2 text-xs font-medium text-flx-muted">
                    Kommende Einsätze
                  </p>
                  {employee.assignments.map((a) => (
                    <p key={a.id} className="text-xs text-slate-300">
                      {formatDate(a.date)} · {formatTimeRange(a.startMinutes, a.endMinutes)} – {a.site.name}
                    </p>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div className="flex flex-wrap justify-end gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSickLeaveEmployee(employee)}
                  >
                    <Thermometer className="h-4 w-4" />
                    Krankmeldung
                  </Button>
                  {employee.status === "SICK" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-400 hover:text-emerald-300"
                      disabled={isEndingSick}
                      onClick={() =>
                        startEndSick(async () => {
                          await endEmployeeSickLeave(employee.id);
                        })
                      }
                    >
                      Gesund melden
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(employee)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteButton
                    action={deleteEmployee.bind(null, employee.id)}
                    label="Mitarbeiter löschen"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="rounded-xl border border-dashed border-flx-border p-12 text-center">
          <p className="text-flx-muted">Noch keine Mitarbeiter erfasst.</p>
          {isAdmin && (
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              Ersten Mitarbeiter hinzufügen
            </Button>
          )}
        </div>
      )}

      {isAdmin && (
        <>
          <Modal
            open={showCreate}
            onOpenChange={setShowCreate}
            title="Neuer Mitarbeiter"
            description="Erfassen Sie einen neuen Mitarbeiter."
          >
            <EmployeeForm
              action={createEmployee}
              onSuccess={() => setShowCreate(false)}
              onCancel={() => setShowCreate(false)}
            />
          </Modal>

          {editing && (
            <Modal
              open={!!editing}
              onOpenChange={(open) => !open && setEditing(null)}
              title="Mitarbeiter bearbeiten"
            >
              <EmployeeForm
                employee={editing}
                action={updateEmployee.bind(null, editing.id)}
                onSuccess={() => setEditing(null)}
                onCancel={() => setEditing(null)}
              />
            </Modal>
          )}

          {sickLeaveEmployee && (
            <Modal
              open={!!sickLeaveEmployee}
              onOpenChange={(open) => !open && setSickLeaveEmployee(null)}
              title="Krankmeldung"
              description="Tragen Sie ein, bis wann die Person krankgemeldet ist."
            >
              <SickLeaveForm
                employee={sickLeaveEmployee}
                action={reportEmployeeSickLeave.bind(null, sickLeaveEmployee.id)}
                onSuccess={() => setSickLeaveEmployee(null)}
                onCancel={() => setSickLeaveEmployee(null)}
              />
            </Modal>
          )}
        </>
      )}
    </>
  );
}
