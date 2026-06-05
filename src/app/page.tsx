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
import { getInitials } from "@/lib/utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const today = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de });

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
          accent="amber"
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
            <Button variant="ghost" size="sm" asChild>
              <Link href="/baustellen">
                Alle anzeigen
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.upcomingSites.length === 0 ? (
              <p className="text-sm text-stone-500">Keine Baustellen vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingSites.map((site) => (
                  <div
                    key={site.id}
                    className="flex items-center justify-between rounded-lg border border-stone-100 p-3"
                  >
                    <div>
                      <p className="font-medium text-stone-900">{site.name}</p>
                      <p className="text-xs text-stone-500">{site.address}</p>
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
          <Button variant="outline" size="sm" asChild>
            <Link href="/planung">Neue Zuweisung</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.todayAssignments.length === 0 ? (
            <p className="text-sm text-stone-500">
              Heute sind noch keine Einsätze geplant.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-stone-500">
                    <th className="pb-3 pr-4 font-medium">Baustelle</th>
                    <th className="pb-3 pr-4 font-medium">Mitarbeiter</th>
                    <th className="pb-3 pr-4 font-medium">Fahrzeug</th>
                    <th className="pb-3 font-medium">Notizen</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.todayAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-stone-100">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{assignment.site.name}</p>
                        <p className="text-xs text-stone-500">{assignment.site.address}</p>
                      </td>
                      <td className="py-3 pr-4">
                        {assignment.employee ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">
                              {getInitials(
                                assignment.employee.firstName,
                                assignment.employee.lastName
                              )}
                            </div>
                            <span>
                              {assignment.employee.firstName}{" "}
                              {assignment.employee.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-400">–</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {assignment.vehicle ? (
                          <span>
                            {assignment.vehicle.name}
                            <span className="ml-1 text-stone-400">
                              ({assignment.vehicle.licensePlate})
                            </span>
                          </span>
                        ) : (
                          <span className="text-stone-400">–</span>
                        )}
                      </td>
                      <td className="py-3 text-stone-500">
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
                  className="flex items-center justify-between rounded-lg border border-stone-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-700">
                      {getInitials(employee.firstName, employee.lastName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-xs text-stone-500">{employee.role}</p>
                    </div>
                  </div>
                  <StatusBadge type="employee" status={employee.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
