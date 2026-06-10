import { PageHeader } from "@/components/layout/page-header";
import { PlanningBoard } from "@/components/planning/planning-board";
import {
  getAssignmentsForWeek,
  getAvailableResources,
  getPlanningEmployees,
} from "@/lib/data";

interface PlanungPageProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function PlanungPage({ searchParams }: PlanungPageProps) {
  const params = await searchParams;
  const weekDate = params.week ? new Date(params.week) : new Date();
  const [employees, resources, assignments] = await Promise.all([
    getPlanningEmployees(),
    getAvailableResources(weekDate),
    getAssignmentsForWeek(weekDate),
  ]);

  return (
    <div>
      <PageHeader
        title="Planung"
        description="Wochenplan mit Drag & Drop und stundenweiser Tagesplanung."
      />
      <PlanningBoard
        employees={employees}
        vehicles={resources.vehicles}
        sites={resources.sites}
        assignments={assignments}
        defaultDate={weekDate}
      />
    </div>
  );
}
