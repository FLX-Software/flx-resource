import { PageHeader } from "@/components/layout/page-header";
import { PlanningBoard } from "@/components/planning/planning-board";
import {
  getAssignmentsForWeek,
  getAvailableResources,
  getPlanningEmployees,
  getPlanningVehicles,
} from "@/lib/data";
import { getSession, isAdmin } from "@/lib/session";

interface PlanungPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function PlanungPage({ searchParams }: PlanungPageProps) {
  const params = await searchParams;
  const session = await getSession();
  const admin = isAdmin(session);
  const weekDate = params.week ? new Date(params.week) : new Date();

  const [employees, vehicles, resources, assignments] = await Promise.all([
    getPlanningEmployees(),
    getPlanningVehicles(),
    getAvailableResources(weekDate),
    getAssignmentsForWeek(weekDate),
  ]);

  return (
    <div>
      <PageHeader
        title="Planung"
        description={
          admin
            ? "Wochenplan mit Drag & Drop – Mitarbeiter, Fahrzeuge und Zeiten."
            : "Wochenübersicht aller Einsätze (nur Ansicht)."
        }
      />
      <PlanningBoard
        employees={employees}
        vehicles={vehicles}
        sites={resources.sites}
        assignments={assignments}
        defaultDate={weekDate}
        readOnly={!admin}
      />
    </div>
  );
}
