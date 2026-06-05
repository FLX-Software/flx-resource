"use client";

import { useState } from "react";
import { Building2, MapPin, Pencil, Plus } from "lucide-react";
import type {
  ConstructionSite,
  Assignment,
  Employee,
  Vehicle,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/shared/modal";
import { StatusBadge } from "@/components/shared/status-badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { SiteForm } from "@/components/forms/site-form";
import { createSite, updateSite, deleteSite } from "@/lib/actions";
import { formatDate } from "@/lib/utils";

type SiteWithAssignments = ConstructionSite & {
  assignments: (Assignment & {
    employee: Employee | null;
    vehicle: Vehicle | null;
  })[];
};

interface SiteListProps {
  sites: SiteWithAssignments[];
}

export function SiteList({ sites }: SiteListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ConstructionSite | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Baustelle hinzufügen
        </Button>
      </div>

      <div className="space-y-4">
        {sites.map((site) => (
          <Card key={site.id}>
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-stone-900">
                        {site.name}
                      </h3>
                      <StatusBadge type="site" status={site.status} />
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {site.address}
                    </p>
                    {site.client && (
                      <p className="mt-1 text-sm text-stone-500">
                        Auftraggeber: {site.client}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-stone-400">
                      {formatDate(site.startDate)}
                      {site.endDate && ` – ${formatDate(site.endDate)}`}
                    </p>
                    {site.description && (
                      <p className="mt-2 text-sm text-stone-600">
                        {site.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(site)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteButton
                    action={deleteSite.bind(null, site.id)}
                    label="Baustelle löschen"
                  />
                </div>
              </div>

              {site.assignments.length > 0 && (
                <div className="rounded-lg border border-stone-100 bg-stone-50 p-4">
                  <p className="mb-3 text-sm font-medium text-stone-700">
                    Zugewiesene Ressourcen ({site.assignments.length})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {site.assignments.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-md bg-white p-3 text-sm shadow-sm"
                      >
                        <p className="font-medium text-stone-700">
                          {formatDate(a.date)}
                        </p>
                        {a.employee && (
                          <p className="text-stone-600">
                            👤 {a.employee.firstName} {a.employee.lastName}
                          </p>
                        )}
                        {a.vehicle && (
                          <p className="text-stone-600">
                            🚛 {a.vehicle.name}
                          </p>
                        )}
                        {a.notes && (
                          <p className="mt-1 text-xs text-stone-400">
                            {a.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {sites.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 p-12 text-center">
          <p className="text-stone-500">Noch keine Baustellen erfasst.</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            Erste Baustelle hinzufügen
          </Button>
        </div>
      )}

      <Modal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Neue Baustelle"
        description="Erfassen Sie eine neue Baustelle."
      >
        <SiteForm
          action={async (formData) => {
            await createSite(formData);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      {editing && (
        <Modal
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          title="Baustelle bearbeiten"
        >
          <SiteForm
            site={editing}
            action={async (formData) => {
              await updateSite(editing.id, formData);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  );
}
