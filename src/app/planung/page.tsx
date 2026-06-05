import { PageHeader } from "@/components/layout/page-header";
import { PlanningBoard } from "@/components/planning/planning-board";
import { getAvailableResources, getAssignmentsForWeek } from "@/lib/data";

export default async function PlanungPage() {
  const today = new Date();
  const [resources, assignments] = await Promise.all([
    getAvailableResources(today),
    getAssignmentsForWeek(today),
  ]);

  return (
    <div>
      <PageHeader
        title="Planung"
        description="Weisen Sie Mitarbeiter und Fahrzeuge Baustellen zu."
      />
      <PlanningBoard
        employees={resources.employees}
        vehicles={resources.vehicles}
        sites={resources.sites}
        assignments={assignments}
        defaultDate={today}
      />
    </div>
  );
}
