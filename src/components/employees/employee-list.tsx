"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import type { Employee, Assignment, ConstructionSite } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/shared/modal";
import { StatusBadge } from "@/components/shared/status-badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { EmployeeForm } from "@/components/forms/employee-form";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/actions";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { formatTimeRange } from "@/lib/planning-time";
import { formatDate } from "@/lib/utils";

type EmployeeWithAssignments = Employee & {
  assignments: (Assignment & { site: ConstructionSite })[];
};

interface EmployeeListProps {
  employees: EmployeeWithAssignments[];
}

export function EmployeeList({ employees }: EmployeeListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Mitarbeiter hinzufügen
        </Button>
      </div>

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
                  />
                  <div>
                    <p className="font-semibold text-stone-900">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-sm text-stone-500">{employee.role}</p>
                  </div>
                </div>
                <StatusBadge type="employee" status={employee.status} />
              </div>

              <div className="mb-4 space-y-1 text-sm text-stone-600">
                {employee.phone && <p>📞 {employee.phone}</p>}
                {employee.email && <p>✉️ {employee.email}</p>}
                {employee.skills && (
                  <p className="text-xs text-stone-500">{employee.skills}</p>
                )}
              </div>

              {employee.assignments.length > 0 && (
                <div className="mb-4 rounded-lg bg-stone-50 p-3">
                  <p className="mb-2 text-xs font-medium text-stone-500">
                    Kommende Einsätze
                  </p>
                  {employee.assignments.map((a) => (
                    <p key={a.id} className="text-xs text-stone-600">
                      {formatDate(a.date)} · {formatTimeRange(a.startMinutes, a.endMinutes)} – {a.site.name}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-1">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 p-12 text-center">
          <p className="text-stone-500">Noch keine Mitarbeiter erfasst.</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            Ersten Mitarbeiter hinzufügen
          </Button>
        </div>
      )}

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
    </>
  );
}
