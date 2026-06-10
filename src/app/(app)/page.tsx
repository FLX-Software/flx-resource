import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Users,
  Truck,
  Building2,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { UtilizationBar } from "@/components/dashboard/utilization-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { getDashboardStats } from "@/lib/data";
import { getSession, isAdmin } from "@/lib/session";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { formatTimeRange } from "@/lib/planning-time";

export default async function DashboardPage() {
  const [stats, session] = await Promise.all([getDashboardStats(), getSession()]);
  const admin = isAdmin(session);
  const today = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de });

  if (stats.isEmployeeView) {
    return (
      <div>
        <PageHeader
          title="Meine Übersicht"
          description={`Ihre Einsätze für ${today}`}
        >
          <Button asChild>
            <Link href="/planung">
              <CalendarDays className="h-4 w-4" />
              Zur Planung
            </Link>
          </Button>
        </PageHeader>

        {stats.myEmployee && (
          <Card className="mb-6">
            <CardContent className="flex items-center gap-4 p-6">
              <EmployeeAvatar
                firstName={stats.myEmployee.firstName}
                lastName={stats.myEmployee.lastName}
                photoUrl={stats.myEmployee.photoUrl}
                size="lg"
              />
              <div>
                <p className="text-lg font-semibold text-white">
                  {stats.myEmployee.firstName} {stats.myEmployee.lastName}
                </p>
                <p className="text-sm text-flx-muted">{stats.myEmployee.role}</p>
                <div className="mt-2">
                  <StatusBadge type="employee" status={stats.myEmployee.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Meine Einsätze heute</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.todayAssignments.length === 0 ? (
              <p className="text-sm text-flx-muted">
                Heute sind keine Einsätze für Sie geplant.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.todayAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-lg border border-flx-border-subtle bg-flx-elevated p-4"
                  >
                    <p className="font-medium text-flx-blue-light">
                      {assignment.site.name}
                    </p>
                    <p className="text-sm text-flx-muted">{assignment.site.address}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      {formatTimeRange(assignment.startMinutes, assignment.endMinutes)}
                    </p>
                    {assignment.vehicle && (
                      <p className="mt-1 text-sm text-slate-300">
                        Fahrzeug: {assignment.vehicle.name} ({assignment.vehicle.licensePlate})
                      </p>
                    )}
                    {assignment.notes && (
                      <p className="mt-2 text-xs text-flx-muted">{assignment.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Übersicht für ${today}`}
      >
        <Button asChild>
          <Link href="/planung">
            <CalendarDays className="h-4 w-4" />
            Zur Planung
          </Link>
        </Button>
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Mitarbeiter verfügbar"
          value={stats.availableEmployees}
          subtitle={`von ${stats.totalEmployees} gesamt`}
          icon={Users}
          accent="emerald"
        />
        <StatCard
          title="Fahrzeuge verfügbar"
          value={stats.availableVehicles}
          subtitle={`von ${stats.totalVehicles} gesamt`}
          icon={Truck}
          accent="blue"
        />
        <StatCard
          title="Aktive Baustellen"
          value={stats.activeSites}
          icon={Building2}
          accent="blue"
        />
        <StatCard
          title="Einsätze heute"
          value={stats.todayAssignments.length}
          icon={CalendarDays}
          accent="slate"
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Auslastung heute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <UtilizationBar
              label="Mitarbeiter"
              value={stats.employeeUtilization}
              available={stats.availableEmployees}
              total={stats.totalEmployees}
            />
            <UtilizationBar
              label="Fahrzeuge"
              value={stats.vehicleUtilization}
              available={stats.availableVehicles}
              total={stats.totalVehicles}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Aktuelle Baustellen</CardTitle>
            {admin && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/baustellen">
                  Alle anzeigen
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {stats.upcomingSites.length === 0 ? (
              <p className="text-sm text-flx-muted">Keine Baustellen vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingSites.map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between rounded-lg border border-flx-border-subtle p-3"
                  >
                    <div>
                      <p className="font-medium text-white">{site.name}</p>
                      <p className="text-xs text-flx-muted">{site.address}</p>
                    </div>
                    <StatusBadge type="site" status={site.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Heutige Einsätze</CardTitle>
          {admin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/planung">Neue Zuweisung</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {stats.todayAssignments.length === 0 ? (
            <p className="text-sm text-flx-muted">
              Heute sind noch keine Einsätze geplant.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-flx-border text-left text-flx-muted">
                    <th className="pb-3 pr-4 font-medium">Baustelle</th>
                    <th className="pb-3 pr-4 font-medium">Mitarbeiter</th>
                    <th className="pb-3 pr-4 font-medium">Fahrzeug</th>
                    <th className="pb-3 pr-4 font-medium">Zeit</th>
                    <th className="pb-3 font-medium">Notizen</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.todayAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-flx-border-subtle">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{assignment.site.name}</p>
                        <p className="text-xs text-flx-muted">{assignment.site.address}</p>
                      </td>
                      <td className="py-3 pr-4">
                        {assignment.employee ? (
                          <div className="flex items-center gap-2">
                            <EmployeeAvatar
                              firstName={assignment.employee.firstName}
                              lastName={assignment.employee.lastName}
                              photoUrl={assignment.employee.photoUrl}
                              size="sm"
                            />
                            <span>
                              {assignment.employee.firstName}{" "}
                              {assignment.employee.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-flx-muted-foreground">–</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {assignment.vehicle ? (
                          <span>
                            {assignment.vehicle.name}
                            <span className="ml-1 text-flx-muted-foreground">
                              ({assignment.vehicle.licensePlate})
                            </span>
                          </span>
                        ) : (
                          <span className="text-flx-muted-foreground">–</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-flx-muted">
                        {formatTimeRange(assignment.startMinutes, assignment.endMinutes)}
                      </td>
                      <td className="py-3 text-flx-muted">
                        {assignment.notes || "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {admin && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Mitarbeiter-Verfügbarkeit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between rounded-lg border border-flx-border-subtle p-3"
                  >
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar
                        firstName={employee.firstName}
                        lastName={employee.lastName}
                        photoUrl={employee.photoUrl}
                        size="sm"
                        className="bg-flx-elevated text-slate-200"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-xs text-flx-muted">{employee.role}</p>
                      </div>
                    </div>
                    <StatusBadge type="employee" status={employee.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
