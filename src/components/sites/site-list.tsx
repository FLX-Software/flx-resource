"use client";

import { useState } from "react";
import { Building2, MapPin, Pencil, Plus, Truck, User } from "lucide-react";
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
  isAdmin?: boolean;
}

export function SiteList({ sites, isAdmin = false }: SiteListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ConstructionSite | null>(null);

  return (
    <>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Baustelle hinzufügen
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {sites.map((site) => (
          <Card key={site.id}>
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-flx-blue/30 bg-flx-blue/10 text-flx-blue-light">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {site.name}
                      </h3>
                      <StatusBadge type="site" status={site.status} />
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-flx-muted">
                      <MapPin className="h-3.5 w-3.5" />
                      {site.address}
                    </p>
                    {site.client && (
                      <p className="mt-1 text-sm text-flx-muted">
                        Auftraggeber: {site.client}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-flx-muted-foreground">
                      {formatDate(site.startDate)}
                      {site.endDate && ` – ${formatDate(site.endDate)}`}
                    </p>
                    {site.description && (
                      <p className="mt-2 text-sm text-slate-300">
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
                <div className="rounded-lg border border-flx-border bg-flx-elevated/60 p-4">
                  <p className="mb-3 text-sm font-medium text-white">
                    Zugewiesene Ressourcen ({site.assignments.length})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {site.assignments.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-lg border border-flx-border-subtle bg-flx-card p-3 text-sm"
                      >
                        <p className="mb-2 font-medium text-flx-blue-light">
                          {formatDate(a.date)}
                        </p>
                        {a.employee && (
                          <p className="flex items-center gap-2 text-slate-300">
                            <User className="h-3.5 w-3.5 shrink-0 text-flx-muted" />
                            {a.employee.firstName} {a.employee.lastName}
                          </p>
                        )}
                        {a.vehicle && (
                          <p className="mt-1 flex items-center gap-2 text-slate-300">
                            <Truck className="h-3.5 w-3.5 shrink-0 text-flx-muted" />
                            {a.vehicle.name}
                          </p>
                        )}
                        {a.notes && (
                          <p className="mt-2 border-t border-flx-border-subtle pt-2 text-xs text-flx-muted">
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
        <div className="rounded-xl border border-dashed border-flx-border p-12 text-center">
          <p className="text-flx-muted">Noch keine Baustellen erfasst.</p>
          {isAdmin && (
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              Erste Baustelle hinzufügen
            </Button>
          )}
        </div>
      )}

      {isAdmin && (
        <>
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
      )}
    </>
  );
}
